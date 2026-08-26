import type { ClientRequest } from './types';

export const clientRequests: ClientRequest[] = [
  // ── BETA BANK ─────────────────────────────────────────────────────────────

  // PRIMARY DEMO REQUEST — links to pre-generated engineering ticket ENG-001
  {
    id: 'REQ-BB-001',
    clientId: 'client-bb',
    submittedAt: '2026-08-23T09:15:00-03:00',
    rawRequest:
      'We would like to add PIX as a payment option during Hannah\'s collections calls. Our customers are increasingly requesting PIX as their preferred payment method, and we believe this is a major contributor to our declining payment conversion. Many customers say they want to pay but don\'t have their card available — PIX would let them pay instantly from any bank app. Can this be prioritised?',
    engineeringTicketId: 'ENG-001',
  },

  {
    id: 'REQ-BB-002',
    clientId: 'client-bb',
    submittedAt: '2026-08-21T14:30:00-03:00',
    rawRequest:
      'We need Hannah\'s calling window updated. Currently she calls Monday to Saturday. We would like to add Saturday mornings from 8 AM to 12 PM, and also ensure she is not calling after 8 PM — we had a customer complaint about a late call this week.',
    engineeringTicketId: null,
  },

  // ── ALPHA FINANCIAL ──────────────────────────────────────────────────────

  {
    id: 'REQ-AF-001',
    clientId: 'client-af',
    submittedAt: '2026-08-19T10:00:00-03:00',
    rawRequest:
      'The base interest rate used in our disclosures needs to be updated from 12.5% p.a. to 13.0% p.a., effective September 1st 2026. Please update both Victor and Leo\'s scripts before the end of August so we are compliant from day one of the new rate period.',
    engineeringTicketId: null,
  },

  // ── GAMMA CREDIT ─────────────────────────────────────────────────────────

  {
    id: 'REQ-GC-001',
    clientId: 'client-gc',
    submittedAt: '2026-08-20T16:45:00-03:00',
    rawRequest:
      'We are receiving customer complaints about Clara providing incorrect balance information during calls. Several customers have contacted us after calls saying the balance quoted doesn\'t match their most recent statement. We need an investigation and a fix urgently — this is damaging our brand and may have compliance implications.',
    engineeringTicketId: null,
  },

  // ── DELTA FINANCE ─────────────────────────────────────────────────────────

  {
    id: 'REQ-DF-001',
    clientId: 'client-df',
    submittedAt: '2026-08-18T11:20:00-03:00',
    rawRequest:
      'Our answer rates have been extremely low for the past two months — around 28%, when our benchmark should be closer to 60%. We suspect a significant portion of our contact list contains outdated or inactive phone numbers. Can you run an analysis of our contact data and advise on a data cleansing strategy? We are also considering purchasing a fresh contact list but want your input first.',
    engineeringTicketId: null,
  },

  // ── ETA CREDIT ────────────────────────────────────────────────────────────

  {
    id: 'REQ-EC-001',
    clientId: 'client-ec',
    submittedAt: '2026-08-15T09:00:00-03:00',
    rawRequest:
      'We would love for Aria to offer members a digital payment link via SMS at the end of each call, even if they do not pay during the call itself. Something like: "I\'ve just sent you a secure payment link to your registered mobile number — valid for 24 hours." This way we could capture payments after the call ends.',
    engineeringTicketId: null,
  },
];
