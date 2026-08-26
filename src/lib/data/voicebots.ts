import type { Voicebot } from './types';

export const voicebots: Voicebot[] = [
  // ── Alpha Financial ──────────────────────────────────────────────────────
  {
    id: 'vb-victor',
    name: 'Victor',
    clientId: 'client-af',
    status: 'active',
    version: 'v2.4.1',
    description: 'Collections agent for Alpha Financial consumer loans. Handles high-balance debt recovery with multi-step negotiation flows.',
  },
  {
    id: 'vb-leo',
    name: 'Leo',
    clientId: 'client-af',
    status: 'active',
    version: 'v2.3.0',
    description: 'Collections agent for Alpha Financial. Handles mid-tier consumer loan portfolios and payment plan negotiation.',
  },

  // ── Beta Bank (FEATURED) ─────────────────────────────────────────────────
  {
    id: 'vb-hannah',
    name: 'Hannah',
    clientId: 'client-bb',
    status: 'active',
    version: 'v3.1.2',
    description: 'Collections agent for Beta Bank retail banking accounts. Handles overdue payment negotiation and account resolution across consumer and credit card portfolios.',
  },
  {
    id: 'vb-nina',
    name: 'Nina',
    clientId: 'client-bb',
    status: 'paused',
    version: 'v2.8.0',
    description: 'Secondary collections agent for Beta Bank. Currently paused pending script review and alignment with updated compliance guidelines.',
  },

  // ── Gamma Credit ─────────────────────────────────────────────────────────
  {
    id: 'vb-clara',
    name: 'Clara',
    clientId: 'client-gc',
    status: 'error',
    version: 'v2.6.3',
    description: 'Collections agent for Gamma Credit. Currently flagged — elevated QA issue rate detected. Configuration review in progress.',
  },

  // ── Delta Finance ─────────────────────────────────────────────────────────
  {
    id: 'vb-marcus',
    name: 'Marcus',
    clientId: 'client-df',
    status: 'active',
    version: 'v1.9.2',
    description: 'Collections agent for Delta Finance auto loan delinquencies. Operates against a contact list under quality investigation due to low answer rates.',
  },

  // ── Epsilon Bank ──────────────────────────────────────────────────────────
  {
    id: 'vb-sophie',
    name: 'Sophie',
    clientId: 'client-eb',
    status: 'active',
    version: 'v2.5.1',
    description: 'Collections agent for Epsilon Bank mortgage servicing. Handles late mortgage payment outreach and workout arrangements.',
  },

  // ── Zeta Financial ────────────────────────────────────────────────────────
  {
    id: 'vb-felix',
    name: 'Felix',
    clientId: 'client-zf',
    status: 'active',
    version: 'v2.4.8',
    description: 'Collections agent for Zeta Financial personal loan portfolios. High-performing agent with consistent payment conversion.',
  },

  // ── Eta Credit ────────────────────────────────────────────────────────────
  {
    id: 'vb-aria',
    name: 'Aria',
    clientId: 'client-ec',
    status: 'active',
    version: 'v2.2.0',
    description: 'Collections agent for Eta Credit union member accounts. Specialised in empathetic member engagement and flexible payment arrangements.',
  },
];
