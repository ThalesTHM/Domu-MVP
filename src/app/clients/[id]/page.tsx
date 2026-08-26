import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClient, getVoicebots, getCalls, getQAIssues, getRequests, getTickets } from '@/lib/data';
import { getClientPriority } from '@/lib/priorities';

type Props = { params: Promise<{ id: string }> };

function fmt(n: number) { return n.toLocaleString('en-US'); }
function pct(n: number) { return n.toFixed(1) + '%'; }

const QA_CATEGORY_LABELS: Record<string, string> = {
  wrong_outcome:       'Wrong Outcome',
  incorrect_statement: 'Incorrect Statement',
  dropped_too_early:   'Dropped Early',
  payment_objection:   'Payment Objection',
  compliance_concern:  'Compliance Concern',
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-950 text-red-400 border-red-900',
  high:     'bg-red-950/60 text-red-300 border-red-900/60',
  medium:   'bg-amber-950 text-amber-400 border-amber-900',
  low:      'bg-slate-800 text-slate-400 border-slate-700',
};

const STATUS_STYLES: Record<string, string> = {
  escalated:    'bg-red-950 text-red-400 border-red-900',
  open:         'bg-amber-950/70 text-amber-400 border-amber-900',
  under_review: 'bg-blue-950 text-blue-400 border-blue-900',
  resolved:     'bg-slate-800 text-slate-500 border-slate-700',
};

const VB_STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50',
  paused: 'bg-amber-950 text-amber-400 border-amber-900',
  error:  'bg-red-950 text-red-400 border-red-900',
};

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const vbs        = getVoicebots(client.id);
  const allCalls   = getCalls({ clientId: client.id, limit: 10 });
  const qaIssues   = getQAIssues({ clientId: client.id });
  const requests   = getRequests(client.id);
  const tickets    = getTickets(client.id);
  const priority   = getClientPriority(client);

  const currConv = client.stats.weekly.at(-1)?.paymentConversion ?? client.stats.paymentConversion;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">Portfolio</Link>
        <span>/</span>
        <span className="text-slate-300">{client.name}</span>
      </div>

      {/* Client header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-slate-100 text-xl font-semibold">{client.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{client.industry}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {priority.status === 'critical' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border bg-red-950 text-red-400 border-red-900 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Critical
            </span>
          )}
          {priority.status === 'needs_attention' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border bg-amber-950 text-amber-400 border-amber-900 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Needs Attention
            </span>
          )}
          {priority.status === 'healthy' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border bg-emerald-950/40 text-emerald-400 border-emerald-900/50 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Healthy
            </span>
          )}
        </div>
      </div>

      {/* Alert banner */}
      {client.alert && (
        <div className="bg-red-950/40 border border-red-900/60 rounded-lg px-4 py-3 text-red-300 text-sm">
          ⚠ {client.alert}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Calls',        value: fmt(client.stats.totalCalls),    alert: false },
          { label: 'Answer Rate',        value: pct(client.stats.answerRate),    alert: client.stats.answerRate < 50 },
          { label: 'Payments',           value: fmt(client.stats.payments),      alert: false },
          { label: 'Conv. Rate (now)',   value: pct(currConv),                   alert: currConv < 25 },
          { label: 'QA Issues',          value: String(client.stats.qaIssues),  alert: client.stats.qaIssues > 15 },
          { label: 'Failed Calls',       value: fmt(client.stats.failedCalls),   alert: false },
        ].map(({ label, value, alert }) => (
          <div key={label} className={`bg-slate-900 rounded-lg px-4 py-4 border ${alert ? 'border-red-900/70' : 'border-slate-800'}`}>
            <div className={`text-2xl font-semibold font-mono tracking-tight ${alert ? 'text-red-400' : 'text-slate-100'}`}>{value}</div>
            <div className="text-slate-500 text-xs font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Issues from priority analysis */}
      {priority.issues.length > 0 && (
        <div className="space-y-2">
          {priority.issues.map((iss, i) => (
            <div key={i} className={`flex items-start gap-2 px-4 py-3 rounded-lg border text-sm ${iss.severity === 'critical' ? 'bg-red-950/30 border-red-900/60 text-red-300' : 'bg-amber-950/30 border-amber-900/60 text-amber-300'}`}>
              <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${iss.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400'}`} />
              {iss.description}
            </div>
          ))}
        </div>
      )}

      {/* Voicebots */}
      <section>
        <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Voicebots</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {vbs.map((vb) => (
            <div key={vb.id} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-100 font-semibold">{vb.name}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${VB_STATUS_STYLES[vb.status] ?? ''}`}>
                  {vb.status}
                </span>
              </div>
              <div className="text-slate-600 text-xs font-mono mb-2">{vb.version}</div>
              <p className="text-slate-500 text-xs leading-relaxed">{vb.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QA Issues */}
      {qaIssues.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Flagged QA Issues</h2>
            <span className="text-slate-700 text-xs">{qaIssues.length} total</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="text-left  px-4 py-3 font-medium">Call ID</th>
                  <th className="text-left  px-4 py-3 font-medium">Voicebot</th>
                  <th className="text-left  px-4 py-3 font-medium">Category</th>
                  <th className="text-left  px-4 py-3 font-medium">Severity</th>
                  <th className="text-left  px-4 py-3 font-medium">Status</th>
                  <th className="text-left  px-4 py-3 font-medium">Flagged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {qaIssues.map((issue) => {
                  const vb = vbs.find((v) => v.id === issue.voicebotId);
                  return (
                    <tr key={issue.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">{issue.callId}</td>
                      <td className="px-4 py-3 text-slate-300">{vb?.name ?? issue.voicebotId}</td>
                      <td className="px-4 py-3 text-slate-300">{QA_CATEGORY_LABELS[issue.category] ?? issue.category}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[issue.severity] ?? ''}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${STATUS_STYLES[issue.status] ?? ''}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                        {new Date(issue.flaggedAt).toLocaleDateString('en-CA')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Client Requests */}
      {requests.length > 0 && (
        <section>
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Client Requests</h2>
          <div className="space-y-3">
            {requests.map((req) => {
              const ticket = tickets.find((t) => t.id === req.engineeringTicketId);
              return (
                <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="text-slate-500 text-xs font-mono">
                      {new Date(req.submittedAt).toLocaleDateString('en-CA')} · {req.id}
                    </span>
                    {ticket ? (
                      <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded border bg-blue-950 text-blue-400 border-blue-900">
                        Ticket: {ticket.id}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded border bg-slate-800 text-slate-500 border-slate-700">
                        No ticket
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{req.rawRequest}</p>
                  {ticket && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                      <span className="text-slate-400 font-medium">{ticket.title}</span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded border text-xs ${
                        ticket.priority === 'high' || ticket.priority === 'critical'
                          ? 'bg-amber-950 text-amber-400 border-amber-900'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {ticket.priority} · {ticket.status}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
