import type { QAIssue, Call, ClientRequest, EngineeringTicket } from '@/lib/data';

export interface FullTicketDraft {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: string;
  userStory: string;
  acceptanceCriteria: string[];
  dependencies: string[];
  openQuestions: string[];
  observability: string;
}

// ─── From a client request ────────────────────────────────────────────────────

export function generateFromRequest(
  request: ClientRequest,
  clientName: string,
  voicebotName: string,
  existingTicket?: EngineeringTicket,
): FullTicketDraft {
  if (existingTicket) {
    return fromExistingTicket(existingTicket, clientName, request.rawRequest);
  }
  const raw = request.rawRequest.toLowerCase();
  if (raw.includes('pix'))
    return pixTicket(clientName, voicebotName);
  if (raw.includes('sms') || (raw.includes('payment link') && raw.includes('digital')))
    return smsLinkTicket(clientName, voicebotName);
  if (raw.includes('interest rate') || raw.includes('taxa') || raw.includes('disclosure'))
    return interestRateTicket(clientName, voicebotName, request.rawRequest);
  if (raw.includes('answer rate') || raw.includes('contact list') || raw.includes('inactive'))
    return contactListTicket(clientName, voicebotName);
  if (raw.includes('saturday') || raw.includes('calling window') || raw.includes('hours'))
    return callingWindowTicket(clientName, voicebotName, request.rawRequest);
  if (raw.includes('balance') || raw.includes('incorrect') || raw.includes('investigation'))
    return dataIntegrationTicket(clientName, voicebotName);
  return genericTicket(clientName, voicebotName, request.rawRequest);
}

// ─── From a QA issue ──────────────────────────────────────────────────────────

export function generateFromQAIssue(
  issue: QAIssue,
  call: Call | undefined,
  clientName: string,
  voicebotName: string,
): FullTicketDraft {
  const categoryTitle = fmtCategory(issue.category);

  const context = [
    `QA issue detected during ${clientName} call review.`,
    '',
    call ? `Call reference: ${call.id} · ${new Date(call.timestamp).toLocaleDateString('en-CA')} · ${voicebotName}` : `Voicebot: ${voicebotName}`,
    '',
    issue.description,
    '',
    'Evidence (verbatim):',
    issue.evidence,
  ].join('\n');

  const DEPS: Record<string, string[]> = {
    payment_objection: [
      'Engineering review of payment negotiation conversation flow',
      'PIX gateway integration (if PIX is to be added as alternative)',
      'QA sign-off via call sample after fix is deployed',
    ],
    incorrect_statement: [
      'Audit of data feed providing financial figures to the voicebot',
      'Reconciliation of rate values against source contract records',
      'QA sampling of 50 calls per week for 4 weeks after fix',
    ],
    dropped_too_early: [
      'Review of speech-recognition timeout configuration',
      'QA testing across diverse network conditions',
    ],
    compliance_concern: [
      'CallingPolicy data model accessible to the pre-call dispatch layer',
      'Legal sign-off on out-of-window call disclosure language',
      'Compliance incident report filed with client',
    ],
    wrong_outcome: [
      'Payment verification webhook or polling endpoint from the client',
      'Account re-dialling suppression rule for unverified outcomes',
    ],
  };

  const OQS: Record<string, string[]> = {
    payment_objection: [
      'What is the minimum counter-offer amount that should trigger human escalation?',
      'Should PIX be offered as a first alternative, or after all other methods fail?',
      'What is the acceptable fix turnaround given the severity of the conversion impact?',
    ],
    incorrect_statement: [
      'Is this a systematic data feed issue affecting all accounts, or isolated to this account type?',
      'How frequently is the rate data refreshed from the source system?',
      'Are other voicebots (Clara, Marcus) consuming the same data feed?',
    ],
    dropped_too_early: [
      'Is the premature disconnection caused by a speech-recognition timeout or a network event?',
      'Are there other calls in the same period with similar disconnection patterns?',
      'What is the acceptable silence threshold before a re-engagement prompt?',
    ],
    compliance_concern: [
      'Is the out-of-window call a one-off scheduling error or a systematic dispatcher bug?',
      'Has the client been notified of this compliance incident?',
      'Is a retroactive audit of the last 30 days of calls required?',
    ],
    wrong_outcome: [
      'How long does same-day payment verification typically take in the client\'s core system?',
      'Should accounts with disputed balances be paused from all collection activity, or only re-dialling?',
      'What notification does the customer receive if verification is pending?',
    ],
  };

  const OBS: Record<string, string> = {
    payment_objection: `- payment.escalation_rate: % of calls where customer counter-offers, segmented by disposition (escalated / auto-declined / abandoned)
- payment.conversion_recovery: weekly payment conversion rate after fix deployment vs. baseline
- payment.objection_outcome_split: outcomes after objection (escalated / PIX accepted / callback / refused)`,
    incorrect_statement: `- qa.incorrect_statement_rate: weekly count of QA flags related to incorrect financial figures
- data_feed.validation_error_rate: daily count of validation failures in the rate/balance data feed
- disclosure.sampled_accuracy_rate: % of calls in weekly sample where quoted figures match contract records`,
    dropped_too_early: `- call.premature_drop_rate: % of answered calls ending before any outcome is recorded
- call.re_engagement_effectiveness: % of calls where re-engagement prompt prevents disconnection
- call.callback_conversion_rate: % of scheduled callbacks (triggered by premature drop) that result in payment`,
    compliance_concern: `- compliance.within_window_rate: % of calls placed within permitted hours (target: 100%)
- compliance.out_of_window_count: absolute count of calls placed outside permitted window (target: 0)
- compliance.incident_resolution_time: hours between incident detection and client notification`,
    wrong_outcome: `- outcome.dispute_rate: % of calls where customer challenges the recorded outcome
- outcome.verification_latency: hours between "payment_claimed" and final outcome resolution
- outcome.accuracy_rate: % of payment outcomes that match payment gateway records (verified via weekly reconciliation)`,
  };

  return {
    title: `${clientName} — ${categoryTitle} remediation (${issue.callId})`,
    priority:
      issue.severity === 'critical' ? 'critical' :
      issue.severity === 'high'     ? 'high'     :
      issue.severity === 'medium'   ? 'medium'   : 'low',
    context,
    userStory: USER_STORIES[issue.category]?.(voicebotName, clientName) ?? issue.recommendation,
    acceptanceCriteria: AC[issue.category] ?? ['Acceptance criteria to be defined by engineering.'],
    dependencies: DEPS[issue.category] ?? ['Engineering review required.'],
    openQuestions: OQS[issue.category] ?? ['Scope and root cause to be confirmed.'],
    observability: OBS[issue.category] ?? '- Metrics to be defined by engineering.',
  };
}

// ─── Internal generators ──────────────────────────────────────────────────────

function fromExistingTicket(
  t: EngineeringTicket,
  _clientName: string,
  rawRequest: string,
): FullTicketDraft {
  const lower = t.title.toLowerCase();
  return {
    title:               t.title,
    priority:            t.priority,
    context:             t.context,
    userStory:           t.userStory,
    acceptanceCriteria:  t.acceptanceCriteria,
    dependencies:        t.dependencies,
    openQuestions:       t.openQuestions,
    observability:       selectObservability(lower, rawRequest),
  };
}

function pixTicket(clientName: string, voicebotName: string): FullTicketDraft {
  return {
    title:    `${clientName} — Add PIX instant payment support to ${voicebotName}`,
    priority: 'high',
    context:  `${clientName} has requested PIX as an additional payment method during outbound collections calls. Customer feedback and QA call reviews indicate that payment intent is frequently lost when only card and boleto options are available. Adding PIX is expected to recover 8–12 percentage points of payment conversion by capturing intent before the call ends.`,
    userStory: `As ${voicebotName} (${clientName} collections voicebot), when a customer expresses willingness to pay but declines card or boleto options, I want to offer PIX as an immediate payment alternative so that payment is captured before the call ends — without requiring the customer to log in to a portal or call back.`,
    acceptanceCriteria: [
      `${voicebotName} offers PIX during payment negotiation, after card/boleto are declined or unavailable`,
      'A PIX key (QR code + alphanumeric copy-paste key) is generated and delivered via SMS within 10 seconds of verbal agreement',
      `${voicebotName} confirms SMS delivery verbally and reads the last 4 digits of the registered mobile`,
      'Payment is polled for up to 5 minutes; agent uses a hold-and-check loop',
      'Outcome is recorded as "payment_collected" only after a confirmed PIX webhook event is received',
      'If PIX is not confirmed within timeout, outcome is "payment_pending_pix" and follow-up SMS is scheduled for T+1h and T+24h',
      'If SMS delivery fails, the agent reads the key verbally or schedules a human callback',
      'All PIX transactions are logged with PIX key, E2E transaction ID, timestamp, and amount',
      'Existing card and boleto flows are unaffected',
    ],
    dependencies: [
      `${clientName} PIX key generation API and payment gateway credentials`,
      'SMS delivery service capable of reaching Brazilian mobile numbers',
      `Real-time PIX confirmation webhook from ${clientName} (or polling endpoint)`,
      `${clientName} compliance sign-off on PIX disclosure script language`,
    ],
    openQuestions: [
      `What is the maximum call hold time ${clientName} accepts before the call must end?`,
      'Should PIX be offered before or after boleto?',
      'Is there a minimum debt amount below which PIX should not be offered?',
      `Who generates the PIX key — Domu infrastructure or ${clientName} payment gateway?`,
      'What happens if the customer pays a different amount than the agreed settlement via PIX?',
    ],
    observability: `- pix.offer_rate: % of eligible calls where PIX was offered (target: >80% of qualifying calls)
- pix.acceptance_rate: % of PIX offers accepted by the customer
- pix.confirmation_rate: % of accepted offers confirmed via webhook within timeout window
- pix.timeout_rate: % of PIX offers reaching the timeout without confirmation
- payment.conversion_rate: weekly conversion rate before and after PIX launch
- payment.method_split: payments by card / boleto / PIX per week
- sms.delivery_rate: % of PIX-related SMS messages delivered successfully`,
  };
}

function smsLinkTicket(clientName: string, voicebotName: string): FullTicketDraft {
  return {
    title:    `${clientName} — Post-call payment link via SMS (${voicebotName})`,
    priority: 'medium',
    context:  `${clientName} has requested the ability to send a secure payment link via SMS at the end of each collections call, even when no payment is agreed during the call. This enables customers to pay at a time convenient to them, extending the collection window beyond the call itself.`,
    userStory: `As ${voicebotName} (${clientName} collections voicebot), at the end of every answered call regardless of outcome, I want to offer to send a secure payment link via SMS so that customers can pay at their convenience within 24 hours without needing to call back.`,
    acceptanceCriteria: [
      `${voicebotName} offers the payment link SMS at call close regardless of outcome (with opt-out option)`,
      'SMS is delivered to the debtor\'s registered mobile number within 30 seconds of call end',
      'Payment link is valid for 24 hours and is unique per call',
      'Payment made via link is recorded against the correct account and call',
      'Link expiry triggers an automatic follow-up call scheduling',
      'Opt-out from SMS is stored and respected in future calls',
      'Existing in-call payment flows are unaffected',
    ],
    dependencies: [
      'SMS delivery service (Twilio or equivalent) for Brazilian numbers',
      `${clientName} payment portal capable of accepting and recording link-originated payments`,
      'Unique link generation service with configurable TTL',
    ],
    openQuestions: [
      'Should the SMS be sent even when the debtor refused to pay during the call?',
      `What is the payment portal URL to which ${clientName} wants customers directed?`,
      'Should link-originated payments be tracked separately from in-call payments for reporting?',
      'Is there a cost-per-SMS budget constraint?',
    ],
    observability: `- sms.delivery_rate: % of end-of-call SMS messages delivered successfully
- sms.link_open_rate: % of delivered links opened within 24 hours
- sms.payment_conversion_rate: % of sent links that result in a payment within 24 hours
- sms.link_expiry_rate: % of links that expire without a payment attempt
- payment.sms_vs_incall_split: revenue from SMS-originated vs. in-call payments per week`,
  };
}

function interestRateTicket(clientName: string, voicebotName: string, rawRequest: string): FullTicketDraft {
  const newRate = rawRequest.match(/(\d+\.?\d*)\s*%/)?.[1] ?? '[NEW RATE]';
  const effectiveDate = rawRequest.match(/(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}|september\s+\d+|effective.*?(?=\.|,|$))/i)?.[0] ?? '[EFFECTIVE DATE]';
  return {
    title:    `${clientName} — Update interest rate disclosure in ${voicebotName} script`,
    priority: 'high',
    context:  `${clientName} has notified Domu of a change to their contractual interest rate. The voicebot script must be updated before the effective date to ensure all customer disclosures are accurate and compliant. Incorrect interest rate quotations constitute an incorrect-statement QA issue and may carry regulatory risk.`,
    userStory: `As ${voicebotName} (${clientName} collections voicebot), when quoting interest rates to debtors, I want to read the current rate from the updated configuration so that all disclosures are accurate as of the effective date.`,
    acceptanceCriteria: [
      `The interest rate disclosed in all call scripts is updated to ${newRate}% effective ${effectiveDate}`,
      'Rate value is read from a configurable data source, not hard-coded in the prompt template',
      'Calls initiated on or after the effective date use the new rate exclusively',
      'Calls initiated before the effective date are unaffected',
      'A QA sample of 20 calls is reviewed in the first week after the change to verify accuracy',
      'Any data feed error causing an out-of-bounds rate value triggers a call halt and alert',
    ],
    dependencies: [
      `${clientName} confirmation of new rate value and effective date in writing`,
      'Configuration management access to the rate parameter in the voicebot data feed',
    ],
    openQuestions: [
      `Is the new rate of ${newRate}% p.a. applicable to all account types, or only specific delinquency brackets?`,
      'Should calls already scheduled before the effective date be re-queued with the new rate?',
      'Who is the ${clientName} signatory confirming the rate change?',
    ],
    observability: `- disclosure.rate_value_sampled: interest rate value quoted in weekly call sample (should match ${newRate}% post-change)
- qa.incorrect_statement_rate: weekly count of QA flags related to interest rate disclosures (target: 0 post-fix)
- data_feed.validation_error_rate: daily count of rate value validation failures in the data feed`,
  };
}

function contactListTicket(clientName: string, voicebotName: string): FullTicketDraft {
  return {
    title:    `${clientName} — Contact list quality investigation and refresh (${voicebotName})`,
    priority: 'high',
    context:  `${clientName} is experiencing an anomalously low answer rate (currently ~28% vs. a healthy baseline of ~60%). The client suspects that a significant proportion of the contact list contains inactive, disconnected, or reassigned phone numbers. This investigation aims to identify the root cause and execute a contact list cleansing and refresh.`,
    userStory: `As a Technical Operations Lead managing ${clientName}'s ${voicebotName} deployment, I want to identify and remove invalid contacts from the dialling list so that ${voicebotName}'s answer rate recovers to a level comparable with other healthy clients in the portfolio.`,
    acceptanceCriteria: [
      'Contact list is audited: each number classified as active / inactive / invalid / reassigned',
      'Invalid and inactive numbers are removed from the active dialling set',
      'Cleansed list is validated against an external number verification service before re-import',
      'Answer rate is monitored weekly for 4 weeks post-cleanse to confirm recovery',
      'A process is established for periodic contact list refresh (frequency to be agreed with client)',
      'The investigation report is shared with the client before list cleansing begins',
    ],
    dependencies: [
      `${clientName} raw contact list export with last-updated timestamps`,
      'Number verification API (e.g. HLR lookup) for mobile number validation',
      `${clientName} approval before any contacts are removed from the dialling set`,
    ],
    openQuestions: [
      'Does ${clientName} have a preferred number verification vendor, or should Domu recommend one?',
      'What is the acceptable minimum list size after cleansing before a fresh list purchase is required?',
      'Should the cleansed list be supplemented with a new contact list purchase from a third party?',
      'Is there a specific delinquency vintage (age of debt) that correlates with lower answer rates?',
    ],
    observability: `- contact.answer_rate: weekly answer rate before and after contact list refresh (target: >55%)
- contact.invalid_number_rate: % of dials resulting in "invalid number" outcomes (target: <5%)
- contact.list_age_days: days since last contact list update (alert if >30 days)
- data.refresh_cycle_time: end-to-end time for contact list validation and import`,
  };
}

function callingWindowTicket(clientName: string, voicebotName: string, rawRequest: string): FullTicketDraft {
  return {
    title:    `${clientName} — Update calling window policy for ${voicebotName}`,
    priority: 'medium',
    context:  `${clientName} has requested a change to the permitted calling window for ${voicebotName}. The current policy may not reflect the client's operational needs. All window changes must be implemented in the CallingPolicy configuration and validated before the next call batch runs. Client request: "${rawRequest.slice(0, 200)}${rawRequest.length > 200 ? '…' : ''}"`,
    userStory: `As the Domu operations team managing ${clientName}, I want to update the CallingPolicy configuration for ${voicebotName} so that outbound calls are made only within the client's newly specified permitted hours, ensuring compliance and meeting client expectations.`,
    acceptanceCriteria: [
      'CallingPolicy for the client is updated with the new allowedStart, allowedEnd, and allowedDays values',
      'The pre-call time guard enforces the updated policy before each call dispatch',
      'No calls are placed outside the new window after the policy change takes effect',
      'The change is validated by reviewing the first 24 hours of call timestamps after deployment',
      'If the window is expanded, a legal review confirms the new hours comply with applicable regulations',
    ],
    dependencies: [
      `${clientName} written confirmation of the new calling window specification`,
      'Legal review confirming the new hours comply with PROCON / applicable consumer-protection regulations',
      'Pre-call guard implementation that reads the CallingPolicy at dispatch time',
    ],
    openQuestions: [
      `What are the exact new permitted hours and days ${clientName} is requesting?`,
      'Are there regional variations within the client\'s portfolio that require different windows?',
      'When should the new window take effect — immediately or at the start of the next week?',
    ],
    observability: `- compliance.within_window_rate: % of calls placed within permitted hours (target: 100%)
- compliance.out_of_window_count: absolute count of calls outside permitted window (target: 0 after change)
- policy.propagation_latency: seconds between policy update and effective enforcement in the dispatcher`,
  };
}

function dataIntegrationTicket(clientName: string, voicebotName: string): FullTicketDraft {
  return {
    title:    `${clientName} — Investigate ${voicebotName} account data integration accuracy`,
    priority: 'high',
    context:  `${clientName} is receiving customer complaints that ${voicebotName} is quoting incorrect account balances during calls. This suggests a data feed inconsistency between the voicebot's data source and ${clientName}'s core banking system. The investigation must identify whether the discrepancy is caused by a stale cache, a calculation error, or a data mapping issue.`,
    userStory: `As a Technical Operations Lead, I want to identify and fix the root cause of the account balance discrepancy in ${voicebotName}'s data feed so that ${clientName}'s customers receive accurate balance information and QA incorrect-statement flags return to zero.`,
    acceptanceCriteria: [
      'Root cause of balance discrepancy is identified and documented',
      'Data feed is updated to source balances from the correct system of record',
      'Cache invalidation policy is reviewed and set to an appropriate TTL',
      'A spot-check of 20 accounts confirms quoted balances now match core system values',
      'QA incorrect-statement flag rate drops to zero within 2 weeks of fix',
      'A daily reconciliation report is created comparing voicebot-quoted balances to core system values',
    ],
    dependencies: [
      `${clientName} core banking system API or data export for balance reconciliation`,
      'Data feed architecture documentation from the integration team',
    ],
    openQuestions: [
      'Is the balance discrepancy consistent (fixed offset) or variable (timing-dependent)?',
      'Are all account types affected, or only specific delinquency statuses?',
      'How frequently is the data feed refreshed, and what is the current cache TTL?',
    ],
    observability: `- data.balance_accuracy_rate: % of balances quoted in sampled calls that match core system value (target: >99%)
- data.stale_cache_rate: % of calls using cached balance data older than the defined TTL
- integration.error_rate: daily count of data feed errors or timeout events
- qa.incorrect_statement_rate: weekly count of QA flags for balance discrepancies (target: 0 after fix)`,
  };
}

function genericTicket(clientName: string, voicebotName: string, rawRequest: string): FullTicketDraft {
  return {
    title:    `${clientName} — Client request: action required`,
    priority: 'medium',
    context:  `${clientName} has submitted a request regarding ${voicebotName}. Request: "${rawRequest.slice(0, 300)}${rawRequest.length > 300 ? '…' : ''}"`,
    userStory: `As a Technical Operations Lead managing ${clientName}, I want to implement the client's requested change to ${voicebotName} so that the client's operational requirements are met.`,
    acceptanceCriteria: [
      'Change is implemented as specified in the client request',
      'Implementation is validated against the client\'s acceptance criteria',
      'A QA call sample confirms the change behaves as expected',
    ],
    dependencies: [
      `${clientName} written confirmation of scope and acceptance criteria`,
      'Technical review of implementation approach',
    ],
    openQuestions: [
      'What are the exact functional requirements for this change?',
      'What is the client\'s expected timeline for implementation?',
      'Are there any dependencies on the client\'s internal systems?',
    ],
    observability: '- Metrics to be defined once implementation scope is confirmed.',
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCategory(cat: string): string {
  return cat.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function selectObservability(lowerTitle: string, rawRequest: string): string {
  const lower = rawRequest.toLowerCase();
  if (lowerTitle.includes('pix') || lower.includes('pix')) {
    return `- pix.offer_rate: % of eligible calls where PIX was offered
- pix.acceptance_rate: % of PIX offers accepted
- pix.confirmation_rate: % of accepted offers confirmed via webhook within timeout
- payment.conversion_rate: weekly conversion rate before and after PIX launch
- payment.method_split: payments by card / boleto / PIX per week`;
  }
  return '- Metrics to be confirmed by engineering after implementation scope is agreed.';
}

const USER_STORIES: Record<string, (vb: string, c: string) => string> = {
  payment_objection: (vb, c) =>
    `As ${vb} (${c} collections agent), when a customer expresses inability to pay the proposed amount but indicates genuine willingness to pay, I want to offer alternative payment options or escalate to a human specialist, so that payment intent is captured before the call ends.`,
  incorrect_statement: (vb, c) =>
    `As ${vb} (${c} collections agent), when quoting financial terms, I want to read only from the verified data feed at call initialisation, so that customers receive accurate information and regulatory compliance is maintained.`,
  dropped_too_early: (vb, c) =>
    `As ${vb} (${c} collections agent), when a customer pauses briefly during negotiation, I want to hold the call with a re-engagement prompt before disconnecting, so that payment opportunities are not lost due to premature termination.`,
  compliance_concern: (vb, c) =>
    `As ${vb} (${c} collections agent), I want to verify local time against the permitted calling window before each call attempt, so that all outbound contacts comply with consumer-protection regulations.`,
  wrong_outcome: (vb, c) =>
    `As ${vb} (${c} collections agent), when a customer disputes the outcome or provides a payment reference, I want to flag the account for manual verification rather than recording a definitive outcome, so that collection records remain accurate.`,
};

const AC: Record<string, string[]> = {
  payment_objection: [
    'When customer declines, offer at least two alternatives (PIX, reduced instalment, human callback) before ending the call',
    'If customer makes any counter-offer, route to a human specialist rather than auto-declining',
    'Record outcome as "pending_escalation" when customer expresses payment intent but no arrangement is confirmed',
    'Do not terminate the call while the customer is mid-sentence',
  ],
  incorrect_statement: [
    'Financial figures are sourced from the verified data feed at call initialisation',
    'If data feed returns an out-of-bounds value, halt negotiation and offer a callback',
    'Pre-call validation cross-checks key figures against the underlying contract record',
    'Any discrepancy is logged as an incident',
  ],
  dropped_too_early: [
    'Minimum 15-second silence buffer before terminating any active call',
    'Re-engagement prompt fires after 8 seconds of silence: "I am still here whenever you are ready"',
    'If call ends before outcome is captured, an automatic callback is scheduled within 30 minutes',
    'Premature disconnection events are logged for monitoring',
  ],
  compliance_concern: [
    'Pre-call guard checks local wall-clock time against CallingPolicy.allowedStart and .allowedEnd',
    'Pre-call guard confirms the date is not in CallingPolicy.holidays',
    'If either check fails, the call is rescheduled — not placed',
    'A compliance incident record is generated for every out-of-window call attempt',
  ],
  wrong_outcome: [
    '"payment_claimed" is a valid intermediate outcome — account is paused from re-dialling',
    'When customer provides a payment reference, it is logged and queued for manual verification',
    'Accounts with "payment_claimed" outcome are not re-dialled until verification completes',
    'Verified outcomes update to "payment_collected" or "payment_disputed"',
  ],
};
