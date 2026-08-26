import Link from 'next/link';
import { getClients, getVoicebots } from '@/lib/data';
import { getAllPriorities, type ClientPriority, type ClientStatus } from '@/lib/priorities';
import { SparkLine } from '@/components/ui/SparkLine';
import type { Client } from '@/lib/data';

function fmt(n: number) { return n.toLocaleString('en-US'); }
function pct(n: number) { return n.toFixed(1) + '%'; }

function StatusBadge({ status }: { status: ClientStatus }) {
  const cfg = {
    critical: {
      dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-950', border: 'border-red-900', label: 'Critical',
    },
    needs_attention: {
      dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-950', border: 'border-amber-900', label: 'Attention',
    },
    healthy: {
      dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-900/50', label: 'Healthy',
    },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function answerColor(r: number) { return r < 40 ? 'text-red-400' : r < 58 ? 'text-amber-400' : 'text-slate-200'; }
function convColor(r: number)   { return r < 22 ? 'text-red-400' : r < 30 ? 'text-amber-400' : 'text-slate-200'; }
function qaColor(n: number)     { return n > 50 ? 'text-red-400' : n > 15 ? 'text-amber-400' : 'text-slate-400'; }

function currConv(c: Client)  { return c.stats.weekly.at(-1)?.paymentConversion ?? c.stats.paymentConversion; }
function deltaPP(c: Client)   { return currConv(c) - (c.stats.weekly.at(0)?.paymentConversion ?? currConv(c)); }
function trendData(c: Client) { return c.stats.weekly.map((w) => w.paymentConversion); }

const STATUS_ORDER: Record<ClientStatus, number> = { critical: 0, needs_attention: 1, healthy: 2 };

export default function DashboardPage() {
  const clients    = getClients();
  const voicebots  = getVoicebots();
  const priorities = getAllPriorities();
  const priMap     = Object.fromEntries(priorities.map((p) => [p.clientId, p]));

  // Portfolio aggregates — computed from seed data, not hard-coded
  const totalCalls    = clients.reduce((s, c) => s + c.stats.totalCalls,    0);
  const totalAnswered = clients.reduce((s, c) => s + c.stats.answeredCalls, 0);
  const totalPayments = clients.reduce((s, c) => s + c.stats.payments,      0);
  const totalQA       = clients.reduce((s, c) => s + c.stats.qaIssues,      0);
  const portAnswerPct = totalAnswered / totalCalls * 100;
  const portConvPct   = totalPayments / totalAnswered * 100;
  const critCount     = priorities.filter((p) => p.status === 'critical').length;
  const warnCount     = priorities.filter((p) => p.status === 'needs_attention').length;
  const flaggedCount  = critCount + warnCount;

  const vbNames = (clientId: string) =>
    voicebots.filter((v) => v.clientId === clientId).map((v) => v.name).join(', ');

  const sortedClients = [...clients].sort((a, b) =>
    STATUS_ORDER[priMap[a.id]?.status ?? 'healthy'] - STATUS_ORDER[priMap[b.id]?.status ?? 'healthy']
  );

  const actionItems = priorities
    .filter((p) => p.status !== 'healthy')
    .flatMap((p) =>
      p.issues.map((iss) => ({ clientId: p.clientId, clientName: p.clientName, status: p.status, ...iss })),
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

      {/* Page heading */}
      <div>
        <h1 className="text-slate-100 text-xl font-semibold">Portfolio Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {clients.length} active clients · 8-week performance summary
        </p>
      </div>

      {/* Priority Actions */}
      {actionItems.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
            <span className="text-amber-400 text-base leading-none">⚡</span>
            <h2 className="text-slate-200 text-sm font-semibold">Priority Actions</h2>
            <div className="ml-auto flex items-center gap-3 text-xs">
              {critCount > 0 && <span className="text-red-400   font-medium">{critCount} critical</span>}
              {warnCount > 0 && <span className="text-amber-400 font-medium">{warnCount} need attention</span>}
            </div>
          </div>
          <ul className="divide-y divide-slate-800/50">
            {actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0 text-sm">
                  <Link href={`/clients/${item.clientId}`} className="font-medium text-slate-200 hover:text-white">
                    {item.clientName}
                  </Link>
                  <span className="text-slate-600 mx-1.5">—</span>
                  <span className="text-slate-400">{item.description}</span>
                </div>
                <span className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${
                  item.severity === 'critical' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'
                }`}>
                  {item.severity === 'critical' ? 'Critical' : 'Warning'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Calls',         value: fmt(totalCalls),      sub: '8-week period',              alert: false              },
          { label: 'Answer Rate',         value: pct(portAnswerPct),   sub: 'portfolio average',          alert: portAnswerPct < 50 },
          { label: 'Payments',            value: fmt(totalPayments),   sub: '8-week period',              alert: false              },
          { label: 'Payment Conversion',  value: pct(portConvPct),     sub: 'of answered calls',          alert: portConvPct < 35   },
          { label: 'QA Issues',           value: fmt(totalQA),         sub: 'flagged this period',        alert: totalQA > 50       },
          { label: 'Requiring Attention', value: String(flaggedCount), sub: `of ${clients.length} clients`, alert: flaggedCount > 0 },
        ].map(({ label, value, sub, alert }) => (
          <div
            key={label}
            className={`bg-slate-900 rounded-lg px-4 py-4 border ${alert ? 'border-red-900/70' : 'border-slate-800'}`}
          >
            <div className={`text-2xl font-semibold font-mono tracking-tight ${alert ? 'text-red-400' : 'text-slate-100'}`}>
              {value}
            </div>
            <div className="text-slate-400 text-xs font-medium mt-1">{label}</div>
            <div className="text-slate-600 text-xs mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Client Portfolio Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Client Portfolio</h2>
          <span className="text-slate-700 text-xs">sorted by priority · conv. rate = current week</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/60 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="text-left   px-4 py-3 font-medium">Client</th>
                <th className="text-left   px-4 py-3 font-medium">Voicebot</th>
                <th className="text-right  px-4 py-3 font-medium">Calls</th>
                <th className="text-right  px-4 py-3 font-medium">Answer Rate</th>
                <th className="text-right  px-4 py-3 font-medium">Payments</th>
                <th className="text-right  px-4 py-3 font-medium">Conv. Rate</th>
                <th className="text-right  px-4 py-3 font-medium">QA Issues</th>
                <th className="text-center px-4 py-3 font-medium">8W Trend</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {sortedClients.map((client) => {
                const pri    = priMap[client.id];
                const cv     = currConv(client);
                const dp     = deltaPP(client);
                const isCrit = pri?.status === 'critical';
                const isWarn = pri?.status === 'needs_attention';

                return (
                  <tr
                    key={client.id}
                    className={`hover:bg-slate-800/20 transition-colors ${isCrit ? 'bg-red-950/5' : isWarn ? 'bg-amber-950/5' : ''}`}
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-slate-200 hover:text-white hover:underline underline-offset-2"
                      >
                        {client.name}
                      </Link>
                      <div className="text-slate-600 text-xs mt-0.5">{client.industry}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-xs">{vbNames(client.id)}</td>

                    <td className="px-4 py-3.5 text-right font-mono text-slate-300 tabular-nums">
                      {fmt(client.stats.totalCalls)}
                    </td>

                    <td className={`px-4 py-3.5 text-right font-mono font-semibold tabular-nums ${answerColor(client.stats.answerRate)}`}>
                      {pct(client.stats.answerRate)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-slate-300 tabular-nums">
                      {fmt(client.stats.payments)}
                    </td>

                    <td className={`px-4 py-3.5 text-right font-mono font-semibold tabular-nums ${convColor(cv)}`}>
                      {pct(cv)}
                    </td>

                    <td className={`px-4 py-3.5 text-right font-mono font-semibold tabular-nums ${qaColor(client.stats.qaIssues)}`}>
                      {client.stats.qaIssues}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-center gap-0.5">
                        <SparkLine data={trendData(client)} />
                        <span className={`text-xs font-mono tabular-nums ${dp < -1 ? 'text-red-400' : dp > 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                          {dp >= 0 ? `+${dp.toFixed(0)}` : dp.toFixed(0)}pp
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={pri?.status ?? 'healthy'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
