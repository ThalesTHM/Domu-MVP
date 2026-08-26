import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCall, getQAIssueForCall, getClient, getVoicebot, getRequests } from '@/lib/data';
import { CallReviewControls } from '@/components/qa/CallReviewControls';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type Props = { params: Promise<{ callId: string }> };

const OUTCOME_LABELS: Record<string, string> = {
  payment_collected:  'Payment Collected',
  payment_refused:    'Payment Refused',
  no_answer:          'No Answer',
  dropped:            'Dropped',
  callback_scheduled: 'Callback Scheduled',
  invalid_number:     'Invalid Number',
  disputed:           'Disputed',
  already_paid:       'Already Paid',
};

const QA_CATEGORY_LABELS: Record<string, string> = {
  wrong_outcome:       'Wrong Outcome',
  incorrect_statement: 'Incorrect Statement',
  dropped_too_early:   'Dropped Early',
  payment_objection:   'Payment Objection',
  compliance_concern:  'Compliance Concern',
};

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const label = OUTCOME_LABELS[outcome] ?? outcome;
  if (outcome === 'payment_collected')
    return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">{label}</Badge>;
  if (outcome === 'payment_refused' || outcome === 'dropped')
    return <Badge variant="destructive">{label}</Badge>;
  if (outcome === 'disputed' || outcome === 'already_paid')
    return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/25">{label}</Badge>;
  return <Badge variant="secondary">{label}</Badge>;
}

function SeverityBadge({ s }: { s: string }) {
  if (s === 'critical') return <Badge variant="destructive">Critical</Badge>;
  if (s === 'high')     return <Badge className="bg-red-500/15 text-red-400 border border-red-500/25">High</Badge>;
  if (s === 'medium')   return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
}

export default async function CallReviewPage({ params }: Props) {
  const { callId } = await params;
  const call = getCall(callId);
  if (!call) notFound();

  const issue    = getQAIssueForCall(callId);
  const client   = getClient(call.clientId);
  const voicebot = getVoicebot(call.voicebotId);
  // First request for this client that has a linked ticket — for navigation after ticket creation
  const linkedRequest = getRequests(call.clientId).find((r) => r.engineeringTicketId);

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
            <BreadcrumbLink render={<Link href="/qa" />}>QA Review</BreadcrumbLink>
          </BreadcrumbItem>
          {client && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/clients/${client.id}`} />}>
                  {client.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">{callId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 flex-wrap mb-1">
          <h1 className="text-base font-semibold text-foreground font-mono">{callId}</h1>
          {client && (
            <Link href={`/clients/${client.id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {client.name}
            </Link>
          )}
          {issue && <SeverityBadge s={issue.severity} />}
          {!issue && <Badge variant="secondary">Not Flagged</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{formatTs(call.timestamp)} · {voicebot?.name ?? call.voicebotId}</p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Left: Metadata + Transcript ──────────────────────────────────── */}
        <div className="col-span-7 space-y-5">

          {/* Call metadata */}
          <Card>
            <CardContent className="px-5 py-4">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Call Metadata
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  { label: 'Call ID',    value: <span className="font-mono">{call.id}</span> },
                  { label: 'Client',     value: client?.name ?? call.clientId },
                  { label: 'Voicebot',   value: voicebot ? `${voicebot.name} ${voicebot.version}` : call.voicebotId },
                  { label: 'Timestamp',  value: formatTs(call.timestamp) },
                  { label: 'Duration',   value: call.answered ? formatDuration(call.duration) : '—' },
                  { label: 'Outcome',    value: <OutcomeBadge outcome={call.outcome} /> },
                  { label: 'Debtor',     value: call.debtorName },
                  { label: 'Debt Amt',   value: `R$ ${call.debtAmount.toLocaleString('en-US')}` },
                  ...(call.paymentAmount !== null
                    ? [{ label: 'Payment', value: `R$ ${call.paymentAmount.toLocaleString('en-US')}` }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card>
            <CardContent className="px-5 py-4">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
                Transcript
              </h2>

              {!call.transcript || call.transcript.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Transcript not available for this call.
                </p>
              ) : (
                <div className="space-y-3">
                  {call.transcript.map((line, i) => {
                    const isCust = line.speaker === 'customer';
                    const speakerLabel = isCust ? 'Customer' : (voicebot?.name ?? 'Bot');
                    return (
                      <div key={i} className="flex gap-3">
                        <span className="font-mono text-xs text-muted-foreground/40 shrink-0 w-10 mt-0.5 tabular-nums">
                          {formatTime(line.timeSeconds)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-semibold mr-2 ${isCust ? 'text-foreground/60' : 'text-blue-400'}`}>
                            {speakerLabel}
                          </span>
                          <span className="text-sm text-foreground leading-relaxed">
                            {line.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* ── Right: Issue Analysis + Review Controls ───────────────────────── */}
        <div className="col-span-5 space-y-4">

          {issue ? (
            <>
              {/* Issue analysis */}
              <Card>
                <CardContent className="px-5 py-4 space-y-4">
                  <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    Issue Analysis
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <p className="text-sm font-medium text-foreground">
                        {QA_CATEGORY_LABELS[issue.category] ?? issue.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Severity</p>
                      <SeverityBadge s={issue.severity} />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Description</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{issue.description}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Evidence</p>
                    {/* Evidence block styled to highlight transcript excerpts */}
                    <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                        {issue.evidence}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Recommended Action</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{issue.recommendation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Review controls + ticket creation (client component) */}
              <CallReviewControls
                issue={issue}
                call={call}
                clientName={client?.name ?? call.clientId}
                voicebotName={voicebot?.name ?? call.voicebotId}
                linkedRequestId={linkedRequest?.id}
              />
            </>
          ) : (
            <Card>
              <CardContent className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">No QA issue flagged for this call.</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
