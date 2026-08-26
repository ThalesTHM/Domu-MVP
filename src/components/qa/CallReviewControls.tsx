'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertTriangle, TicketCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RequestTicketEditor } from '@/components/requests/RequestTicketEditor';
import { generateFromQAIssue } from '@/lib/request-ticket';
import type { QAIssue, Call } from '@/lib/data';

type Verdict = 'accepted' | 'rejected' | null;
type ReviewStatus = 'open' | 'under_review' | 'escalated' | 'resolved';

interface Props {
  issue: QAIssue;
  call?: Call;
  clientName: string;
  voicebotName: string;
  linkedRequestId?: string; // pre-existing request for this client
}

function StatusBadge({ status, verdict }: { status: ReviewStatus; verdict: Verdict }) {
  if (status === 'escalated')
    return <Badge variant="destructive">escalated</Badge>;
  if (status === 'resolved' && verdict === 'accepted')
    return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">accepted</Badge>;
  if (status === 'resolved' && verdict === 'rejected')
    return <Badge variant="secondary">rejected</Badge>;
  if (status === 'under_review')
    return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/25">under review</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25">open</Badge>;
}

export function CallReviewControls({ issue, call, clientName, voicebotName, linkedRequestId }: Props) {
  const [status,    setStatus]    = useState<ReviewStatus>(issue.status as ReviewStatus);
  const [verdict,   setVerdict]   = useState<Verdict>(null);
  const [showDraft, setShowDraft] = useState(false);

  const draft = generateFromQAIssue(issue, call, clientName, voicebotName);

  function accept() { setStatus('resolved'); setVerdict('accepted'); setShowDraft(true); }
  function reject() { setStatus('resolved'); setVerdict('rejected'); }
  function escalate() { setStatus('escalated'); setVerdict(null); }

  return (
    <div className="space-y-4">
      {/* Review controls */}
      <Card>
        <CardContent className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Review Status
            </span>
            <StatusBadge status={status} verdict={verdict} />
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={accept}
              disabled={status === 'resolved' && verdict === 'accepted'}
            >
              <CheckCircle className="size-4 text-emerald-400" />
              Accept Finding
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={reject}
              disabled={status === 'resolved' && verdict === 'rejected'}
            >
              <XCircle className="size-4 text-muted-foreground" />
              Reject Finding
            </Button>
            <Button
              size="sm"
              className="w-full justify-start gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
              onClick={escalate}
              disabled={status === 'escalated'}
            >
              <AlertTriangle className="size-4" />
              Escalate
            </Button>
          </div>

          {status === 'resolved' && verdict === 'accepted' && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Finding accepted. Issue logged for remediation.</p>
              <p className="text-xs text-emerald-400 mt-1">↓ Engineering ticket generated below</p>
            </div>
          )}
          {status === 'resolved' && verdict === 'rejected' && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              Finding rejected. Issue closed without action.
            </p>
          )}
          {status === 'escalated' && (
            <p className="text-xs text-destructive mt-3 pt-3 border-t border-border">
              Issue escalated for urgent review.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create engineering ticket */}
      <Card>
        <CardContent className="px-4 py-4">
          <button
            onClick={() => setShowDraft((v) => !v)}
            className="flex items-center justify-between w-full gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <TicketCheck className="size-4" />
              Create Engineering Ticket
            </span>
            {showDraft
              ? <ChevronUp className="size-4 text-muted-foreground" />
              : <ChevronDown className="size-4 text-muted-foreground" />}
          </button>

          {showDraft && (
            <div className="mt-4">
              <Separator className="mb-4" />
              <RequestTicketEditor
                draft={draft}
                sourceLabel={`Generated from QA issue ${issue.id} · ${issue.callId}`}
              />
              {linkedRequestId && (
                <div className="mt-4 pt-3 border-t border-border">
                  <Link
                    href={`/requests/${linkedRequestId}`}
                    className="text-xs text-blue-400 hover:underline underline-offset-2"
                  >
                    View linked client request and full ticket →
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
