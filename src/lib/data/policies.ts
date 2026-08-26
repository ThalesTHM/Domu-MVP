import type { CallingPolicy } from './types';

// Brazilian national holidays in 2026 (federal level)
const BR_HOLIDAYS_2026 = [
  '2026-01-01', // New Year's Day
  '2026-02-16', // Carnaval (Monday)
  '2026-02-17', // Carnaval (Tuesday)
  '2026-04-03', // Good Friday (Sexta-Feira Santa)
  '2026-04-21', // Tiradentes
  '2026-05-01', // Labour Day (Dia do Trabalho)
  '2026-06-04', // Corpus Christi
  '2026-09-07', // Independence Day (Dia da Independência)
  '2026-10-12', // Our Lady of Aparecida
  '2026-11-02', // All Souls' Day (Finados)
  '2026-11-15', // Proclamation of the Republic
  '2026-12-25', // Christmas
];

export const callingPolicies: CallingPolicy[] = [
  // ── Alpha Financial — São Paulo, broad window ─────────────────────────────
  {
    clientId: 'client-af',
    region: 'São Paulo, SP',
    timezone: 'America/Sao_Paulo',
    allowedStart: '08:00',
    allowedEnd: '20:00',
    allowedDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
    holidays: BR_HOLIDAYS_2026,
  },

  // ── Beta Bank — São Paulo, standard window (CALL-BB-203 violates this) ────
  {
    clientId: 'client-bb',
    region: 'São Paulo, SP',
    timezone: 'America/Sao_Paulo',
    allowedStart: '08:00',
    allowedEnd: '20:00',
    allowedDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
    holidays: BR_HOLIDAYS_2026,
  },

  // ── Gamma Credit — Rio de Janeiro, weekdays only ──────────────────────────
  {
    clientId: 'client-gc',
    region: 'Rio de Janeiro, RJ',
    timezone: 'America/Sao_Paulo',
    allowedStart: '08:00',
    allowedEnd: '20:00',
    allowedDays: [1, 2, 3, 4, 5], // Mon–Fri only
    holidays: BR_HOLIDAYS_2026,
  },

  // ── Delta Finance — Porto Alegre, restricted to business hours ────────────
  // (CALL-DF-091 at 19:45 violates the 18:00 end time)
  {
    clientId: 'client-df',
    region: 'Porto Alegre, RS',
    timezone: 'America/Sao_Paulo',
    allowedStart: '08:00',
    allowedEnd: '18:00',  // stricter — auto finance client requires it
    allowedDays: [1, 2, 3, 4, 5], // Mon–Fri only
    holidays: BR_HOLIDAYS_2026,
  },

  // ── Epsilon Bank — Curitiba, standard window ─────────────────────────────
  {
    clientId: 'client-eb',
    region: 'Curitiba, PR',
    timezone: 'America/Sao_Paulo',
    allowedStart: '08:00',
    allowedEnd: '20:00',
    allowedDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
    holidays: BR_HOLIDAYS_2026,
  },

  // ── Zeta Financial — Belo Horizonte, includes Saturday ───────────────────
  {
    clientId: 'client-zf',
    region: 'Belo Horizonte, MG',
    timezone: 'America/Sao_Paulo',
    allowedStart: '08:00',
    allowedEnd: '20:00',
    allowedDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
    holidays: BR_HOLIDAYS_2026,
  },

  // ── Eta Credit — Goiânia, weekdays only ──────────────────────────────────
  {
    clientId: 'client-ec',
    region: 'Goiânia, GO',
    timezone: 'America/Sao_Paulo',
    allowedStart: '08:00',
    allowedEnd: '20:00',
    allowedDays: [1, 2, 3, 4, 5], // Mon–Fri only
    holidays: BR_HOLIDAYS_2026,
  },
];
