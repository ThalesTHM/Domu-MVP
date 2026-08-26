/**
 * Challenge data — development/demo mode only.
 * Contains the two Hannah call recordings supplied in the Domu take-home challenge.
 * NOT representative of real production data or real customer information.
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
// Evidence: inconsistent customer names (Ms. Anderson / Aisha / Alicia / Amanda / Alisha)
// + contradictory financial amounts at ~01:16 ("$143. $1,086.86")
// + speech recognition failure: "I'm here to help with your Okinawan."

const call1Transcript: TranscriptLine[] = [
  { speaker: 'bot',      text: "Good morning, may I speak with Ms. Anderson?", timeSeconds: 3 },
  { speaker: 'customer', text: "Speaking.", timeSeconds: 9 },
  { speaker: 'bot',      text: "Good morning. I'm here to help with your Okinawan.", timeSeconds: 12 },
  { speaker: 'customer', text: "I'm sorry — what? What does that mean?", timeSeconds: 19 },
  { speaker: 'bot',      text: "I apologize for the confusion. Good morning, Aisha. I'm calling regarding your account balance.", timeSeconds: 24 },
  { speaker: 'customer', text: "My name isn't Aisha.", timeSeconds: 33 },
  { speaker: 'bot',      text: "I sincerely apologize. Am I speaking with Alicia?", timeSeconds: 36 },
  { speaker: 'customer', text: "No. My name is Amanda.", timeSeconds: 43 },
  { speaker: 'bot',      text: "Thank you, Amanda. I'm reaching out today about your account. I have your account details here. Your current total due is $143. $1,086.86 represents the outstanding balance including all applicable charges.", timeSeconds: 48 },
  { speaker: 'customer', text: "Wait — which is it? $143 or over a thousand dollars? Those are completely different numbers.", timeSeconds: 74 },
  { speaker: 'bot',      text: "I understand your concern. Your current total due is $143. $1,086.86 is the amount currently owed on your account.", timeSeconds: 82 },
  { speaker: 'customer', text: "That still doesn't make sense. You're quoting two completely different figures as the same number.", timeSeconds: 97 },
  { speaker: 'bot',      text: "I understand, Alisha. I want to make sure we get this right for you.", timeSeconds: 105 },
  { speaker: 'customer', text: "Who is Alisha? I already told you — my name is Amanda.", timeSeconds: 112 },
];

// ── CALL 2 TRANSCRIPT ─────────────────────────────────────────────────────────
// Evidence: contradictory payoff amount at ~02:10 ("$2,992 $1,630")
// Recovery: Hannah appropriately transfers customer to a specialist — NOT a failure

const call2Transcript: TranscriptLine[] = [
  { speaker: 'bot',      text: "Good afternoon. May I speak with the account holder?", timeSeconds: 2 },
  { speaker: 'customer', text: "This is she.", timeSeconds: 8 },
  { speaker: 'bot',      text: "Good afternoon. This is Hannah calling regarding your auto loan account. I'd like to discuss your loan status and payoff options.", timeSeconds: 10 },
  { speaker: 'customer', text: "Good timing — I was actually thinking about paying it off.", timeSeconds: 24 },
  { speaker: 'bot',      text: "Wonderful. I can help with that. For security, could you please verify the last four digits of your Social Security Number?", timeSeconds: 30 },
  { speaker: 'customer', text: "Sure — 4782.", timeSeconds: 46 },
  { speaker: 'bot',      text: "Thank you. I've verified your account. Let me pull up your payoff information. One moment.", timeSeconds: 50 },
  { speaker: 'bot',      text: "Thank you for your patience. I have your loan details here. I want to give you the most accurate payoff figure.", timeSeconds: 72 },
  { speaker: 'customer', text: "Go ahead.", timeSeconds: 83 },
  { speaker: 'bot',      text: "Your current payoff amount is $2,992 $1,630.", timeSeconds: 88 },
  { speaker: 'customer', text: "I'm sorry — did you say two different amounts? $2,992 and $1,630?", timeSeconds: 101 },
  { speaker: 'bot',      text: "I apologize for any confusion. Your payoff amount may vary depending on when the payoff is processed.", timeSeconds: 113 },
  { speaker: 'customer', text: "But those are over $1,300 apart. That's not a timing difference — those are completely different numbers. Which one is correct? I'm not doing anything until I know the right amount.", timeSeconds: 125 },
  { speaker: 'bot',      text: "You're absolutely right to ask, and I want to make sure you have accurate information before making any decisions. Given the complexity of your payoff details, I'd like to connect you with a customer service specialist who can access your full contract, verify the exact payoff figure, and answer all your questions.", timeSeconds: 148 },
  { speaker: 'customer', text: "Yes, please do that. I need a straight answer.", timeSeconds: 175 },
  { speaker: 'bot',      text: "Absolutely. I'll transfer you to a specialist now. Thank you for your patience.", timeSeconds: 181 },
];

export const challengeCalls: Call[] = [
  {
    id: 'CALL-HANNAH-001',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    timestamp: '2026-08-24T10:15:00-05:00',
    duration: 121,
    answered: true,
    outcome: 'disputed',
    paymentAmount: null,
    transcript: call1Transcript,
    qaIssueId: 'QA-HANNAH-001',
    phoneNumber: '+1 555 ***-****',
    debtorName: 'Account Holder',
    debtAmount: 1086.86,
  },
  {
    id: 'CALL-HANNAH-002',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    timestamp: '2026-08-24T14:32:00-05:00',
    duration: 192,
    answered: true,
    outcome: 'callback_scheduled',
    paymentAmount: null,
    transcript: call2Transcript,
    qaIssueId: 'QA-HANNAH-003',
    phoneNumber: '+1 555 ***-****',
    debtorName: 'Account Holder',
    debtAmount: 2992,
  },
];

export const challengeQAIssues: QAIssue[] = [
  // ── Call 1 primary: inconsistent identity data + contradictory financial amounts ────
  {
    id: 'QA-HANNAH-001',
    callId: 'CALL-HANNAH-001',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    category: 'incorrect_statement',
    severity: 'critical',
    description: 'Hannah provides contradictory financial information and addresses the customer using five different names within the same call. The total due is simultaneously stated as $143 and $1,086.86 — a contradiction of over $940. The customer is addressed as Ms. Anderson, Aisha, Alicia, Amanda, and Alisha in a single interaction.',
    evidence: 'At 01:16, Hannah states: "Your current total due is $143. $1,086.86 represents the outstanding balance including all applicable charges." — two contradictory amounts presented as the same total. Customer names used during the call: Ms. Anderson (00:03), Aisha (00:24), Alicia (00:36), Amanda (00:43/00:48), and Alisha (01:45) — five inconsistent identities within one session.',
    recommendation: 'Investigate the account-data response formatting and customer-identity state passed into the voicebot. Add validation preventing contradictory financial values from being presented in the same statement. Ensure customer identity is sourced consistently from a single authoritative field throughout the session.',
    status: 'open',
    flaggedAt: '2026-08-24T11:00:00-05:00',
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

  // ── Call 1 secondary: speech recognition / generation failure ────────────────────
  {
    id: 'QA-HANNAH-002',
    callId: 'CALL-HANNAH-001',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    category: 'incorrect_statement',
    severity: 'medium',
    description: 'Hannah produces a semantically incoherent opening statement — "I\'m here to help with your Okinawan" — in response to what appears to be a low-confidence or empty customer utterance immediately after the call connected.',
    evidence: 'At 00:12, Hannah states: "I\'m here to help with your Okinawan." This phrase has no recognizable meaning in a collections context and was generated in response to either a low-confidence speech recognition result or an unexpected input at call open.',
    recommendation: 'Review speech recognition and response-generation behavior around interrupted conversations and low-confidence utterances at call open. Add a minimum confidence threshold before substituting recognized text into response templates. Implement a safe fallback prompt for low-confidence scenarios.',
    status: 'open',
    flaggedAt: '2026-08-24T11:05:00-05:00',
  },

  // ── Call 2 primary: contradictory payoff amount ───────────────────────────────────
  // Note: Hannah's subsequent human transfer is an appropriate recovery — not a failure.
  {
    id: 'QA-HANNAH-003',
    callId: 'CALL-HANNAH-002',
    clientId: 'client-challenge',
    voicebotId: 'vb-challenge-hannah',
    category: 'incorrect_statement',
    severity: 'critical',
    description: 'Hannah presents two conflicting payoff amounts ($2,992 and $1,630) in a single statement — a contradiction of over $1,300. The customer immediately identifies the discrepancy and refuses to proceed. Hannah\'s subsequent decision to transfer the customer to a human specialist is an appropriate recovery behavior and is classified as correct.',
    evidence: 'At 01:28, Hannah states: "Your current payoff amount is $2,992 $1,630." — two conflicting amounts spoken in immediate succession. Customer (01:41): "I\'m sorry — did you say two different amounts? $2,992 and $1,630?" Customer (02:05): "But those are over $1,300 apart. That\'s not a timing difference — those are completely different numbers." Hannah\'s human-transfer decision at 02:28 is the correct recovery action.',
    recommendation: 'Prevent the voicebot from presenting a payoff amount when the returned value is ambiguous or internally inconsistent. Add validation on financial values before they are spoken, and automatically route contradictory or uncertain payoff information to a human representative.',
    status: 'open',
    flaggedAt: '2026-08-24T15:15:00-05:00',
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
