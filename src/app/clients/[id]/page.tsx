import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getClient, getVoicebots, getQAIssues, getRequests, getTickets, getPolicy,
} from '@/lib/data';
import { getClientPriority } from '@/lib/priorities';
import { SparkLine } from '@/components/ui/SparkLine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AlertTriangle, ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

const QA_CATEGORY_LABELS: Record<string, string> = {
  wrong_outcome:       'Wrong Outcome',
  incorrect_statement: 'Incorrect Statement',
  dropped_too_early:   'Dropped Early',
  payment_objection:   'Payment Objection',
  compliance_concern:  'Compliance Concern',
};

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmt(n: number)       { return n.toLocaleString('en-US'); }
function pct(n: number)       { return n.toFixed(1) + '%'; }
function trunc(s: string, n = 150) { return s.length > n ? s.slice(0, n) + '…' : s; }

function formatDays(days: number[]): string {
  if (!days.length) return 'None';
  const s = [...days].sort((a, b) => a - b);
  const consecutive = s.every((d, i) => i === 0 || d === s[i - 1] + 1);
  return consecutive
    ? `${DAY_ABBR[s[0]]} – ${DAY_ABBR[s[s.length - 1]]}`
    : s.map((d) => DAY_ABBR[d]).join(', ');
}

function nextHoliday(holidays: string[]): string | null {
  const today = '2026-08-26';
  const next = [...holidays].filter((h) => h > today).sort()[0];
  if (!next) return null;
  return new Date(next + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SeverityBadge({ s }: { s: string }) {
  if (s === 'critical') return <Badge variant="destructive">critical</Badge>;
  if (s === 'high')     return <Badge className="bg-red-500/15 text-red-400 border border-red-500/25">high</Badge>;
  if (s === 'medium')   return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">medium</Badge>;
  return <Badge variant="secondary">low</Badge>;
}

function QAStatusBadge({ s }: { s: string }) {
  if (s === 'escalated')    return <Badge variant="destructive">escalated</Badge>;
  if (s === 'open')         return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">open</Badge>;
  if (s === 'under_review') return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/25">under review</Badge>;
  return <Badge variant="secondary">resolved</Badge>;
}

function VbStatusBadge({ s }: { s: string }) {
  if (s === 'error')  return <Badge variant="destructive">error</Badge>;
  if (s === 'paused') return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">paused</Badge>;
  return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">active</Badge>;
}

function TicketStatusBadge({ s }: { s: string }) {
  if (s === 'done')        return <Badge variant="secondary">done</Badge>;
  if (s === 'in_progress') return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/25">in progress</Badge>;
  return <Badge variant="outline">backlog</Badge>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const vbs      = getVoicebots(client.id);
  const qaIssues = getQAIssues({ clientId: client.id });
  const requests = getRequests(client.id);
  const tickets  = getTickets(client.id);
  const policy   = getPolicy(client.id);
  const priority = getClientPriority(client);

  const currConv    = client.stats.weekly.at(-1)?.paymentConversion ?? client.stats.paymentConversion;
  const oldestConv  = client.stats.weekly.at(0)?.paymentConversion  ?? currConv;
  const convDeltaPP = currConv - oldestConv;
  const convData    = client.stats.weekly.map((w) => w.paymentConversion);
  const answerData  = client.stats.weekly.map((w) => w.answerRate);

  // First open/escalated QA issue — used for the Investigate CTA
  const investigateIssue = qaIssues.find(
    (q) => q.status === 'open' || q.status === 'escalated',
  );

  const kpis = [
    { label: 'Calls',        value: fmt(client.stats.totalCalls),   alert: false                        },
    { label: 'Answer Rate',  value: pct(client.stats.answerRate),   alert: client.stats.answerRate < 50 },
    { label: 'Payments',     value: fmt(client.stats.payments),     alert: false                        },
    { label: 'Conv. Rate',   value: pct(currConv),                  alert: currConv < 25                },
    { label: 'Failed Calls', value: fmt(client.stats.failedCalls),  alert: false                        },
    { label: 'QA Issues',    value: String(client.stats.qaIssues),  alert: client.stats.qaIssues > 15   },
  ];

  const pendingRequests = requests.filter((r) => !r.engineeringTicketId);

  return (
    <div className="px-6 py-6 space-y-5">

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Portfolio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{client.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-semibold text-foreground">{client.name}</h1>
            {priority.status === 'critical' && <Badge variant="destructive">Critical</Badge>}
            {priority.status === 'needs_attention' && (
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">Needs Attention</Badge>
            )}
            {priority.status === 'healthy' && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Healthy</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{client.industry}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
            {vbs.map((vb) => (
              <span key={vb.id} className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full shrink-0 ${
                  vb.status === 'active' ? 'bg-emerald-400' :
                  vb.status === 'paused' ? 'bg-amber-400' : 'bg-destructive'
                }`} />
                {vb.name}
                <span className="font-mono text-muted-foreground/50">{vb.version}</span>
                <VbStatusBadge s={vb.status} />
              </span>
            ))}
            <span className="text-muted-foreground/30">·</span>
            <span className="text-muted-foreground/50">Refreshed 2026-08-26 09:00 UTC</span>
          </div>
        </div>

        {/* Investigate CTA — shown only when critical issues exist */}
        {priority.status === 'critical' && investigateIssue && (
          <Button
            variant="destructive"
            size="sm"
            render={<Link href={`/calls/${investigateIssue.callId}`} />}
          >
            <AlertTriangle className="size-3.5" />
            Investigate
          </Button>
        )}
      </div>

      {/* Alert banner */}
      {client.alert && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-md border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          {client.alert}
        </div>
      )}

      {/* Priority issues strip */}
      {priority.issues.length > 0 && (
        <div className="space-y-1.5">
          {priority.issues.map((iss, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 px-3 py-2.5 rounded-md border text-xs ${
                iss.severity === 'critical'
                  ? 'border-destructive/30 bg-destructive/5 text-destructive'
                  : 'border-amber-500/25 bg-amber-500/5 text-amber-400'
              }`}
            >
              <span className={`mt-1 size-1.5 rounded-full shrink-0 ${iss.severity === 'critical' ? 'bg-destructive' : 'bg-amber-400'}`} />
              {iss.description}
            </div>
          ))}
        </div>
      )}

      {/* ── Performance ───────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Performance</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map(({ label, value, alert }) => (
            <Card key={label} size="sm">
              <CardContent className="px-4 py-3">
                <p className={`text-xl font-semibold font-mono tabular-nums tracking-tight ${alert ? 'text-destructive' : 'text-foreground'}`}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 8-week trend */}
        <Card size="sm" className="mt-3">
          <CardContent className="px-5 py-3.5">
            <div className="flex items-center gap-10 flex-wrap">
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Payment Conversion — 8W</p>
                  <SparkLine data={convData} width={140} height={28} />
                </div>
                <div className="flex gap-5 text-xs">
                  <div>
                    <p className="text-muted-foreground">8W ago</p>
                    <p className="font-mono font-medium text-foreground mt-0.5">{pct(oldestConv)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className={`font-mono font-medium mt-0.5 ${currConv < 25 ? 'text-destructive' : currConv < 32 ? 'text-amber-400' : 'text-foreground'}`}>
                      {pct(currConv)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Change</p>
                    <p className={`font-mono font-medium mt-0.5 ${convDeltaPP < -2 ? 'text-destructive' : convDeltaPP > 2 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                      {convDeltaPP >= 0 ? '+' : ''}{convDeltaPP.toFixed(0)}pp
                    </p>
                  </div>
                </div>
              </div>

              <Separator orientation="vertical" className="h-10 hidden lg:block" />

              <div className="flex items-center gap-5">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Answer Rate — 8W</p>
                  <SparkLine data={answerData} width={100} height={28} />
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground">Current</p>
                  <p className={`font-mono font-medium mt-0.5 ${client.stats.answerRate < 40 ? 'text-destructive' : client.stats.answerRate < 58 ? 'text-amber-400' : 'text-foreground'}`}>
                    {pct(client.stats.answerRate)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ── Main grid: QA Issues (left) + Sidebar (right) ────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* QA Issues */}
        <section className="col-span-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">QA Issues</h2>
            {qaIssues.length > 0 && (
              <Link
                href={`/qa?client=${client.id}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {qaIssues.length} flagged · View all in QA Queue →
              </Link>
            )}
          </div>

          {qaIssues.length === 0 ? (
            <Card size="sm">
              <CardContent className="px-4 py-8 text-center text-sm text-muted-foreground">
                No QA issues flagged for this client.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">Call ID</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead className="w-[80px]">Severity</TableHead>
                    <TableHead className="w-[90px]">Date</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[36px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qaIssues.map((issue) => (
                    <TableRow key={issue.id} className="group">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {issue.callId}
                      </TableCell>
                      <TableCell>
                        <Link href={`/calls/${issue.callId}`} className="block">
                          <p className="text-sm font-medium text-foreground group-hover:underline underline-offset-2">
                            {QA_CATEGORY_LABELS[issue.category] ?? issue.category}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {issue.description}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell><SeverityBadge s={issue.severity} /></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(issue.flaggedAt).toLocaleDateString('en-CA')}
                      </TableCell>
                      <TableCell><QAStatusBadge s={issue.status} /></TableCell>
                      <TableCell>
                        <Link href={`/calls/${issue.callId}`} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors">
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </section>

        {/* Right sidebar */}
        <div className="col-span-4 space-y-5">

          {/* Voicebots */}
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Voicebots</h2>
            <div className="space-y-2">
              {vbs.map((vb) => (
                <Card key={vb.id} size="sm">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-foreground">{vb.name}</span>
                      <VbStatusBadge s={vb.status} />
                    </div>
                    <p className="text-xs text-muted-foreground/50 font-mono mb-1.5">{vb.version}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{vb.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Calling Policy */}
          {policy && (
            <section>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Calling Policy</h2>
              <Card size="sm">
                <CardContent className="px-4 py-3 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{policy.region}</p>
                      <p className="text-xs text-muted-foreground">{policy.timezone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {policy.allowedStart} – {policy.allowedEnd}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDays(policy.allowedDays)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Calendar className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {policy.holidays.length} holidays this year
                      </p>
                      {nextHoliday(policy.holidays) && (
                        <p className="text-xs text-muted-foreground">
                          Next: {nextHoliday(policy.holidays)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

        </div>
      </div>

      {/* ── Engineering Work ──────────────────────────────────────────────────── */}
      {(tickets.length > 0 || pendingRequests.length > 0) && (
        <>
          <Separator />
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Engineering Work</h2>
            <div className="space-y-3">

              {/* Active tickets */}
              {tickets.map((ticket) => (
                <Card key={ticket.id} size="sm">
                  <CardContent className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground/60">{ticket.id}</span>
                        {(ticket.priority === 'high' || ticket.priority === 'critical') && (
                          <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">
                            {ticket.priority}
                          </Badge>
                        )}
                        <TicketStatusBadge s={ticket.status} />
                      </div>
                    </div>
                    {ticket.clientRequestId ? (
                      <Link
                        href={`/requests/${ticket.clientRequestId}`}
                        className="text-sm font-medium text-foreground hover:underline underline-offset-2 block mb-1.5"
                      >
                        {ticket.title} →
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-foreground mb-1.5">{ticket.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {trunc(ticket.context)}
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Acceptance Criteria</p>
                        <p className="text-xs font-medium text-foreground mt-0.5">
                          {ticket.acceptanceCriteria.length} items
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dependencies</p>
                        <p className="text-xs font-medium text-foreground mt-0.5">
                          {ticket.dependencies.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Open Questions</p>
                        <p className={`text-xs font-medium mt-0.5 ${ticket.openQuestions.length > 0 ? 'text-amber-400' : 'text-foreground'}`}>
                          {ticket.openQuestions.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Requests awaiting ticket creation */}
              {pendingRequests.map((req) => (
                <Card key={req.id} size="sm" className="border-dashed">
                  <CardContent className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-muted-foreground/60">
                        {new Date(req.submittedAt).toLocaleDateString('en-CA')} · {req.id}
                      </span>
                      <Badge variant="secondary">Awaiting ticket</Badge>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{req.rawRequest}</p>
                  </CardContent>
                </Card>
              ))}

            </div>
          </section>
        </>
      )}

    </div>
  );
}
