import type { Client, WeeklyStats } from './types';

// 8 consecutive Mondays ending on the current reporting week (2026-08-24)
const WEEK_STARTS = [
  '2026-07-06', '2026-07-13', '2026-07-20', '2026-07-27',
  '2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24',
];

function w(
  i: number,
  totalCalls: number,
  answerRate: number,   // 0–1
  conversion: number,   // 0–1, % of answered
): WeeklyStats {
  const answeredCalls = Math.round(totalCalls * answerRate);
  const payments = Math.round(answeredCalls * conversion);
  return {
    weekStart: WEEK_STARTS[i],
    totalCalls,
    answeredCalls,
    payments,
    answerRate: Math.round(answerRate * 1000) / 10,
    paymentConversion: Math.round(conversion * 1000) / 10,
  };
}

// ─── ALPHA FINANCIAL ─────────────────────────────────────────────────────────
// Healthy — stable answer rate ~65%, consistent ~42% payment conversion
const afWeekly: WeeklyStats[] = [
  w(0, 4200, 0.65, 0.42),
  w(1, 4300, 0.65, 0.42),
  w(2, 4350, 0.65, 0.43),
  w(3, 4400, 0.65, 0.42),
  w(4, 4250, 0.65, 0.42),
  w(5, 4380, 0.65, 0.43),
  w(6, 4320, 0.65, 0.42),
  w(7, 4200, 0.65, 0.42),
];

// ─── BETA BANK ───────────────────────────────────────────────────────────────
// DECLINING PAYMENT CONVERSION — conversion dropped from 35% → 17% over 8 weeks
const bbWeekly: WeeklyStats[] = [
  w(0, 4600, 0.62, 0.35),
  w(1, 4850, 0.62, 0.34),
  w(2, 4750, 0.62, 0.32),
  w(3, 4900, 0.62, 0.29),
  w(4, 4800, 0.62, 0.25),
  w(5, 4850, 0.62, 0.21),
  w(6, 4750, 0.62, 0.18),
  w(7, 4900, 0.62, 0.17),
];

// ─── GAMMA CREDIT ─────────────────────────────────────────────────────────────
// HIGH QA ISSUE RATE — performance metrics healthy but 89 QA flags this period
const gcWeekly: WeeklyStats[] = [
  w(0, 2650, 0.64, 0.42),
  w(1, 2800, 0.64, 0.43),
  w(2, 2750, 0.64, 0.42),
  w(3, 2900, 0.64, 0.41),
  w(4, 2850, 0.64, 0.42),
  w(5, 2800, 0.64, 0.43),
  w(6, 2750, 0.64, 0.42),
  w(7, 2800, 0.64, 0.42),
];

// ─── DELTA FINANCE ────────────────────────────────────────────────────────────
// LOW ANSWER RATE — answer rate stuck at 28%; suspected stale contact list
const dfWeekly: WeeklyStats[] = [
  w(0, 3900, 0.28, 0.29),
  w(1, 4100, 0.28, 0.30),
  w(2, 4000, 0.28, 0.28),
  w(3, 4200, 0.28, 0.29),
  w(4, 4100, 0.28, 0.29),
  w(5, 4150, 0.28, 0.28),
  w(6, 4050, 0.28, 0.30),
  w(7, 4100, 0.28, 0.29),
];

// ─── EPSILON BANK ─────────────────────────────────────────────────────────────
// Healthy — consistent ~65% answer rate, ~42% conversion
const ebWeekly: WeeklyStats[] = [
  w(0, 3300, 0.65, 0.42),
  w(1, 3450, 0.65, 0.42),
  w(2, 3400, 0.65, 0.43),
  w(3, 3500, 0.65, 0.42),
  w(4, 3350, 0.65, 0.42),
  w(5, 3450, 0.65, 0.43),
  w(6, 3400, 0.65, 0.42),
  w(7, 3300, 0.65, 0.42),
];

// ─── ZETA FINANCIAL ────────────────────────────────────────────────────────────
// Healthy — strong answer rate ~66%, stable ~42% conversion
const zfWeekly: WeeklyStats[] = [
  w(0, 2350, 0.66, 0.42),
  w(1, 2450, 0.66, 0.43),
  w(2, 2400, 0.66, 0.42),
  w(3, 2500, 0.66, 0.42),
  w(4, 2400, 0.66, 0.43),
  w(5, 2450, 0.66, 0.42),
  w(6, 2400, 0.66, 0.42),
  w(7, 2350, 0.66, 0.43),
];

// ─── ETA CREDIT ────────────────────────────────────────────────────────────────
// Healthy — smaller portfolio, solid ~64% answer rate, ~41% conversion
const ecWeekly: WeeklyStats[] = [
  w(0, 1850, 0.64, 0.41),
  w(1, 1950, 0.64, 0.42),
  w(2, 1900, 0.64, 0.41),
  w(3, 2000, 0.64, 0.42),
  w(4, 1900, 0.64, 0.41),
  w(5, 1950, 0.64, 0.42),
  w(6, 1900, 0.64, 0.41),
  w(7, 1850, 0.64, 0.42),
];

function sumStats(weekly: WeeklyStats[]) {
  const totalCalls = weekly.reduce((s, wk) => s + wk.totalCalls, 0);
  const answeredCalls = weekly.reduce((s, wk) => s + wk.answeredCalls, 0);
  const payments = weekly.reduce((s, wk) => s + wk.payments, 0);
  return {
    totalCalls,
    answeredCalls,
    payments,
    answerRate: Math.round((answeredCalls / totalCalls) * 1000) / 10,
    paymentConversion: Math.round((payments / answeredCalls) * 1000) / 10,
  };
}

export const clients: Client[] = [
  {
    id: 'client-af',
    name: 'Alpha Financial',
    industry: 'Consumer Lending',
    voicebotIds: ['vb-victor', 'vb-leo'],
    stats: {
      ...sumStats(afWeekly),
      failedCalls: 180,
      qaIssues: 5,
      weekly: afWeekly,
    },
  },
  {
    id: 'client-bb',
    name: 'Beta Bank',
    industry: 'Retail Banking',
    voicebotIds: ['vb-hannah', 'vb-nina'],
    alert: 'Payment conversion down 51% over 8 weeks (35% → 17%). Immediate investigation required.',
    stats: {
      ...sumStats(bbWeekly),
      failedCalls: 384,
      qaIssues: 34,
      weekly: bbWeekly,
    },
  },
  {
    id: 'client-gc',
    name: 'Gamma Credit',
    industry: 'Credit Services',
    voicebotIds: ['vb-clara'],
    alert: '89 QA issues flagged this period — performance metrics healthy but quality review required.',
    stats: {
      ...sumStats(gcWeekly),
      failedCalls: 265,
      qaIssues: 89,
      weekly: gcWeekly,
    },
  },
  {
    id: 'client-df',
    name: 'Delta Finance',
    industry: 'Auto Finance',
    voicebotIds: ['vb-marcus'],
    alert: 'Answer rate critically low at 28% — stale contact list suspected.',
    stats: {
      ...sumStats(dfWeekly),
      failedCalls: 520,
      qaIssues: 7,
      weekly: dfWeekly,
    },
  },
  {
    id: 'client-eb',
    name: 'Epsilon Bank',
    industry: 'Mortgage',
    voicebotIds: ['vb-sophie'],
    stats: {
      ...sumStats(ebWeekly),
      failedCalls: 145,
      qaIssues: 4,
      weekly: ebWeekly,
    },
  },
  {
    id: 'client-zf',
    name: 'Zeta Financial',
    industry: 'Personal Finance',
    voicebotIds: ['vb-felix'],
    stats: {
      ...sumStats(zfWeekly),
      failedCalls: 95,
      qaIssues: 3,
      weekly: zfWeekly,
    },
  },
  {
    id: 'client-ec',
    name: 'Eta Credit',
    industry: 'Credit Union',
    voicebotIds: ['vb-aria'],
    stats: {
      ...sumStats(ecWeekly),
      failedCalls: 76,
      qaIssues: 3,
      weekly: ecWeekly,
    },
  },
];
