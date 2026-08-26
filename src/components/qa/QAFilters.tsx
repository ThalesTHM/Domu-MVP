'use client';

import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import type { Client } from '@/lib/data';

const QA_CATEGORIES = [
  { value: 'payment_objection',   label: 'Payment Objection'   },
  { value: 'incorrect_statement', label: 'Incorrect Statement' },
  { value: 'dropped_too_early',   label: 'Dropped Early'       },
  { value: 'compliance_concern',  label: 'Compliance Concern'  },
  { value: 'wrong_outcome',       label: 'Wrong Outcome'       },
];

const SEVERITIES = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High'     },
  { value: 'medium',   label: 'Medium'   },
  { value: 'low',      label: 'Low'      },
];

const STATUSES = [
  { value: 'open',         label: 'Open'         },
  { value: 'escalated',    label: 'Escalated'    },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved',     label: 'Resolved'     },
];

const SELECT_CLS =
  'h-8 rounded-md border border-border bg-card px-2.5 text-xs text-foreground ' +
  'focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer';

interface Props {
  clients: Client[];
  current: {
    client?: string;
    severity?: string;
    category?: string;
    status?: string;
  };
}

export function QAFilters({ clients, current }: Props) {
  const router  = useRouter();
  const pathname = usePathname();

  function update(key: string, value: string) {
    const params = new URLSearchParams();
    const next = { ...current, [key]: value || undefined };
    if (next.client)   params.set('client',   next.client);
    if (next.severity) params.set('severity', next.severity);
    if (next.category) params.set('category', next.category);
    if (next.status)   params.set('status',   next.status);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const hasFilters = !!(current.client || current.severity || current.category || current.status);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        className={SELECT_CLS}
        defaultValue={current.client ?? ''}
        onChange={(e) => update('client', e.target.value)}
      >
        <option value="">All clients</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        className={SELECT_CLS}
        defaultValue={current.severity ?? ''}
        onChange={(e) => update('severity', e.target.value)}
      >
        <option value="">All severities</option>
        {SEVERITIES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        className={SELECT_CLS}
        defaultValue={current.category ?? ''}
        onChange={(e) => update('category', e.target.value)}
      >
        <option value="">All categories</option>
        {QA_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <select
        className={SELECT_CLS}
        defaultValue={current.status ?? ''}
        onChange={(e) => update('status', e.target.value)}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}
