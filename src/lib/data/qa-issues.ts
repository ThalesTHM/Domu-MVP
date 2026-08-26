import type { QAIssue } from './types';

export const qaIssues: QAIssue[] = [
  // ── BETA BANK / HANNAH (5 issues) ─────────────────────────────────────────

  {
    id: 'QA-BB-001',
    callId: 'CALL-BB-047',
    clientId: 'client-bb',
    voicebotId: 'vb-hannah',
    category: 'payment_objection',
    severity: 'high',
    description: 'Customer expressed genuine willingness to pay R$300 but Hannah refused to explore alternatives below the R$1,170 minimum settlement threshold. Customer explicitly requested human escalation, which Hannah denied. Call ended with customer mid-sentence. Outcome recorded as "payment_refused" despite customer intent to pay.',
    evidence: 'At 01:04, customer states: "I really do want to pay." At 01:14, customer requests human transfer. At 01:29, customer says "I want to pay something—" while call is terminated. Hannah\'s minimum-settlement-only logic did not account for flexible arrangements or partial payments. No escalation path offered.',
    recommendation: 'Update Hannah\'s payment negotiation flow to: (1) accept counter-offers below the settlement minimum and route to a human specialist; (2) offer PIX as an immediate low-friction payment option; (3) never terminate a call while the customer is speaking. Outcome classification must distinguish between "payment declined" and "payment blocked by bot logic".',
    status: 'open',
    flaggedAt: '2026-08-20T17:45:00-03:00',
  },

  {
    id: 'QA-BB-002',
    callId: 'CALL-BB-089',
    clientId: 'client-bb',
    voicebotId: 'vb-hannah',
    category: 'dropped_too_early',
    severity: 'medium',
    description: 'Hannah terminated the call at 00:47 when the customer paused briefly to manage an incoming call. The customer had just begun stating she could make a payment. No attempt was made to hold, retry, or offer a brief pause before disconnecting.',
    evidence: 'At 00:25, customer begins: "I can pay—". At 00:36, customer asks to hold for a few seconds. Hannah immediately reads a customer service number and allows the call to drop at 00:47. No reconnection attempt or callback was scheduled.',
    recommendation: 'Configure a minimum call-hold buffer of 15 seconds when a customer pauses after expressing payment intent. Add a brief re-engagement prompt ("I\'m still here whenever you\'re ready") before ending the call. Schedule an automatic callback within 30 minutes if the call ends before a payment or outcome is captured.',
    status: 'open',
    flaggedAt: '2026-08-18T13:20:00-03:00',
  },

  {
    id: 'QA-BB-003',
    callId: 'CALL-BB-112',
    clientId: 'client-bb',
    voicebotId: 'vb-hannah',
    category: 'incorrect_statement',
    severity: 'critical',
    description: 'Hannah stated the monthly interest rate as 3.5% when the contractual rate for this account type is 1.8% per month. The customer produced their original contract on the call. This constitutes a materially incorrect financial statement and may expose Beta Bank to regulatory liability under Brazilian consumer credit regulations.',
    evidence: 'At 00:14, Hannah states: "your balance…has been accumulating interest at 3.5% per month since June 20th." At 00:26, customer challenges this figure citing their contract. At 00:43, customer confirms: "I have my original contract right here — it states 1.8%." Hannah repeated the incorrect rate at 00:37. The 3.5% figure cannot be reconciled with Beta Bank\'s standard consumer credit terms.',
    recommendation: 'URGENT: Audit the interest rate configuration in Hannah\'s account data integration. Cross-reference the rate source in the prompt template against the actual contract data feed. This is a potential compliance incident — freeze further calls to accounts where the rate may be mis-read pending investigation. Notify Beta Bank compliance team immediately.',
    status: 'escalated',
    flaggedAt: '2026-08-15T18:30:00-03:00',
  },

  {
    id: 'QA-BB-004',
    callId: 'CALL-BB-156',
    clientId: 'client-bb',
    voicebotId: 'vb-hannah',
    category: 'wrong_outcome',
    severity: 'high',
    description: 'Customer reported that she had already paid the balance via TED bank transfer earlier that morning and provided a transaction confirmation code. Hannah was unable to verify the payment in real time and recorded the outcome as "payment_refused", which is factually incorrect. This will trigger a duplicate collection call and damage customer trust.',
    evidence: 'At 00:21, customer states she paid via TED transfer. At 00:37, she provides transaction ID 2026082200947. Hannah acknowledged the information at 00:50 but still recorded outcome as "payment_refused". The correct outcome should be "disputed" or "already_paid" pending confirmation.',
    recommendation: 'Add a real-time payment verification webhook integration with Beta Bank\'s core banking system so Hannah can confirm same-day transfers before recording an outcome. In the interim, introduce an "unconfirmed payment" outcome state that queues the account for manual review rather than immediate re-dialling. Train the outcome classification logic to detect payment claim signals in the transcript.',
    status: 'under_review',
    flaggedAt: '2026-08-22T11:00:00-03:00',
  },

  {
    id: 'QA-BB-005',
    callId: 'CALL-BB-203',
    clientId: 'client-bb',
    voicebotId: 'vb-hannah',
    category: 'compliance_concern',
    severity: 'critical',
    description: 'A call was placed at 20:52 local time (GMT-3), which is outside Beta Bank\'s permitted calling window of 08:00–20:00 Monday–Saturday. The customer explicitly complained about the time and threatened a PROCON complaint. This is a direct violation of the calling policy agreed with the client.',
    evidence: 'Call timestamp: 2026-08-24T20:52:00-03:00. Beta Bank calling policy allows calls only between 08:00 and 20:00. The call was placed 52 minutes past the cutoff. Customer stated: "You are not allowed to call this late" and "I will be filing a complaint with PROCON." Customer confirmed they will report to consumer protection authority.',
    recommendation: 'IMMEDIATE: Investigate the scheduling logic that permitted this call to be initiated after 20:00. Implement a hard pre-call guard that checks local time against the client\'s CallingPolicy before any call is dispatched. Conduct a retroactive audit of calls in the last 30 days to identify any other out-of-window calls. Notify Beta Bank compliance and log this as a potential regulatory incident.',
    status: 'escalated',
    flaggedAt: '2026-08-24T21:10:00-03:00',
  },

  // ── GAMMA CREDIT / CLARA (4 issues) ──────────────────────────────────────

  {
    id: 'QA-GC-001',
    callId: 'CALL-GC-034',
    clientId: 'client-gc',
    voicebotId: 'vb-clara',
    category: 'incorrect_statement',
    severity: 'high',
    description: 'Clara quoted a balance of R$4,210.00 which the customer disputed against a recent statement of R$3,800.00. When asked to itemise the additional R$410 in charges, Clara was unable to provide a breakdown and continued to the settlement offer without resolving the discrepancy. This suggests an inconsistency in the balance data feed.',
    evidence: 'At 00:24, customer challenges the R$4,210 figure. Clara confirmed the figure at 00:34 but could not explain the components. The customer\'s statement balance is R$3,800 — the R$410 delta is unexplained. Clara offered a "10% discount" on the disputed figure without verifying its accuracy first.',
    recommendation: 'Investigate Gamma Credit\'s balance data integration for potential stale-cache or rounding issues. Add itemised charge disclosure to Clara\'s script for cases where the quoted balance differs from the last known statement. Require balance validation before proceeding to settlement.',
    status: 'open',
    flaggedAt: '2026-08-21T16:00:00-03:00',
  },

  {
    id: 'QA-GC-002',
    callId: 'CALL-GC-087',
    clientId: 'client-gc',
    voicebotId: 'vb-clara',
    category: 'wrong_outcome',
    severity: 'high',
    description: 'Customer is already on an active payment arrangement (R$650/month confirmed by email). Clara could not locate the arrangement in the system and proceeded to treat the account as unpaid. Outcome recorded as "payment_refused". Customer will be re-dialled despite being in good standing under a payment plan.',
    evidence: 'At 00:20, customer states she has an active R$650/month plan set up "last Tuesday". At 00:43, customer references a confirmation email. Clara explicitly stated "I don\'t see an active payment arrangement" at 00:32. At 00:53, Clara recorded outcome as "payment refused" despite no actual refusal.',
    recommendation: 'Verify Gamma Credit\'s payment arrangement synchronisation between their CRM and the data feed consumed by Clara. Add a payment-plan detection step early in the call flow that suspends further collection activity if an active arrangement is found. Outcome classification must include "active_arrangement" as a valid state.',
    status: 'open',
    flaggedAt: '2026-08-19T14:30:00-03:00',
  },

  {
    id: 'QA-GC-003',
    callId: 'CALL-GC-112',
    clientId: 'client-gc',
    voicebotId: 'vb-clara',
    category: 'dropped_too_early',
    severity: 'medium',
    description: 'Call ended at 00:34 before any meaningful negotiation took place. The customer had answered the call but the bot terminated before completing its opening statement. No cause for the early termination was found in the call logs.',
    evidence: 'Call duration: 34 seconds. Outcome: dropped. No payment discussion or outcome classification was reached. Cause may be a speech-recognition timeout or a connection drop attributed to the bot rather than the network.',
    recommendation: 'Review the speech recognition timeout configuration for Clara. Investigate whether consecutive dropped calls share a common infrastructure cause. Cross-reference with recent Clara deployment logs.',
    status: 'open',
    flaggedAt: '2026-08-23T11:00:00-03:00',
  },

  {
    id: 'QA-GC-004',
    callId: 'CALL-GC-178',
    clientId: 'client-gc',
    voicebotId: 'vb-clara',
    category: 'payment_objection',
    severity: 'medium',
    description: 'Customer indicated willingness to pay a partial amount but Clara did not offer a flexible arrangement or escalation path. Call ended with "payment_refused" recorded even though the customer did not explicitly refuse to pay.',
    evidence: 'Customer offered a partial payment; Clara cited the minimum settlement threshold without exploring alternatives. No human escalation was offered. Outcome classification appears incorrect based on customer language.',
    recommendation: 'Review and align Clara\'s payment objection handling with the updated negotiation playbook. Mirror the recommended changes from QA-BB-001 — add partial payment routing and PIX as a payment option.',
    status: 'open',
    flaggedAt: '2026-08-22T17:30:00-03:00',
  },

  // ── DELTA FINANCE / MARCUS (1 issue) ─────────────────────────────────────

  {
    id: 'QA-DF-001',
    callId: 'CALL-DF-091',
    clientId: 'client-df',
    voicebotId: 'vb-marcus',
    category: 'compliance_concern',
    severity: 'high',
    description: 'Marcus placed a call at 19:45 local time, past the Delta Finance calling policy end time of 18:00 Monday–Friday. Customer was reached and expressed discomfort with the call timing.',
    evidence: 'Call timestamp: 2026-08-20T19:45:00-03:00. Delta Finance policy end: 18:00. Call was placed 1 hour 45 minutes past the permitted window.',
    recommendation: 'Apply the same pre-call time guard fix recommended for Hannah (QA-BB-005). Audit Marcus call logs for any other out-of-window calls in the last 30 days. Notify Delta Finance account team.',
    status: 'open',
    flaggedAt: '2026-08-20T22:00:00-03:00',
  },

  // ── EPSILON BANK / SOPHIE (1 issue) ──────────────────────────────────────

  {
    id: 'QA-EB-001',
    callId: 'CALL-EB-055',
    clientId: 'client-eb',
    voicebotId: 'vb-sophie',
    category: 'payment_objection',
    severity: 'medium',
    description: 'Customer made a counter-offer below the settlement minimum for a R$5,400 mortgage arrear. Sophie did not explore the counter-offer or offer escalation to a human mortgage specialist. Call ended as "payment_refused".',
    evidence: 'Customer offered a partial payment. Sophie cited the minimum without exploring alternatives or connecting to a specialist. No flexible arrangement was discussed.',
    recommendation: 'For high-value mortgage accounts, configure Sophie to automatically escalate to a human specialist when the customer makes any payment counter-offer, regardless of the amount.',
    status: 'open',
    flaggedAt: '2026-08-20T16:30:00-03:00',
  },
];
