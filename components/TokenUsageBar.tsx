
import React, { useState, useEffect } from 'react';
import { getMonthlyTokens, MONTHLY_TOKEN_LIMIT, formatTokenCount } from '../utils/tokenStorage';

interface Props {
  clientId: string;
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const TokenUsageBar: React.FC<Props> = ({ clientId }) => {
  const [used, setUsed] = useState(0);

  const refresh = () => setUsed(getMonthlyTokens(clientId));

  useEffect(() => {
    refresh();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.clientId || detail.clientId === clientId) refresh();
    };
    window.addEventListener('wigoo-tokens-updated', handler);
    return () => window.removeEventListener('wigoo-tokens-updated', handler);
  }, [clientId]);

  // Re-sync when clientId changes
  useEffect(() => { refresh(); }, [clientId]);

  if (used === 0) return null;

  const pct = Math.min((used / MONTHLY_TOKEN_LIMIT) * 100, 100);
  const now = new Date();
  const monthLabel = `${MONTH_LABELS[now.getMonth()]}/${String(now.getFullYear()).slice(2)}`;

  const barColor =
    pct >= 90 ? '#ef4444'   // red-500
    : pct >= 70 ? '#f59e0b' // amber-500
    : '#10b981';             // emerald-500

  const textColor =
    pct >= 90 ? 'text-red-500'
    : pct >= 70 ? 'text-amber-500'
    : 'text-emerald-500';

  const statusLabel =
    pct >= 90 ? 'Limite próximo'
    : pct >= 70 ? 'Uso elevado'
    : 'Uso normal';

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[220px] bg-white/90 dark:bg-wigoo-gray/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl px-4 py-3 space-y-2 theme-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className={`fa-solid fa-microchip text-[11px] ${textColor}`}></i>
          <span className="text-[10px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest">Tokens</span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${textColor}`}>{statusLabel}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Usage numbers */}
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-black ${textColor}`}>{formatTokenCount(used)}</span>
        <span className="text-[10px] text-gray-400 dark:text-white/30 font-bold">
          / {formatTokenCount(MONTHLY_TOKEN_LIMIT)} · {monthLabel}
        </span>
      </div>
    </div>
  );
};

export default TokenUsageBar;
