import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClient, getVoicebots, getQAIssues, getRequests, getTickets } from '@/lib/data';
import { getClientPriority } from '@/lib/priorities';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AlertTriangle } from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

function fmt(n: number) { return n.toLocaleString('en-US'); }
function pct(n: number) { return n.toFixed(1) + '%'; }

const QA_CATEGORY_LABELS: Record<string, string> = {
  wrong_outcome:       'Wrong Outcome',
  incorrect_statement: 'Incorrect Statement',
  dropped_too_early:   'Dropped Early',
  payment_objection:   'Payment Objection',
  compliance_concern:  'Compliance Concern',
};

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

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const vbs      = getVoicebots(client.id);
  const qaIssues = getQAIssues({ clientId: client.id });
  const requests = getRequests(client.id);
  const tickets  = getTickets(client.id);
  const priority = getClientPriority(client);

  const currConv = client.stats.weekly.at(-1)?.paymentConversion ?? client.stats.paymentConversion;

  const kpis = [
    { label: 'Total Calls',    value: fmt(client.stats.totalCalls),              alert: false },
    { label: 'Answer Rate',    value: pct(client.stats.answerRate),              alert: client.stats.answerRate < 50 },
    { label: 'Payments',       value: fmt(client.stats.payments),                alert: false },
    { label: 'Conv. Rate',     value: pct(currConv),                             alert: currConv < 25 },
    { label: 'QA Issues',      value: String(client.stats.qaIssues),             alert: client.stats.qaIssues > 15 },
    { label: 'Failed Calls',   value: fmt(client.stats.failedCalls),             alert: false },
  ];

  return (
    <div className="px-6 py-6 max-w-5xl space-y-5">

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

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">{client.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{client.industry}</p>
        </div>
        <div className="shrink-0">
          {priority.status === 'critical' && <Badge variant="destructive">Critical</Badge>}
          {priority.status === 'needs_attention' && (
            <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">
              Needs Attention
            </Badge>
          )}
          {priority.status === 'healthy' && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              Healthy
            </Badge>
          )}
        </div>
      </div>

      {/* Alert banner */}
      {client.alert && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-md border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          {client.alert}
        </div>
      )}

      {/* Priority issues */}
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
              <span
                className={`mt-1 size-1.5 rounded-full shrink-0 ${
                  iss.severity === 'critical' ? 'bg-destructive' : 'bg-amber-400'
                }`}
              />
              {iss.description}
            </div>
          ))}
        </div>
      )}

      {/* KPI strip */}
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

      <Separator />

      {/* Tabbed sections */}
      <Tabs defaultValue="voicebots">
        <TabsList>
          <TabsTrigger value="voicebots">Voicebots</TabsTrigger>
          <TabsTrigger value="qa">
            QA Issues
            {qaIssues.length > 0 && (
              <span className="ml-1.5 text-muted-foreground">({qaIssues.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {requests.length > 0 && (
              <span className="ml-1.5 text-muted-foreground">({requests.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Voicebots tab */}
        <TabsContent value="voicebots" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vbs.map((vb) => (
              <Card key={vb.id} size="sm">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>{vb.name}</CardTitle>
                    <VbStatusBadge s={vb.status} />
                  </div>
                  <p className="text-xs text-muted-foreground/60 font-mono">{vb.version}</p>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{vb.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* QA Issues tab */}
        <TabsContent value="qa" className="mt-4">
          {qaIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No QA issues flagged.</p>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Call ID</TableHead>
                    <TableHead>Voicebot</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qaIssues.map((issue) => {
                    const vb = vbs.find((v) => v.id === issue.voicebotId);
                    return (
                      <TableRow key={issue.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {issue.callId}
                        </TableCell>
                        <TableCell>{vb?.name ?? issue.voicebotId}</TableCell>
                        <TableCell>
                          {QA_CATEGORY_LABELS[issue.category] ?? issue.category}
                        </TableCell>
                        <TableCell><SeverityBadge s={issue.severity} /></TableCell>
                        <TableCell><QAStatusBadge s={issue.status} /></TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(issue.flaggedAt).toLocaleDateString('en-CA')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Requests tab */}
        <TabsContent value="requests" className="mt-4">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No open requests.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const ticket = tickets.find((t) => t.id === req.engineeringTicketId);
                return (
                  <Card key={req.id} size="sm">
                    <CardContent className="px-4 py-3.5">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(req.submittedAt).toLocaleDateString('en-CA')} Â· {req.id}
                        </span>
                        {ticket ? (
                          <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/25 shrink-0">
                            {ticket.id}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">No ticket</Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{req.rawRequest}</p>
                      {ticket && (
                        <>
                          <Separator className="my-3" />
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground/70">{ticket.title}</span>
                            <Badge
                              className={`shrink-0 text-xs ${
                                ticket.priority === 'high' || ticket.priority === 'critical'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                  : 'bg-secondary text-secondary-foreground border-0'
                              }`}
                            >
                              {ticket.priority} Â· {ticket.status}
                            </Badge>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}
