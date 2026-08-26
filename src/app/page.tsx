import Link from 'next/link';
import { getClients, getVoicebots, challengeClient, challengeQAIssues, challengeCalls } from '@/lib/data';
import { getAllPriorities, type ClientPriority, type ClientStatus } from '@/lib/priorities';
import { SparkLine } from '@/components/ui/SparkLine';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { Client } from '@/lib/data';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { getDataMode } from '@/lib/get-data-mode';

function fmt(n: number) { return n.toLocaleString('en-US'); }
function pct(n: number) { return n.toFixed(1) + '%'; }

function StatusBadge({ status }: { status: ClientStatus }) {
  if (status === 'critical') {
    return <Badge variant="destructive">Critical</Badge>;
  }
  if (status === 'needs_attention') {
    return (
      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20">
        Attention
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20">
      Healthy
    </Badge>
  );
}

function metricColor(value: number, warnBelow: number, critBelow: number): string {
  if (value < critBelow) return 'text-destructive';
  if (value < warnBelow) return 'text-amber-400';
  return 'text-foreground';
}

function currConv(c: Client)  { return c.stats.weekly.at(-1)?.paymentConversion ?? c.stats.paymentConversion; }
function deltaPP(c: Client)   { return currConv(c) - (c.stats.weekly.at(0)?.paymentConversion ?? currConv(c)); }
function trendData(c: Client) { return c.stats.weekly.map((w) => w.paymentConversion); }

const STATUS_ORDER: Record<ClientStatus, number> = { critical: 0, needs_attention: 1, healthy: 2 };

// ── Challenge-mode dashboard ──────────────────────────────────────────────────

function ChallengeDashboard() {
  const criticalIssues = challengeQAIssues.filter((i) => i.severity === 'critical');
  return (
    <div className="px-6 py-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-amber-400 border border-amber-400/25 bg-amber-400/5 px-2 py-0.5 rounded-sm">
            Challenge Data
          </span>
        </div>
        <h1 className="text-base font-semibold text-foreground">Challenge Client — QA Review</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {challengeCalls.length} challenge calls · {challengeQAIssues.length} QA findings · development mode
        </p>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3">
        <p className="text-xs text-amber-400/80 leading-relaxed">
          These are challenge-provided call recordings from the Domu take-home exercise.
          The same QA investigation workflow applies — open a call to review the transcript,
          classify the finding, and generate an engineering ticket.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Challenge Calls', value: String(challengeCalls.length) },
          { label: 'QA Findings',     value: String(challengeQAIssues.length), alert: true },
          { label: 'Critical',        value: String(criticalIssues.length),    alert: true },
        ].map(({ label, value, alert }) => (
          <Card key={label} size="sm">
            <CardContent className="px-4 py-3">
              <p className={`text-xl font-semibold font-mono tracking-tight ${alert ? 'text-destructive' : 'text-foreground'}`}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {challengeCalls.map((call) => {
          const issue = challengeQAIssues.find((q) => q.callId === call.id);
          return (
            <Link key={call.id} href={`/calls/${call.id}`}
              className="block bg-card border border-border rounded-lg px-4 py-4 hover:border-primary/40 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-muted-foreground">{call.id}</span>
                {issue && (
                  <Badge variant="destructive" className="text-[10px]">
                    {issue.severity}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {issue?.category === 'incorrect_statement' && call.id === 'CALL-HANNAH-001'
                  ? 'Inconsistent identity data + contradictory financial amounts'
                  : 'Contradictory payoff amount'}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {issue?.evidence.slice(0, 80)}…
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open call review</span>
                <ArrowRight className="size-3" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Link href="/qa?client=client-challenge"
          className="text-xs text-primary hover:underline underline-offset-2 font-medium">
          View all in QA Queue →
        </Link>
        <Link href="/clients/client-challenge"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Challenge Client Detail →
        </Link>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const dataMode = await getDataMode();
  if (dataMode === 'challenge') return <ChallengeDashboard />;

  const clients    = getClients();
  const voicebots  = getVoicebots();
  const priorities = getAllPriorities();
  const priMap     = Object.fromEntries(priorities.map((p) => [p.clientId, p]));

  const totalCalls    = clients.reduce((s, c) => s + c.stats.totalCalls,    0);
  const totalAnswered = clients.reduce((s, c) => s + c.stats.answeredCalls, 0);
  const totalPayments = clients.reduce((s, c) => s + c.stats.payments,      0);
  const totalQA       = clients.reduce((s, c) => s + c.stats.qaIssues,      0);
  const portAnswerPct = totalAnswered / totalCalls * 100;
  const portConvPct   = totalPayments / totalAnswered * 100;
  const critCount     = priorities.filter((p) => p.status === 'critical').length;
  const warnCount     = priorities.filter((p) => p.status === 'needs_attention').length;
  const flaggedCount  = critCount + warnCount;

  const vbNames = (clientId: string) =>
    voicebots.filter((v) => v.clientId === clientId).map((v) => v.name).join(', ');

  const sortedClients = [...clients].sort((a, b) =>
    STATUS_ORDER[priMap[a.id]?.status ?? 'healthy'] - STATUS_ORDER[priMap[b.id]?.status ?? 'healthy']
  );

  const actionItems = priorities
    .filter((p) => p.status !== 'healthy')
    .flatMap((p) =>
      p.issues.map((iss) => ({ clientId: p.clientId, clientName: p.clientName, ...iss })),
    );

  const kpis = [
    { label: 'Total Calls',         value: fmt(totalCalls),      note: '8-week period',              alert: false              },
    { label: 'Answer Rate',         value: pct(portAnswerPct),   note: 'portfolio avg',              alert: portAnswerPct < 50 },
    { label: 'Payments',            value: fmt(totalPayments),   note: '8-week period',              alert: false              },
    { label: 'Payment Conversion',  value: pct(portConvPct),     note: 'of answered',                alert: portConvPct < 35   },
    { label: 'QA Issues',           value: fmt(totalQA),         note: 'flagged',                    alert: totalQA > 50       },
    { label: 'Require Attention',   value: String(flaggedCount), note: `of ${clients.length} clients`, alert: flaggedCount > 0 },
  ];

  return (
    <div className="px-6 py-6 space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-base font-semibold text-foreground">Portfolio Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {clients.length} active clients · 8-week performance summary
        </p>
      </div>

      {/* Priority Actions — most prominent section */}
      {actionItems.length > 0 && (
        <Card className="border-l-2 border-l-primary">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
            <span className="text-sm font-medium text-foreground">Priority Actions</span>
            <div className="ml-auto flex items-center gap-3 text-xs">
              {critCount > 0 && (
                <span className="text-destructive font-medium">{critCount} critical</span>
              )}
              {warnCount > 0 && (
                <span className="text-amber-400 font-medium">{warnCount} need attention</span>
              )}
            </div>
          </div>
          <div className="divide-y divide-border">
            {actionItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                <span
                  className={`mt-1.5 size-1.5 rounded-full shrink-0 ${
                    item.severity === 'critical' ? 'bg-destructive' : 'bg-amber-400'
                  }`}
                />
                <div className="flex-1 min-w-0 text-sm">
                  <Link
                    href={`/clients/${item.clientId}`}
                    className="font-medium text-foreground hover:underline underline-offset-2"
                  >
                    {item.clientName}
                  </Link>
                  <span className="text-muted-foreground mx-1.5">—</span>
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded border ${
                    item.severity === 'critical'
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {item.severity === 'critical' ? 'Critical' : 'Warning'}
                </span>
                <Link
                  href={`/qa?client=${item.clientId}`}
                  className="shrink-0 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Investigate →
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(({ label, value, note, alert }) => (
          <Card key={label} size="sm">
            <CardContent className="px-4 py-3">
              <p
                className={`text-xl font-semibold font-mono tracking-tight tabular-nums ${
                  alert ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Client portfolio table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Client Portfolio
          </h2>
          <span className="text-xs text-muted-foreground/50">
            sorted by priority · conv. rate = current week
          </span>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">Client</TableHead>
                <TableHead>Voicebot</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Answer Rate</TableHead>
                <TableHead className="text-right">Payments</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
                <TableHead className="text-right">QA Issues</TableHead>
                <TableHead className="text-center">8W Trend</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client) => {
                const pri    = priMap[client.id];
                const cv     = currConv(client);
                const dp     = deltaPP(client);

                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-foreground hover:underline underline-offset-2"
                      >
                        {client.name}
                      </Link>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{client.industry}</p>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {vbNames(client.id)}
                    </TableCell>

                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {fmt(client.stats.totalCalls)}
                    </TableCell>

                    <TableCell
                      className={`text-right font-mono text-sm font-medium tabular-nums ${metricColor(client.stats.answerRate, 58, 40)}`}
                    >
                      {pct(client.stats.answerRate)}
                    </TableCell>

                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {fmt(client.stats.payments)}
                    </TableCell>

                    <TableCell
                      className={`text-right font-mono text-sm font-medium tabular-nums ${metricColor(cv, 30, 22)}`}
                    >
                      {pct(cv)}
                    </TableCell>

                    <TableCell
                      className={`text-right font-mono text-sm font-medium tabular-nums ${metricColor(100 - client.stats.qaIssues, 85, 50)}`}
                    >
                      {client.stats.qaIssues > 0 ? (
                        <Link href={`/qa?client=${client.id}`} className="hover:underline underline-offset-2">
                          {client.stats.qaIssues}
                        </Link>
                      ) : (
                        client.stats.qaIssues
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <SparkLine data={trendData(client)} />
                        <span
                          className={`text-xs font-mono tabular-nums ${
                            dp < -1 ? 'text-destructive' : dp > 1 ? 'text-emerald-400' : 'text-muted-foreground/50'
                          }`}
                        >
                          {dp >= 0 ? `+${dp.toFixed(0)}` : dp.toFixed(0)}pp
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <StatusBadge status={pri?.status ?? 'healthy'} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

    </div>
  );
}
