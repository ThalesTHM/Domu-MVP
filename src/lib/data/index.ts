/**
 * Data access layer for the Domu Technical Operations Command Center.
 * All data is representative demo/seed data — not production Domu data.
 */

export * from './types';

import { clients } from './clients';
import { voicebots } from './voicebots';
import { calls } from './calls';
import { qaIssues } from './qa-issues';
import { clientRequests } from './requests';
import { engineeringTickets } from './tickets';
import { callingPolicies } from './policies';

import type {
  Client,
  Voicebot,
  Call,
  QAIssue,
  ClientRequest,
  EngineeringTicket,
  CallingPolicy,
  CallingWindowCheck,
  QAStatus,
  QACategory,
} from './types';

// ─── Clients ─────────────────────────────────────────────────────────────────

export function getClients(): Client[] {
  return clients;
}

export function getClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

// ─── Voicebots ────────────────────────────────────────────────────────────────

export function getVoicebots(clientId?: string): Voicebot[] {
  if (clientId) return voicebots.filter((v) => v.clientId === clientId);
  return voicebots;
}

export function getVoicebot(id: string): Voicebot | undefined {
  return voicebots.find((v) => v.id === id);
}

// ─── Calls ────────────────────────────────────────────────────────────────────

export function getCalls(options: {
  clientId?: string;
  voicebotId?: string;
  flaggedOnly?: boolean;
  limit?: number;
} = {}): Call[] {
  let result = calls;
  if (options.clientId)   result = result.filter((c) => c.clientId   === options.clientId);
  if (options.voicebotId) result = result.filter((c) => c.voicebotId === options.voicebotId);
  if (options.flaggedOnly) result = result.filter((c) => c.qaIssueId !== null);
  // Sort newest first
  result = [...result].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  if (options.limit) return result.slice(0, options.limit);
  return result;
}

export function getCall(id: string): Call | undefined {
  return calls.find((c) => c.id === id);
}

// ─── QA Issues ────────────────────────────────────────────────────────────────

export function getQAIssues(options: {
  clientId?: string;
  voicebotId?: string;
  status?: QAStatus;
  category?: QACategory;
} = {}): QAIssue[] {
  let result = qaIssues;
  if (options.clientId)   result = result.filter((q) => q.clientId   === options.clientId);
  if (options.voicebotId) result = result.filter((q) => q.voicebotId === options.voicebotId);
  if (options.status)     result = result.filter((q) => q.status     === options.status);
  if (options.category)   result = result.filter((q) => q.category   === options.category);
  return [...result].sort(
    (a, b) => new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime(),
  );
}

export function getQAIssue(id: string): QAIssue | undefined {
  return qaIssues.find((q) => q.id === id);
}

export function getQAIssueForCall(callId: string): QAIssue | undefined {
  return qaIssues.find((q) => q.callId === callId);
}

// ─── Client Requests ──────────────────────────────────────────────────────────

export function getRequests(clientId?: string): ClientRequest[] {
  const result = clientId
    ? clientRequests.filter((r) => r.clientId === clientId)
    : clientRequests;
  return [...result].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function getRequest(id: string): ClientRequest | undefined {
  return clientRequests.find((r) => r.id === id);
}

// ─── Engineering Tickets ──────────────────────────────────────────────────────

export function getTickets(clientId?: string): EngineeringTicket[] {
  return clientId
    ? engineeringTickets.filter((t) => t.clientId === clientId)
    : engineeringTickets;
}

export function getTicket(id: string): EngineeringTicket | undefined {
  return engineeringTickets.find((t) => t.id === id);
}

// ─── Calling Policies ─────────────────────────────────────────────────────────

export function getPolicy(clientId: string): CallingPolicy | undefined {
  return callingPolicies.find((p) => p.clientId === clientId);
}

/**
 * Deterministically checks whether a given ISO timestamp falls within
 * the client's permitted calling window (day-of-week, time, holidays).
 *
 * Uses the wall-clock time expressed in the timestamp string (offset-aware).
 * Does NOT require a runtime timezone library — relies on the UTC offset
 * already encoded in the ISO string (e.g., "2026-08-24T20:52:00-03:00").
 */
export function checkCallingWindow(
  clientId: string,
  isoTimestamp: string,
): CallingWindowCheck {
  const policy = getPolicy(clientId);
  if (!policy) return { allowed: false, reason: 'No calling policy found for this client.' };

  const date = new Date(isoTimestamp);
  if (isNaN(date.getTime())) return { allowed: false, reason: 'Invalid timestamp.' };

  // Extract local date/time from the offset in the ISO string
  const offset = parseUtcOffsetMinutes(isoTimestamp);
  const localMs = date.getTime() + offset * 60_000;
  const local = new Date(localMs);

  const dayOfWeek = local.getUTCDay(); // 0=Sun … 6=Sat (using UTC after offset adjustment)
  const hhmm = `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`;
  const dateStr = local.toISOString().slice(0, 10); // YYYY-MM-DD

  if (policy.holidays.includes(dateStr)) {
    return { allowed: false, reason: `${dateStr} is a public holiday (${policy.region}).` };
  }

  if (!policy.allowedDays.includes(dayOfWeek)) {
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek];
    return { allowed: false, reason: `Calls are not permitted on ${dayName}s for this client.` };
  }

  if (hhmm < policy.allowedStart) {
    return {
      allowed: false,
      reason: `Call at ${hhmm} is before the permitted start time of ${policy.allowedStart} (${policy.region}).`,
    };
  }

  if (hhmm >= policy.allowedEnd) {
    return {
      allowed: false,
      reason: `Call at ${hhmm} is at or after the permitted end time of ${policy.allowedEnd} (${policy.region}).`,
    };
  }

  return { allowed: true };
}

// Parses the UTC offset in minutes from an ISO 8601 string like "…-03:00" or "…+05:30"
function parseUtcOffsetMinutes(iso: string): number {
  const match = iso.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const sign = match[1] === '+' ? 1 : -1;
  return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
}

// ─── Convenience aggregates ───────────────────────────────────────────────────

/** Returns the latest week's payment conversion rate for a client. */
export function getCurrentConversionRate(clientId: string): number | undefined {
  const client = getClient(clientId);
  if (!client) return undefined;
  const latest = client.stats.weekly.at(-1);
  return latest?.paymentConversion;
}

/** Returns all open or escalated QA issues across the portfolio, newest first. */
export function getOpenQAIssues(): QAIssue[] {
  return getQAIssues().filter((q) => q.status === 'open' || q.status === 'escalated');
}
