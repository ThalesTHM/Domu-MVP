import type { EngineeringTicket } from './types';

export const engineeringTickets: EngineeringTicket[] = [
  // ── ENG-001: Beta Bank — Add PIX payment to Hannah ────────────────────────
  // Generated from REQ-BB-001 (triggered by declining payment conversion + QA findings)
  {
    id: 'ENG-001',
    clientId: 'client-bb',
    clientRequestId: 'REQ-BB-001',
    title: 'Add PIX instant payment support to Hannah (Beta Bank)',
    context:
      'Beta Bank\'s payment conversion rate has declined from 35% to 17% over the past 8 weeks. QA review of flagged calls (ref: QA-BB-001, QA-BB-002) shows a recurring pattern: customers express genuine willingness to pay but decline the available payment methods (credit card, boleto) due to friction or lack of availability. Customer call analysis indicates PIX as the most frequently requested alternative. Beta Bank has also raised this directly (REQ-BB-001). Adding PIX is expected to recover 8–12 percentage points of payment conversion by capturing payment intent before the call ends.',
    userStory:
      'As Hannah (Beta Bank\'s collections voicebot), when a customer expresses willingness to pay but declines card or boleto options, I want to offer PIX as an immediate payment alternative so that I can capture payment before the call ends — without requiring the customer to call back or log in to a portal.',
    acceptanceCriteria: [
      'Hannah offers PIX during the payment negotiation step, after card/boleto are declined or not available',
      'A PIX key (QR code + alphanumeric copy-paste key) is generated per call and delivered via SMS to the debtor\'s registered mobile number within 10 seconds of verbal agreement',
      'Hannah verbally confirms the SMS was sent and reads the last 4 digits of the registered mobile for verification',
      'Payment confirmation is polled for up to 5 minutes after PIX is offered; Hannah uses a brief hold-and-check loop ("I\'m checking for your payment now...")',
      'Outcome is recorded as "payment_collected" only after a confirmed PIX webhook event is received',
      'If PIX payment is not confirmed within the timeout window, outcome is recorded as "payment_pending_pix" and an automated follow-up SMS reminder is scheduled for T+1 hour and T+24 hours',
      'If SMS delivery fails, Hannah offers an alternative: read the alphanumeric key verbally or schedule a human callback',
      'All PIX transactions are logged with: PIX key, E2E transaction ID, timestamp, and amount — for reconciliation with Beta Bank',
      'PIX option is only offered for debts ≤ R$10,000 (subject to Beta Bank PIX transaction limits)',
      'Existing call flows for card and boleto are not affected',
    ],
    dependencies: [
      'Beta Bank PIX key generation API / payment gateway credentials',
      'SMS delivery service (Twilio or equivalent) capable of reaching Brazilian mobile numbers',
      'Real-time PIX payment confirmation webhook from Beta Bank (or polling endpoint)',
      'Beta Bank compliance sign-off on PIX disclosure language for the script',
    ],
    openQuestions: [
      'What is the maximum call hold time Beta Bank accepts before Hannah must end the call (5 min assumption — needs confirmation)?',
      'Should PIX be offered before or after boleto? Beta Bank preference unknown.',
      'Is there a minimum debt amount below which PIX should not be offered (e.g., debts under R$50)?',
      'Who generates the PIX key — Domu infrastructure or Beta Bank payment gateway?',
      'What happens if the debtor pays a different amount than the agreed settlement via PIX?',
    ],
    priority: 'high',
    status: 'backlog',
    createdAt: '2026-08-23T15:00:00-03:00',
  },
];
