import type { QAIssue } from '@/lib/data';

export interface TicketDraft {
  title: string;
  context: string;
  userStory: string;
  acceptanceCriteria: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const USER_STORIES: Record<string, (vb: string, client: string) => string> = {
  payment_objection: (vb, c) =>
    `As ${vb} (${c} collections agent), when a customer expresses inability to pay the proposed amount but indicates genuine willingness to pay, I want to offer alternative payment options or escalate to a human specialist, so that payment intent is captured before the call ends.`,
  incorrect_statement: (vb, c) =>
    `As ${vb} (${c} collections agent), when quoting financial terms such as interest rates or account balances, I want to read only from the verified data feed at call initialisation, so that customers receive accurate information and regulatory compliance is maintained.`,
  dropped_too_early: (vb, c) =>
    `As ${vb} (${c} collections agent), when a customer pauses briefly during an active negotiation, I want to hold the call with a brief re-engagement prompt before disconnecting, so that payment opportunities are not lost due to premature termination.`,
  compliance_concern: (vb, c) =>
    `As ${vb} (${c} collections agent), I want to verify the customer's local time against the permitted calling window before each call attempt, so that all outbound contacts comply with applicable consumer-protection regulations.`,
  wrong_outcome: (vb, c) =>
    `As ${vb} (${c} collections agent), when a customer disputes the balance or provides a payment reference, I want to suspend outcome recording and flag the account for manual verification, so that collection records remain accurate.`,
};

const ACCEPTANCE_CRITERIA: Record<string, string[]> = {
  payment_objection: [
    'When customer declines the proposed settlement, offer at least two alternatives (e.g. PIX, reduced instalment, callback to specialist) before ending the call',
    'If customer makes any counter-offer, route to a human specialist rather than auto-declining',
    'Record outcome as "pending_escalation" when customer expresses payment intent but no arrangement is confirmed',
    'Do not terminate the call while the customer is mid-sentence',
  ],
  incorrect_statement: [
    'Interest rates and balance values must be sourced from the verified data feed at call initialisation',
    'If data feed returns a value outside expected contract bounds, halt negotiation and offer a callback',
    'Add a pre-call validation step cross-checking key financial figures against the underlying contract record',
    'Log any data discrepancy as an incident for investigation',
  ],
  dropped_too_early: [
    'Implement a minimum 15-second silence buffer before terminating any active call',
    'Add re-engagement prompt ("I am still here whenever you are ready") after silence longer than 8 seconds',
    'If call ends before any outcome is captured, schedule an automatic callback within 30 minutes',
    'Log premature disconnection events for monitoring',
  ],
  compliance_concern: [
    'Pre-call guard must check local wall-clock time against CallingPolicy.allowedStart and .allowedEnd before dispatching',
    'Pre-call guard must confirm the call date is not listed in CallingPolicy.holidays',
    'If either check fails, the call must be rescheduled — not placed',
    'Generate a compliance incident record for any out-of-window call attempt',
    'Audit log must include the policy version in force at the time of the check',
  ],
  wrong_outcome: [
    'Add "payment_claimed" as a valid intermediate outcome — account paused from re-dialling',
    'When customer provides a payment reference or transaction ID, log it and queue for manual verification',
    'Do not re-dial accounts with outcome "payment_claimed" until verification completes',
    'Resolved verification must update outcome to either "payment_collected" or "payment_disputed"',
  ],
};

function formatCategoryTitle(category: string): string {
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function generateTicketDraft(
  issue: QAIssue,
  clientName: string,
  voicebotName: string,
): TicketDraft {
  const userStoryFn = USER_STORIES[issue.category];
  const acList = ACCEPTANCE_CRITERIA[issue.category] ?? [
    'Acceptance criteria to be defined by engineering.',
  ];

  const priority: TicketDraft['priority'] =
    issue.severity === 'critical' ? 'critical' :
    issue.severity === 'high'     ? 'high'     :
    issue.severity === 'medium'   ? 'medium'   : 'low';

  return {
    title: `${clientName} — ${formatCategoryTitle(issue.category)} remediation`,
    context: issue.description,
    userStory: userStoryFn
      ? userStoryFn(voicebotName, clientName)
      : issue.recommendation,
    acceptanceCriteria: acList,
    priority,
  };
}
