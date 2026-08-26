import { getClients } from './data';
import type { Client } from './data';

export type ClientStatus = 'critical' | 'needs_attention' | 'healthy';

export interface PriorityIssue {
  description: string;
  severity: 'critical' | 'warning';
}

export interface ClientPriority {
  clientId: string;
  clientName: string;
  status: ClientStatus;
  issues: PriorityIssue[];
}

// Deterministic thresholds — adjust to tune the prioritisation system
const ANSWER_RATE_CRITICAL = 40;   // % below this → critical
const ANSWER_RATE_WARN     = 58;   // % below this → needs attention
const CONV_CRITICAL        = 22;   // % current-week conversion → critical
const CONV_WARN            = 30;   // % current-week conversion → needs attention
const QA_CRITICAL          = 50;   // issue count → critical
const QA_WARN              = 15;   // issue count → needs attention
const CONV_DECLINE_FACTOR  = 0.75; // current < oldest × factor ⇒ significant declining trend

function currentConv(client: Client): number {
  return client.stats.weekly.at(-1)?.paymentConversion ?? client.stats.paymentConversion;
}

function oldestConv(client: Client): number {
  return client.stats.weekly.at(0)?.paymentConversion ?? client.stats.paymentConversion;
}

export function getClientPriority(client: Client): ClientPriority {
  const curr    = currentConv(client);
  const oldest  = oldestConv(client);
  const declining = curr < oldest * CONV_DECLINE_FACTOR;

  const issues: PriorityIssue[] = [];

  if (client.stats.answerRate < ANSWER_RATE_CRITICAL) {
    issues.push({
      description: `Answer rate critically low at ${client.stats.answerRate.toFixed(0)}% — healthy clients average ~64%`,
      severity: 'critical',
    });
  } else if (client.stats.answerRate < ANSWER_RATE_WARN) {
    issues.push({
      description: `Answer rate below threshold at ${client.stats.answerRate.toFixed(0)}%`,
      severity: 'warning',
    });
  }

  if (curr < CONV_CRITICAL && declining) {
    const relativePct = Math.round(((oldest - curr) / oldest) * 100);
    issues.push({
      description: `Payment conversion declined ${relativePct}% over 8 weeks (${oldest.toFixed(0)}% → ${curr.toFixed(0)}%)`,
      severity: 'critical',
    });
  } else if (curr < CONV_WARN) {
    issues.push({
      description: `Payment conversion below threshold at ${curr.toFixed(0)}%`,
      severity: 'warning',
    });
  }

  if (client.stats.qaIssues > QA_CRITICAL) {
    issues.push({
      description: `${client.stats.qaIssues} QA issues flagged this period — immediate review required`,
      severity: 'critical',
    });
  } else if (client.stats.qaIssues > QA_WARN) {
    issues.push({
      description: `${client.stats.qaIssues} QA issues flagged this period`,
      severity: 'warning',
    });
  }

  const status: ClientStatus =
    issues.some((i) => i.severity === 'critical') ? 'critical' :
    issues.length > 0                              ? 'needs_attention' :
                                                     'healthy';

  return { clientId: client.id, clientName: client.name, status, issues };
}

export function getAllPriorities(): ClientPriority[] {
  const order: Record<ClientStatus, number> = { critical: 0, needs_attention: 1, healthy: 2 };
  return getClients()
    .map(getClientPriority)
    .sort((a, b) => order[a.status] - order[b.status] || a.clientName.localeCompare(b.clientName));
}
