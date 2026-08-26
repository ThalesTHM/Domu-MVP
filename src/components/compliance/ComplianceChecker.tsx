'use client';

import { useState } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, Calendar, Clock, MapPin,
} from 'lucide-react';
import {
  getClients, getPolicy, checkCallingWindow, getQAIssues, getClient,
} from '@/lib/data';
import type { CallingPolicy } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// ─── Static helpers ────────────────────────────────────────────────────────────

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HOLIDAY_NAMES: Record<string, string> = {
  '2026-01-01': "New Year's Day",
  '2026-02-16': 'Carnival (Monday)',
  '2026-02-17': 'Carnival (Tuesday)',
  '2026-04-03': 'Good Friday',
  '2026-04-21': 'Tiradentes',
  '2026-05-01': 'Labour Day',
  '2026-06-04': 'Corpus Christi',
  '2026-09-07': 'Independence Day',
  '2026-10-12': 'Our Lady of Aparecida',
  '2026-11-02': "All Souls' Day",
  '2026-11-15': 'Proclamation of the Republic',
  '2026-12-25': 'Christmas',
};

// Timezone-to-offset mapping (demo-scope: Brazil only)
const TZ_OFFSETS: Record<string, string> = {
  'America/Sao_Paulo': '-03:00',
};

function fmtDays(days: number[]): string {
  const s = [...days].sort((a, b) => a - b);
  const consecutive = s.every((d, i) => i === 0 || d === s[i - 1] + 1);
  return consecutive
    ? `${DAY_ABBR[s[0]]} – ${DAY_ABBR[s[s.length - 1]]}`
    : s.map((d) => DAY_ABBR[d]).join(', ');
}

type Verdict = 'allowed' | 'blocked' | 'holiday' | 'requires_review';

interface CheckResult {
  verdict: Verdict;
  reason: string;
  clientId: string;
  date: string;
  time: string;
}

const EXAMPLES = [
  { label: 'Beta Bank — after hours',          clientId: 'client-bb', date: '2026-08-24', time: '20:52' },
  { label: 'Delta Finance — end of window',    clientId: 'client-df', date: '2026-08-26', time: '17:50' },
  { label: 'Alpha Financial — business hours', clientId: 'client-af', date: '2026-08-26', time: '14:30' },
  { label: 'Independence Day (holiday)',       clientId: 'client-bb', date: '2026-09-07', time: '10:00' },
  { label: 'Sunday — day not permitted',       clientId: 'client-gc', date: '2026-08-30', time: '11:00' },
] as const;

const VERDICT_CONFIG = {
  allowed: {
    icon:  <CheckCircle  className="size-6 text-emerald-400" />,
    label: 'ALLOWED',
    cls:   'border-emerald-500/30 bg-emerald-500/8',
    text:  'text-emerald-400',
  },
  blocked: {
    icon:  <XCircle      className="size-6 text-destructive" />,
    label: 'BLOCKED',
    cls:   'border-destructive/30 bg-destructive/8',
    text:  'text-destructive',
  },
  holiday: {
    icon:  <Calendar     className="size-6 text-amber-400" />,
    label: 'HOLIDAY',
    cls:   'border-amber-500/30 bg-amber-500/8',
    text:  'text-amber-400',
  },
  requires_review: {
    icon:  <AlertTriangle className="size-6 text-amber-400" />,
    label: 'REQUIRES REVIEW',
    cls:   'border-amber-500/30 bg-amber-500/8',
    text:  'text-amber-400',
  },
} as const;

// ─── Core check logic (deterministic, no AI) ──────────────────────────────────

function performCheck(clientId: string, date: string, time: string): CheckResult {
  const policy = getPolicy(clientId);
  if (!policy) {
    return { verdict: 'blocked', reason: 'No calling policy configured for this client.', clientId, date, time };
  }

  const offset  = TZ_OFFSETS[policy.timezone] ?? '-03:00';
  const iso     = `${date}T${time}:00${offset}`;
  const raw     = checkCallingWindow(clientId, iso);

  // Not allowed → determine specific reason
  if (!raw.allowed) {
    const reason = raw.reason ?? 'Call is outside the permitted calling window.';
    const verdict: Verdict = reason.toLowerCase().includes('holiday') ? 'holiday' : 'blocked';
    return { verdict, reason, clientId, date, time };
  }

  // Allowed — check if within 15 minutes of the end boundary
  const [endH, endM] = policy.allowedEnd.split(':').map(Number);
  const [reqH, reqM] = time.split(':').map(Number);
  const minsToEnd    = endH * 60 + endM - (reqH * 60 + reqM);

  if (minsToEnd >= 0 && minsToEnd <= 15) {
    return {
      verdict: 'requires_review',
      reason: `${time} local time is ${minsToEnd} minute${minsToEnd === 1 ? '' : 's'} before the permitted end time of ${policy.allowedEnd}. A call initiated now may extend beyond the permitted window — human review recommended.`,
      clientId, date, time,
    };
  }

  return {
    verdict: 'allowed',
    reason: `${time} local time is within the permitted calling window (${policy.allowedStart}–${policy.allowedEnd}, ${fmtDays(policy.allowedDays)}).`,
    clientId, date, time,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const SELECT_CLS =
  'h-8 rounded-md border border-border bg-card px-2.5 text-sm text-foreground ' +
  'focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer';

const INPUT_CLS =
  'h-8 rounded-md border border-border bg-card px-3 text-sm text-foreground ' +
  'focus:outline-none focus:ring-1 focus:ring-ring';

export function ComplianceChecker() {
  const clients = getClients();

  // Pre-fill the out-of-hours Beta Bank scenario so the demo opens ready
  const [clientId, setClientId] = useState('client-bb');
  const [date,     setDate]     = useState('2026-08-24');
  const [time,     setTime]     = useState('20:52');
  const [result,   setResult]   = useState<CheckResult | null>(null);

  const policy = getPolicy(clientId);
  const client = getClient(clientId);

  function runCheck() {
    setResult(performCheck(clientId, date, time));
  }

  function applyExample(ex: typeof EXAMPLES[number]) {
    setClientId(ex.clientId);
    setDate(ex.date);
    setTime(ex.time);
    setResult(null); // clear previous result so user clicks Check Now
  }

  // Compliance incidents from seed data (category = compliance_concern)
  const complianceIssues = getQAIssues({ category: 'compliance_concern' });

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* ── Left: Checker form + Result ─────────────────────────────────────── */}
      <div className="col-span-5 space-y-4">

        {/* Form */}
        <Card>
          <CardContent className="px-5 py-4 space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Compliance Check
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => { setClientId(e.target.value); setResult(null); }}
                  className={SELECT_CLS + ' w-full'}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setResult(null); }}
                    className={INPUT_CLS + ' w-full'}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Local Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => { setTime(e.target.value); setResult(null); }}
                    className={INPUT_CLS + ' w-full'}
                  />
                </div>
              </div>
            </div>

            <Button onClick={runCheck} size="sm" className="w-full">
              Check Now
            </Button>

            <div>
              <p className="text-xs text-muted-foreground/60 mb-2">Quick scenarios:</p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    className="text-xs text-muted-foreground border border-border rounded px-2 py-1 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (() => {
          const cfg = VERDICT_CONFIG[result.verdict];
          return (
            <div className={`rounded-lg border px-5 py-5 ${cfg.cls}`}>
              <div className="flex items-center gap-3 mb-3">
                {cfg.icon}
                <span className={`text-2xl font-bold tracking-tight font-mono ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{result.reason}</p>
              <p className="text-xs text-muted-foreground/50 mt-3 font-mono">
                Checked: {result.date} {result.time} · {client?.name ?? result.clientId}
              </p>
            </div>
          );
        })()}

        {/* Known compliance incidents */}
        {complianceIssues.length > 0 && (
          <Card>
            <CardContent className="px-5 py-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Compliance Incidents — This Period
              </h2>
              <div className="space-y-2.5">
                {complianceIssues.map((issue) => {
                  const issueClient = getClient(issue.clientId);
                  return (
                    <div key={issue.id} className="border-l-2 border-destructive/40 pl-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{issue.callId}</span>
                        <span className="text-xs text-muted-foreground/50">·</span>
                        <span className="text-xs text-muted-foreground">{issueClient?.name}</span>
                        <Badge variant="destructive" className="ml-auto">{issue.status}</Badge>
                      </div>
                      <p className="text-xs text-foreground/70 line-clamp-2">{issue.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Right: Calling Policy ────────────────────────────────────────────── */}
      <div className="col-span-7">
        {policy ? (
          <Card>
            <CardContent className="px-5 py-4 space-y-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Calling Policy — {client?.name}
              </h2>

              {/* Core policy */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Region</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{policy.region}</p>
                    <p className="text-xs text-muted-foreground/70">{policy.timezone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Permitted Hours</p>
                    <p className="text-sm font-medium text-foreground mt-0.5 font-mono">
                      {policy.allowedStart} – {policy.allowedEnd}
                    </p>
                    <p className="text-xs text-muted-foreground/70">{fmtDays(policy.allowedDays)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Holidays */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Configured Holidays
                  </p>
                  <span className="text-xs text-muted-foreground/50">
                    {policy.holidays.length} days in 2026
                  </span>
                </div>
                <div className="space-y-0">
                  {policy.holidays.map((h) => {
                    const isPast     = h < '2026-08-26';
                    const isToday    = h === '2026-08-26';
                    const isUpcoming = h > '2026-08-26';
                    const isNext     = h === policy.holidays.filter((x) => x > '2026-08-26').sort()[0];
                    return (
                      <div
                        key={h}
                        className={`flex items-center gap-3 py-1.5 px-2 rounded -mx-2 ${isNext ? 'bg-amber-500/8 border border-amber-500/20' : ''}`}
                      >
                        <span
                          className={`font-mono text-xs tabular-nums ${
                            isPast ? 'text-muted-foreground/40' : 'text-foreground'
                          }`}
                        >
                          {h}
                        </span>
                        <span
                          className={`text-sm flex-1 ${isPast ? 'text-muted-foreground/40' : 'text-foreground'}`}
                        >
                          {HOLIDAY_NAMES[h] ?? 'Public Holiday'}
                        </span>
                        {isNext && (
                          <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25 text-xs">
                            Next
                          </Badge>
                        )}
                        {isPast && (
                          <span className="text-xs text-muted-foreground/30">past</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Policy summary */}
              <div className="rounded-md bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground/70">Policy summary</p>
                <p>
                  Calls to {client?.name} contacts in <strong className="text-foreground/80">{policy.region}</strong> are
                  permitted between <strong className="text-foreground/80">{policy.allowedStart}</strong> and{' '}
                  <strong className="text-foreground/80">{policy.allowedEnd}</strong> local time,{' '}
                  <strong className="text-foreground/80">{fmtDays(policy.allowedDays)}</strong>, excluding{' '}
                  <strong className="text-foreground/80">{policy.holidays.length}</strong> national holidays.
                  All times are interpreted as <strong className="text-foreground/80">{policy.timezone}</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="px-5 py-8 text-center text-sm text-muted-foreground">
              No calling policy configured for this client.
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
