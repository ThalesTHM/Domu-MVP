import { Suspense } from 'react';
import Link from 'next/link';
import { getQAIssues, getClients, getClient, getVoicebot } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { QAFilters } from '@/components/qa/QAFilters';
import { ArrowRight } from 'lucide-react';
import type { QACategory, QASeverity, QAStatus } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === 'string' && v ? v : undefined;
}

export default async function QAQueuePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const clientFilter   = str(sp.client);
  const severityFilter = str(sp.severity) as QASeverity | undefined;
  const categoryFilter = str(sp.category) as QACategory | undefined;
  const statusFilter   = str(sp.status)   as QAStatus   | undefined;

  const allIssues = getQAIssues();
  const clients   = getClients();

  // Summary stats from unfiltered list
  const criticalCount  = allIssues.filter((i) => i.severity === 'critical').length;
  const escalatedCount = allIssues.filter((i) => i.status   === 'escalated').length;
  const openCount      = allIssues.filter((i) => i.status   === 'open').length;

  // Apply filters
  let issues = allIssues;
  if (clientFilter)   issues = issues.filter((i) => i.clientId  === clientFilter);
  if (severityFilter) issues = issues.filter((i) => i.severity  === severityFilter);
  if (categoryFilter) issues = issues.filter((i) => i.category  === categoryFilter);
  if (statusFilter)   issues = issues.filter((i) => i.status    === statusFilter);

  const hasFilters = !!(clientFilter || severityFilter || categoryFilter || statusFilter);

  return (
    <div className="px-6 py-6 space-y-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Portfolio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>QA Review</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">QA Review Queue</h1>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span>{allIssues.length} total issues</span>
            {criticalCount  > 0 && <span className="text-destructive font-medium">{criticalCount} critical</span>}
            {escalatedCount > 0 && <span className="text-destructive font-medium">{escalatedCount} escalated</span>}
            {openCount      > 0 && <span className="text-amber-400 font-medium">{openCount} open</span>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Suspense>
        <QAFilters
          clients={clients}
          current={{
            client:   clientFilter,
            severity: severityFilter,
            category: categoryFilter,
            status:   statusFilter,
          }}
        />
      </Suspense>

      {/* Results summary */}
      {hasFilters && (
        <p className="text-xs text-muted-foreground">
          Showing {issues.length} of {allIssues.length} issues
        </p>
      )}

      {/* Table */}
      {issues.length === 0 ? (
        <Card>
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No issues match the selected filters.
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[130px]">Call ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Voicebot</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead className="w-[80px]">Severity</TableHead>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[36px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => {
                const client  = getClient(issue.clientId);
                const voicebot = getVoicebot(issue.voicebotId);
                return (
                  <TableRow key={issue.id} className="group cursor-pointer">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {issue.callId}
                    </TableCell>
                    <TableCell>
                      <Link href={`/clients/${issue.clientId}`} className="hover:underline underline-offset-2 text-sm">
                        {client?.name ?? issue.clientId}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{voicebot?.name ?? issue.voicebotId}</TableCell>
                    <TableCell className="max-w-0 w-full">
                      <Link href={`/calls/${issue.callId}`} className="block">
                        <p className="text-sm font-medium text-foreground group-hover:underline underline-offset-2 truncate">
                          {QA_CATEGORY_LABELS[issue.category] ?? issue.category}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
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
                      <Link
                        href={`/calls/${issue.callId}`}
                        className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors"
                      >
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
