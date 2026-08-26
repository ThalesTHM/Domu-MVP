/**
 * Challenge data — development/demo mode only.
 * Transcripts are VERBATIM from the supplied Domu take-home challenge recordings.
 * Do not alter, summarise, or rewrite them. The inconsistencies are QA evidence.
 */
import type { Client, Voicebot, Call, QAIssue, TranscriptLine, WeeklyStats, CallingPolicy } from './types';

// Minimal 8-week history — only the last week has activity
const challengeWeekly: WeeklyStats[] = [
  { weekStart: '2026-07-06', totalCalls: 0, answeredCalls: 0, payments: 0, answerRate: 0, paymentConversion: 0 },
  { weekStart: '2026-07-13', totalCalls: 0, answeredCalls: 0, payments: 0, answerRate: 0, paymentConversion: 0 },
  { weekStart: '2026-07-20', totalCalls: 0, answeredCalls: 0, payments: 0, answerRate: 0, paymentConversion: 0 },
  { weekStart: '2026-07-27', totalCalls: 0, answeredCalls: 0, payments: 0, answerRate: 0, paymentConversion: 0 },
  { weekStart: '2026-08-03', totalCalls: 0, answeredCalls: 0, payments: 0, answerRate: 0, paymentConversion: 0 },
  { weekStart: '2026-08-10', totalCalls: 0, answeredCalls: 0, payments: 0, answerRate: 0, paymentConversion: 0 },
  { weekStart: '2026-08-17', totalCalls: 0, answeredCalls: 0, payments: 0, answerRate: 0, paymentConversion: 0 },
  { weekStart: '2026-08-24', totalCalls: 2, answeredCalls: 2, payments: 0, answerRate: 100, paymentConversion: 0 },
];

export const challengeClient: Client = {
  id: 'client-challenge',
  name: 'Challenge Client',
  industry: 'Collections (Challenge Data)',
  voicebotIds: ['vb-challenge-hannah'],
  alert: 'Challenge data — 3 QA findings across 2 calls. Two critical findings require immediate review.',
  stats: {
    totalCalls: 2,
    answeredCalls: 2,
    payments: 0,
    failedCalls: 0,
    qaIssues: 3,
    answerRate: 100,
    paymentConversion: 0,
    weekly: challengeWeekly,
  },
};

export const challengeVoicebot: Voicebot = {
  id: 'vb-challenge-hannah',
  name: 'Hannah',
  clientId: 'client-challenge',
  status: 'error',
  version: 'challenge',
  description: 'Challenge-provided call recordings. Two calls flagged with critical QA findings: inconsistent customer identity data and contradictory financial amounts.',
};

// ── CALL 1 TRANSCRIPT ─────────────────────────────────────────────────────────
// Source: actual supplied challenge recording (CLL9d787af7447e5b6475537762a0954da1_redacted.wav)
// Transcript is VERBATIM — do not alter
// Speaker 1 = Hannah (bot) | Speaker 2 = customer
// timeSeconds = seconds elapsed from call start, derived from [HH:MM:SS.mmm] timestamps

const call1Transcript: TranscriptLine[] = [
  { speaker: 'bot',      timeSeconds:   2, text: "Thank you for calling. My name is Hannah. This call may be recorded for quality purposes. I can help with most of your questions right away, but first, if you'd prefer to continue in Spanish, please say Spanish. So how can I help you today?" },
  { speaker: 'customer', timeSeconds:  19, text: "Uh, I'm trying to see of the remaining balance I have on the, uh, account, and if I still I still, uh, have time to pay it off." },
  { speaker: 'bot',      timeSeconds:  30, text: "I can help you with that." },
  { speaker: 'customer', timeSeconds:  31, text: "Within the 90 days, what I'm saying." },
  { speaker: 'bot',      timeSeconds:  34, text: "Thank you for clarifying. To check your remaining balance and confirm if you're still within the 90-day period for payoff, I'll just need to verify your identity for your security." },
  { speaker: 'customer', timeSeconds:  44, text: "Okay." },
  { speaker: 'bot',      timeSeconds:  45, text: "Can you please provide your full name? Thank you, Ms. Anderson. Can you please provide your full date of birth, including the year, month, and day? I—" },
  { speaker: 'customer', timeSeconds:  73, text: "Yes, I do." },
  // KEY EVIDENCE: contradictory financial amounts ($143 vs $1,086.86) + first name shift (Ms. Anderson → Aisha)
  { speaker: 'bot',      timeSeconds:  76, text: "Thank you. Next. Could you provide the last 4 digits of your Social Security number? Thank you. Finally, could you provide your 5-digit zip code? Thank you, Aisha. I was able to locate your account. Your current total due is $143. $1,086.86, and you have one biweekly payment past due. Your remaining balance to pay off the lease is $691.07. You are still within your 90-day early payoff period, which is good through today, May 1st, 2026. Would you like to pay off your lease today, or do you have another question about your account?" },
  { speaker: 'customer', timeSeconds: 129, text: "Uh, Taka, can you turn that off for a minute?" },
  // KEY EVIDENCE: speech recognition / response generation failure
  { speaker: 'bot',      timeSeconds: 134, text: "I'm here to help with your Okinawan." },
  { speaker: 'customer', timeSeconds: 136, text: "Just a moment. It's live." },
  { speaker: 'bot',      timeSeconds: 140, text: "Nope. Take your time. Let me know when you're ready to continue or if you need any assistance." },
  { speaker: 'customer', timeSeconds: 148, text: "I'm ready. I'm ready. Um, when is the last day for the payoff?" },
  { speaker: 'bot',      timeSeconds: 156, text: "The last day for your 90-day early payoff is today, May 1st. 2026. If you want to take advantage of the early payoff option, you would need to complete the payment today. Would you like help making that payment now, or do you have any other questions?" },
  { speaker: 'customer', timeSeconds: 173, text: "Oh, um, you say how much it is? Six what?" },
  // Name shift: Ms. Anderson → Aisha (01:16) → Alicia (02:58)
  { speaker: 'bot',      timeSeconds: 178, text: "Of course, Alicia. Your payoff amount is $691.07. This is the total needed to pay off your lease today within the 90-day period. Would you like to proceed with this payment now?" },
  { speaker: 'customer', timeSeconds: 192, text: "Yes, I would." },
  // Name shift: Alicia → Amanda (03:15)
  { speaker: 'bot',      timeSeconds: 195, text: "Great, Amanda. To confirm, you'd like to pay $691.07 today to pay off your lease within the 90-day period. Is that correct?" },
  { speaker: 'customer', timeSeconds: 210, text: "Yes." },
  { speaker: 'bot',      timeSeconds: 211, text: "Thank you for confirming. To process your payment of $691.07 today. I see there is no card on file for your account. For your security, I'll connect you with our secure payment area so you can enter your card details and complete your payment. Is that okay?" },
  { speaker: 'customer', timeSeconds: 228, text: "I do have a card on file." },
  // Name shift back to: Alicia (03:53)
  { speaker: 'bot',      timeSeconds: 233, text: "Thank you for letting me know, Alicia. My system is not showing a card on file for your account at this time. To make sure your payment is processed securely, I'll need to connect you with our secure payment area so you can enter your card details. Is that alright?" },
  { speaker: 'customer', timeSeconds: 250, text: "And you said my payoff amount is $691 and how much change?" },
  { speaker: 'bot',      timeSeconds: 257, text: "Yes, your payoff amount is $691.07. That is the total amount needed to pay off your lease today. There is no change or additional fee beyond that amount. Would you like to continue and enter your card details to complete this payment?" },
  { speaker: 'customer', timeSeconds: 276, text: "Yes, I would." },
  // Name shift: Amanda / Alicia → Alisha (04:39)
  { speaker: 'bot',      timeSeconds: 279, text: "Thank you, Alisha. I'll now connect you with our secure payment area so you can enter your card details and complete your payment of $691.07. Please follow the prompts to finish your payment. Let me know if you need any help along the way. Ready to continue?" },
  { speaker: 'customer', timeSeconds: 297, text: "Yes." },
];

// ── CALL 2 TRANSCRIPT ─────────────────────────────────────────────────────────
// Source: actual supplied challenge recording (CLL2e7663914eab5d642e9de6a9c6e68e4b_redacted.wav)
// Transcript is VERBATIM — do not alter
// Speaker 1 = Hannah (bot) | Speaker 2 = customer | Speaker 3 = second voice on customer side
// Hannah's appropriate human-transfer decision is a CORRECT recovery — not a failure

const call2Transcript: TranscriptLine[] = [
  { speaker: 'bot',      timeSeconds:   2, text: "Thank you for calling us. My name is Hannah. This call may be recorded for quality purposes. I can help with most of your questions right away, but first, if you'd prefer to continue in Spanish, please say Spanish. So, how can I help you today?" },
  { speaker: 'customer', timeSeconds:  19, text: "Account information." },
  { speaker: 'bot',      timeSeconds:  22, text: "I can help you with your account information. To get started, To get started, I'll need to verify your identity. May I have your full name, please? Thank you, James. Next, could you please provide your full date of birth, including the year?" },
  { speaker: 'customer', timeSeconds:  47, text: "May 5th." },
  { speaker: 'customer', timeSeconds:  61, text: "0-4-5-6-7-8." },
  // Zip appears inline in bot response; name confirmed as "James Jenkins"
  { speaker: 'bot',      timeSeconds:  65, text: "Thank you. Now, could you please provide your 5-digit zip code? 31000. Thank you. Let me confirm the information you provided. Full name: James Jenkins, date of birth: 1985. Is all of this correct? Yes. I was able to locate your account. Your total due is $231.82. And your next payment is due on May 21st. How can I help you with your account today?" },
  { speaker: 'customer', timeSeconds: 115, text: "Um, well, I think I'm coming up to my 6-month, um, 6 months, and I was— they said that we could pay it off in 6 months, um, so I'm trying to get the payoff amount." },
  // KEY EVIDENCE: contradictory payoff amount ($2,992 vs $1,630) + name error (James Jenkins → "Jenna")
  { speaker: 'bot',      timeSeconds: 130, text: "Absolutely. Jenna. Your current payoff amount is $2,992 $1,630. This is the amount required to pay off your lease agreement in full as of today. If you'd like, I can also tell you how long this payoff amount is good through. Would you like that information?" },
  // Customer challenge — verbatim, supports the QA finding
  { speaker: 'customer', timeSeconds: 152, text: "Um, how is that possible? Whenever I was told, like, if you paid it off within the 6 months, it was like the cash price with, uh, like an extra $109 for like the fee or whatever. So on mine it shows cash price of $1,660." },
  // Appropriate recovery: Hannah escalates to human specialist — NOT a failure
  { speaker: 'bot',      timeSeconds: 171, text: "I understand your concern. The 6-month early payoff option is a special program, but the exact amount and eligibility depend on your lease agreement terms and timing. The cash price listed is $1,660. And there may be an additional fee for early payoff. To get the precise 6-month early payoff amount and confirm your eligibility, I'll need to connect you with a customer service representative who can review your contract details and provide the exact figure. Before I transfer you, is there anything else I can assist you with?" },
  { speaker: 'customer', timeSeconds: 208, text: "No." },
];

export const challengeCalls: Call[] = [
  {
    id: 'CALL-HANNAH-001',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    timestamp: '2026-05-01T10:15:00-05:00',
    duration: 300,
    answered: true,
    outcome: 'callback_scheduled',
    paymentAmount: null,
    transcript: call1Transcript,
    qaIssueId: 'QA-HANNAH-001',
    phoneNumber: '+1 555 ***-****',
    debtorName: 'Account Holder',
    debtAmount: 1086.86,
    audioFile: '/audio/CLL9d787af7447e5b6475537762a0954da1_redacted.wav',
  },
  {
    id: 'CALL-HANNAH-002',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    timestamp: '2026-05-01T14:32:00-05:00',
    duration: 210,
    answered: true,
    outcome: 'callback_scheduled',
    paymentAmount: null,
    transcript: call2Transcript,
    qaIssueId: 'QA-HANNAH-003',
    phoneNumber: '+1 555 ***-****',
    debtorName: 'James Jenkins',
    debtAmount: 2992,
    audioFile: '/audio/CLL2e7663914eab5d642e9de6a9c6e68e4b_redacted.wav',
  },
];

export const challengeQAIssues: QAIssue[] = [
  // ── Call 1 primary: inconsistent names + contradictory financial amounts ────────
  {
    id: 'QA-HANNAH-001',
    callId: 'CALL-HANNAH-001',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    category: 'incorrect_statement',
    severity: 'critical',
    description: 'Hannah provides contradictory financial information and addresses the customer using five different names within the same call. The total due is presented as two conflicting amounts in the same statement ($143 and $1,086.86). The customer is addressed as Ms. Anderson, Aisha, Alicia, Amanda, and Alisha in a single interaction.',
    evidence: 'At 01:16, Hannah states: "Your current total due is $143. $1,086.86, and you have one biweekly payment past due." — two contradictory amounts presented as the same balance.\n\nCustomer names used during the call (verbatim from transcript):\n• "Thank you, Ms. Anderson." (00:45)\n• "Thank you, Aisha." (01:16)\n• "Of course, Alicia." (02:58)\n• "Great, Amanda." (03:15)\n• "Thank you for letting me know, Alicia." (03:53)\n• "Thank you, Alisha." (04:39)\n\nSix inconsistent name references in a single session.',
    recommendation: 'Investigate the account-data response formatting and customer-identity state passed into the voicebot. Add validation preventing contradictory financial values from being presented in the same statement. Ensure customer identity is sourced consistently from a single authoritative field throughout the session.',
    status: 'open',
    flaggedAt: '2026-05-01T11:00:00-05:00',
    customTicketTitle: 'Fix account-data formatting and customer-identity consistency in Hannah',
    customTicketUserStory: 'As a customer interacting with Hannah, I want the agent to address me by a consistent, verified name and present financial figures that are internally coherent, so that I can trust the information I receive and make informed decisions.',
    customTicketAC: [
      'Hannah sources the customer name from a single authoritative identity field and uses it consistently throughout the session',
      'Financial amounts within a single statement are validated for internal consistency before being spoken',
      'Contradictory or malformed financial values trigger a defined fallback (e.g. connect to a specialist) rather than being spoken verbatim',
      'Account-data parsing errors are logged with sufficient context for engineering investigation',
      'A QA telemetry signal is emitted when a name inconsistency or financial contradiction is detected at runtime',
      'Existing valid account lookups with consistent data continue to function normally',
    ],
    customTicketOpenQuestions: [
      'Is the name inconsistency caused by multiple identity lookups during the session, or a single malformed response from the account API?',
      'Are both financial figures ($143 and $1,086.86) returned from the same data source, or from different upstream systems?',
      'What is the intended behavior when account-data validation fails — silent fallback, human transfer, or call termination?',
    ],
  },

  // ── Call 1 secondary: speech recognition / generation failure ("Okinawan") ──────
  {
    id: 'QA-HANNAH-002',
    callId: 'CALL-HANNAH-001',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    category: 'incorrect_statement',
    severity: 'medium',
    description: 'Hannah produces a semantically incoherent statement — "I\'m here to help with your Okinawan" — in response to the customer speaking to another person in the room. The response has no recognizable meaning in a collections or account-services context.',
    evidence: 'At 02:14, Hannah states: "I\'m here to help with your Okinawan." — spoken immediately after the customer said (02:09): "Uh, Taka, can you turn that off for a minute?" The customer was addressing another person; Hannah generated a response to what appears to have been a low-confidence or misrecognized utterance.',
    recommendation: 'Review speech recognition and response-generation behavior around interrupted conversations and low-confidence utterances. Add a minimum confidence threshold before substituting recognized text into response templates. Implement a safe fallback prompt ("I\'m sorry, I didn\'t quite catch that — could you please repeat?") for low-confidence scenarios.',
    status: 'open',
    flaggedAt: '2026-05-01T11:05:00-05:00',
  },

  // ── Call 2 primary: contradictory payoff amount ───────────────────────────────────
  // Hannah's subsequent human transfer is an APPROPRIATE RECOVERY — not a failure.
  {
    id: 'QA-HANNAH-003',
    callId: 'CALL-HANNAH-002',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    category: 'incorrect_statement',
    severity: 'critical',
    description: 'Hannah presents two conflicting payoff amounts ($2,992 and $1,630) in a single statement — a discrepancy of $1,362. Hannah also addresses the customer as "Jenna" when the verified account name is James Jenkins. The customer immediately identifies the contradiction. Hannah\'s subsequent decision to transfer the customer to a human specialist is an appropriate and correct recovery behavior.',
    evidence: 'At 02:10, Hannah states: "Absolutely. Jenna. Your current payoff amount is $2,992 $1,630." — two conflicting amounts in one statement, plus the customer is addressed as "Jenna" when verified as "James Jenkins".\n\nCustomer challenge (02:32, verbatim): "Um, how is that possible? Whenever I was told, like, if you paid it off within the 6 months, it was like the cash price with, uh, like an extra $109 for like the fee or whatever. So on mine it shows cash price of $1,660."\n\nHannah\'s human-transfer response (02:51) is the correct recovery action and is not classified as a failure.',
    recommendation: 'Prevent the voicebot from presenting a payoff amount when the returned value is ambiguous or internally inconsistent. Add validation on financial values before they are spoken, and automatically route contradictory or uncertain payoff information to a human representative.',
    status: 'open',
    flaggedAt: '2026-05-01T15:15:00-05:00',
    customTicketTitle: 'Add validation for financial amounts returned to Hannah',
    customTicketUserStory: 'As a customer interacting with Hannah, I want financial amounts presented to me to be accurate and internally consistent so that I can make payment decisions based on reliable information.',
    customTicketAC: [
      'Financial amounts returned to Hannah are validated before being spoken',
      'Malformed, missing, or conflicting values cannot be presented as authoritative',
      'Validation failure triggers an approved fallback or human transfer',
      'Financial values remain traceable for operational review',
      'Validation failures are exposed through QA and operational telemetry',
      'Existing valid financial values continue to work normally',
    ],
    customTicketOpenQuestions: [
      'What is the authoritative source when multiple account and payment systems return different values?',
      'Should the validation occur in the voicebot response layer or at the data-fetch level?',
      'What is the maximum acceptable latency for a real-time validation check before the call experience degrades?',
    ],
  },
];

export const challengeCallingPolicy: CallingPolicy = {
  clientId: 'client-challenge',
  region: 'United States',
  timezone: 'America/Chicago',
  allowedStart: '08:00',
  allowedEnd: '21:00',
  allowedDays: [1, 2, 3, 4, 5, 6],
  holidays: ['2026-01-01', '2026-07-04', '2026-11-26', '2026-12-25'],
};
