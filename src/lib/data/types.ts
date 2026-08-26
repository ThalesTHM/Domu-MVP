// ─── Core domain types for the Domu Technical Operations Command Center ───────

export type VoicebotStatus = 'active' | 'paused' | 'error';

export type CallOutcome =
  | 'payment_collected'
  | 'payment_refused'
  | 'no_answer'
  | 'dropped'
  | 'callback_scheduled'
  | 'invalid_number'
  | 'disputed'
  | 'already_paid';

export type QACategory =
  | 'wrong_outcome'
  | 'incorrect_statement'
  | 'dropped_too_early'
  | 'payment_objection'
  | 'compliance_concern';

export type QASeverity = 'low' | 'medium' | 'high' | 'critical';
export type QAStatus = 'open' | 'under_review' | 'resolved' | 'escalated';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'backlog' | 'in_progress' | 'done';

export interface WeeklyStats {
  weekStart: string;         // ISO date of Monday (YYYY-MM-DD)
  totalCalls: number;
  answeredCalls: number;
  payments: number;
  answerRate: number;        // % of totalCalls, 1 decimal
  paymentConversion: number; // % of answeredCalls, 1 decimal
}

export interface ClientStats {
  totalCalls: number;
  answeredCalls: number;
  payments: number;
  failedCalls: number;       // technical errors, not no-answers
  qaIssues: number;
  answerRate: number;        // % overall
  paymentConversion: number; // % of answered, overall average
  weekly: WeeklyStats[];     // 8 weeks, oldest → newest
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  voicebotIds: string[];
  stats: ClientStats;
  alert?: string;            // attention banner shown on dashboard
}

export interface Voicebot {
  id: string;
  name: string;
  clientId: string;
  status: VoicebotStatus;
  version: string;
  description: string;
}

export interface TranscriptLine {
  speaker: 'bot' | 'customer';
  text: string;
  timeSeconds: number;       // seconds elapsed since call start
}

export interface Call {
  id: string;
  clientId: string;
  voicebotId: string;
  timestamp: string;           // ISO datetime
  duration: number;            // seconds
  answered: boolean;
  outcome: CallOutcome;
  paymentAmount: number | null; // BRL
  transcript: TranscriptLine[] | null;
  qaIssueId: string | null;
  phoneNumber: string;          // masked, e.g. +55 11 9****-4412
  debtorName: string;
  debtAmount: number;           // BRL
}

export interface QAIssue {
  id: string;
  callId: string;
  clientId: string;
  voicebotId: string;
  category: QACategory;
  severity: QASeverity;
  description: string;
  evidence: string;
  recommendation: string;
  status: QAStatus;
  flaggedAt: string;   // ISO datetime
}

export interface ClientRequest {
  id: string;
  clientId: string;
  submittedAt: string; // ISO datetime
  rawRequest: string;
  engineeringTicketId: string | null;
}

export interface EngineeringTicket {
  id: string;
  clientId: string;
  clientRequestId: string | null;
  title: string;
  context: string;
  userStory: string;
  acceptanceCriteria: string[];
  dependencies: string[];
  openQuestions: string[];
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
}

export interface CallingPolicy {
  clientId: string;
  region: string;
  timezone: string;
  allowedStart: string;  // "HH:MM" (24h)
  allowedEnd: string;    // "HH:MM" (24h)
  allowedDays: number[]; // 0=Sun, 1=Mon ... 6=Sat
  holidays: string[];    // YYYY-MM-DD dates when no calls are permitted
}

export interface CallingWindowCheck {
  allowed: boolean;
  reason?: string;
}
