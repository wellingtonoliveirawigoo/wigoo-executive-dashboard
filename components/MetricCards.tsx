
import React from 'react';
import { DashboardData, MetricYoY } from '../types';
import { formatCurrency, formatNumber, getDynamicFontSize } from '../utils/parser';

const VariationBadge: React.FC<{ metric: MetricYoY; inverse?: boolean; isCurrency?: boolean }> = ({ metric, inverse = false, isCurrency = false }) => {
  // Só mostra comparativo se houver dados do período anterior (M-1)
  const hasRealComparison = metric.previous > 0;
  const hasVariation = metric.variation && metric.variation !== '' && hasRealComparison;
  
  if (!hasVariation && !hasRealComparison) return null;
  
  const displayValue = metric.variation || '';
  if (!displayValue) return null;
  
  const isPositive = displayValue.includes('+') || (!displayValue.includes('-') && displayValue !== '0' && displayValue !== '0,00' && displayValue !== '0.00');
  
  const isGood = isPositive ? !inverse : inverse;
  const colorClass = isGood 
    ? 'text-emerald-600 dark:text-wigoo-success bg-emerald-50 dark:bg-wigoo-success/10' 
    : 'text-rose-600 dark:text-wigoo-danger bg-rose-50 dark:bg-wigoo-danger/10';
  const iconClass = isPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';

  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black ${colorClass}`}>
      <i className={`fa-solid ${iconClass}`}></i>
      {displayValue} YoY
    </div>
  );
};

const MetricCards: React.FC<{ data: DashboardData }> = ({ data }) => {
  const metrics = [
    { label: 'Investimento Total', metric: data.investment, icon: 'fa-money-bill-trend-up', color: 'text-wigoo-primary', isCurrency: true, inverse: true },
    { label: 'Impressões', metric: data.impressions, icon: 'fa-eye', color: 'text-blue-500', isCurrency: false },
    { label: 'Cliques', metric: data.cliques, icon: 'fa-mouse-pointer', color: 'text-indigo-500', isCurrency: false },
    { label: 'Conversões', metric: data.conversions, icon: 'fa-cart-shopping', color: 'text-emerald-500', isCurrency: false },
    { label: 'Receita (Consolidada)', metric: data.receita, icon: 'fa-hand-holding-dollar', color: 'text-amber-500', isCurrency: true },
    { label: 'ROAS Geral', metric: data.roas, icon: 'fa-chart-line', color: 'text-rose-500', isCurrency: false, isRaw: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 print:grid-cols-2 gap-4 w-full metric-grid">
      {metrics.map((m, idx) => {
        const valText = m.isCurrency ? formatCurrency(m.metric.current) : (m.isRaw ? m.metric.current.toFixed(2) : formatNumber(m.metric.current));
        const fontSize = getDynamicFontSize(valText, 'text-xl');
        
        return (
          <div key={idx} className="bg-white dark:bg-wigoo-gray border border-gray-200 dark:border-wigoo-gray-light rounded-2xl p-5 shadow-sm dark:shadow-lg card metric-card flex flex-col justify-between group hover:border-wigoo-primary/30 transition-all theme-transition">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest leading-tight">{m.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center ${m.color}`}>
                <i className={`fa-solid ${m.icon} text-sm`}></i>
              </div>
            </div>
            
            <div className="space-y-1 mt-2">
              <div className={`${fontSize} font-black text-gray-900 dark:text-white tracking-tight leading-none`}>
                {valText}
              </div>
              
              <div className="flex items-center justify-between gap-1 mt-1">
                <VariationBadge metric={m.metric} inverse={m.inverse} isCurrency={m.isCurrency} />
                {m.metric.previous > 0 && (
                  <div className="text-[9px] text-gray-400 dark:text-wigoo-light/20 font-bold whitespace-nowrap">
                    LY: <span className="text-gray-600 dark:text-wigoo-light/40">{m.isCurrency ? formatCurrency(m.metric.previous) : (m.isRaw ? m.metric.previous.toFixed(2) : formatNumber(m.metric.previous))}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
