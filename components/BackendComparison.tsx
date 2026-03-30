
import React from 'react';
import { DashboardData, MetricYoY } from '../types';
import { formatCurrency, formatNumber, getDynamicFontSize } from '../utils/parser';

const ComparisonItem: React.FC<{ label: string; metric: MetricYoY; isCurrency?: boolean; isPercentage?: boolean; precision?: number }> = ({ label, metric, isCurrency, isPercentage, precision = 0 }) => {
  const hasRealComparison = metric.previous > 0;
  const hasVar = metric.variation && metric.variation !== '' && hasRealComparison;
  const displayVal = isCurrency ? formatCurrency(metric.current) : (isPercentage ? `${metric.current.toFixed(2)}%` : formatNumber(metric.current));
  
  const varText = hasVar ? metric.variation! : '';
  const isPositive = varText.includes('+') || (!varText.includes('-') && varText !== '0' && varText !== '0,00' && varText !== '');

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={`${getDynamicFontSize(displayVal, 'text-xl')} font-black text-gray-900 dark:text-white leading-none`}>{displayVal}</p>
        {hasVar && varText && (
          <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '↑' : '↓'} {varText} YoY
          </span>
        )}
      </div>
      {hasRealComparison && (
        <p className="text-[9px] text-gray-400 dark:text-wigoo-light/20 font-bold">Anterior: {isCurrency ? formatCurrency(metric.previous) : (isPercentage ? `${metric.previous.toFixed(2)}%` : formatNumber(metric.previous))}</p>
      )}
    </div>
  );
};

const BackendComparison: React.FC<{ data: DashboardData }> = ({ data }) => {
  const hasGA4 = data.ga4 && (data.ga4.revenue.current > 0 || data.ga4.sessions.current > 0);
  const hasVTEX = data.vtex && (data.vtex.revenue.current > 0 || data.vtex.orders.current > 0);

  if (!hasGA4 && !hasVTEX) return null;

  return (
    <div className={`grid grid-cols-1 ${hasGA4 && hasVTEX ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8 w-full max-w-[1200px] mx-auto`}>
      {hasGA4 && (
        <div className="bg-white dark:bg-wigoo-gray border border-gray-200 dark:border-wigoo-gray-light rounded-3xl p-8 shadow-lg dark:shadow-2xl card relative overflow-hidden group theme-transition">
          <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 dark:opacity-5">
             <i className="fa-solid fa-chart-column text-8xl text-orange-500"></i>
          </div>
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20 shadow-inner">
              <img src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg" className="w-8 h-8" alt="GA4" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">Google Analytics 4</h3>
              <p className="text-[9px] text-gray-400 dark:text-wigoo-light/30 uppercase tracking-widest mt-1">Métricas de Navegação</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-10 gap-x-8 relative z-10">
            <ComparisonItem label="Sessões" metric={data.ga4!.sessions} />
            <ComparisonItem label="Transações" metric={data.ga4!.transactions} />
            <ComparisonItem label="Receita GA4" metric={data.ga4!.revenue} isCurrency />
            <ComparisonItem label="Tx. Conversão" metric={data.ga4!.conversionRate} isPercentage />
          </div>
        </div>
      )}

      {hasVTEX && (
        <div className="bg-white dark:bg-wigoo-gray border border-gray-200 dark:border-wigoo-gray-light rounded-3xl p-8 shadow-lg dark:shadow-2xl card relative overflow-hidden group theme-transition">
          <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 dark:opacity-5">
             <i className="fa-solid fa-bag-shopping text-8xl text-pink-500"></i>
          </div>
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-500/10 rounded-2xl border border-pink-100 dark:border-pink-500/20 flex items-center justify-center shadow-inner">
              <i className="fa-solid fa-cart-shopping text-pink-500 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">E-commerce</h3>
              <p className="text-[9px] text-gray-400 dark:text-wigoo-light/30 uppercase tracking-widest mt-1">Dados de Faturamento Real</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-10 gap-x-8 relative z-10">
            <ComparisonItem label="Pedidos Totais" metric={data.vtex!.orders} />
            <ComparisonItem label="Ticket Médio" metric={data.vtex!.avgTicket} isCurrency />
            <div className="col-span-2 mt-2 pt-8 border-t border-gray-100 dark:border-white/5">
               <ComparisonItem label="Faturamento Bruto" metric={data.vtex!.revenue} isCurrency />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendComparison;
