
import React from 'react';
import { DashboardData } from '../types';
import { formatCurrency, getDynamicFontSize } from '../utils/parser';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data: DashboardData;
  theme?: 'light' | 'dark';
}

const PlatformPerformance: React.FC<Props> = ({ data, theme = 'light' }) => {
  const isDark = theme === 'dark';

  const getPlatformIcon = (name: string) => {
    const n = name.toLowerCase();
    
    // Logos Oficiais via Imagem
    if (n.includes('awin')) return 'https://upload.wikimedia.org/wikipedia/commons/e/e6/AWIN_AG_logo.png';
    if (n.includes('criteo')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Criteo_logo21.svg/3840px-Criteo_logo21.svg.png';
    if (n.includes('rtb')) return 'https://upload.wikimedia.org/wikipedia/commons/9/90/Rtb-house-logo-vector.svg';
    if (n.includes('meliuz')) return 'https://static.meliuz.com.br/img/logo/meliuz-logo-96.png';
    
    // Ícones FontAwesome para os demais
    if (n.includes('meta') || n.includes('facebook') || n.includes('instagram')) return 'fa-facebook';
    if (n.includes('google')) return 'fa-google';
    if (n.includes('pinterest')) return 'fa-pinterest';
    if (n.includes('tiktok')) return 'fa-tiktok';
    if (n.includes('direct')) return 'fa-compass'; 
    if (n.includes('organic')) return 'fa-seedling'; 
    if (n.includes('referral') || n.includes('referencia')) return 'fa-link';
    return 'fa-share-nodes';
  };

  const getPlatformColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('meta')) return '#1877F2';
    if (n.includes('google')) return '#4285F4';
    if (n.includes('pinterest')) return '#E60023';
    if (n.includes('tiktok')) return isDark ? '#FFFFFF' : '#000000';
    if (n.includes('criteo')) return '#FF6B00';
    if (n.includes('awin')) return '#E01A4F';
    if (n.includes('rtb')) return '#1E1E1E';
    if (n.includes('meliuz')) return '#FF1E56';
    if (n.includes('direct')) return '#2E7D32';
    if (n.includes('organic')) return '#388E3C';
    
    const colors = ['#FF6B35', '#9B51E0', '#2196F3', '#00C49F', '#FF8C5A'];
    const charCodeSum = n.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const chartData = data.platforms.map(p => ({
    name: p.name,
    value: p.investment.current,
    color: getPlatformColor(p.name)
  })).filter(d => d.value > 0);

  const listPlatforms = data.platforms.filter(p => p.investment.current > 0 || p.revenue.current > 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = outerRadius + 35;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <g>
        <text 
          x={x} 
          y={y} 
          fill={isDark ? "white" : "#111827"} 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          className="text-[10px] font-black"
        >
          {`${name}: ${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-1 gap-8 items-stretch w-full max-w-[1200px] mx-auto">
      <div className="lg:col-span-5 bg-white dark:bg-wigoo-gray border border-gray-200 dark:border-wigoo-gray-light/30 rounded-3xl p-8 shadow-lg dark:shadow-2xl card flex flex-col items-center theme-transition">
        <div className="w-full text-left">
          <h3 className="text-lg font-black mb-2 flex items-center gap-3 text-gray-900 dark:text-white">
            <i className="fa-solid fa-chart-pie text-wigoo-primary"></i>
            Mix de Investimento Atual
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-wigoo-light/30 uppercase tracking-widest mb-6">Distribuição de Budget por Canal</p>
        </div>
        
        <div className="w-full h-[350px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderCustomizedLabel}
                  labelLine={{ stroke: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', 
                    border: 'none',
                    borderRadius: '16px', 
                    fontSize: '10px',
                    fontWeight: '800'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Investimento']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 italic text-xs">
              Sem dados de investimento para exibir.
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col justify-start gap-4 overflow-y-auto max-h-[550px] print:max-h-none pr-2 scrollbar-thin">
        {listPlatforms.map((p, idx) => {
          const iconSource = getPlatformIcon(p.name);
          const isUrl = iconSource.startsWith('http');
          
          return (
            <div key={idx} className="bg-white dark:bg-wigoo-gray border border-gray-200 dark:border-wigoo-gray-light/30 rounded-3xl p-4 shadow-sm dark:shadow-lg flex items-center gap-5 card group hover:border-wigoo-primary/40 transition-all theme-transition">
              <div className="relative flex-shrink-0">
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-wigoo-dark border border-gray-100 dark:border-white/5 shadow-inner p-2.5">
                  {isUrl ? (
                    <img src={iconSource} alt={p.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <i className={`fa-brands ${iconSource} text-xl`} style={{ color: getPlatformColor(p.name) }}></i>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 flex-grow min-w-0">
                <div className="min-w-0">
                  <p className="text-[7px] font-black text-gray-400 dark:text-wigoo-light/20 uppercase tracking-[0.2em] mb-0.5 truncate">{p.name}</p>
                  <div className="flex flex-col">
                    <span className={`font-black text-gray-900 dark:text-white ${getDynamicFontSize(formatCurrency(p.investment.current), 'text-[13px]')} truncate`}>{formatCurrency(p.investment.current)}</span>
                    {p.investment.variation && p.investment.previous > 0 && (
                      <span className={`text-[8px] font-bold ${p.investment.variation.includes('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {p.investment.variation} YoY
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="min-w-0">
                  <p className="text-[7px] font-black text-gray-400 dark:text-wigoo-light/20 uppercase tracking-[0.2em] mb-0.5 truncate">Receita</p>
                  <div className="flex flex-col">
                    <span className={`font-black text-gray-900 dark:text-white ${getDynamicFontSize(formatCurrency(p.revenue.current), 'text-[13px]')} truncate`}>{formatCurrency(p.revenue.current)}</span>
                    {p.revenue.variation && p.revenue.previous > 0 && (
                      <span className={`text-[8px] font-bold ${p.revenue.variation.includes('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {p.revenue.variation} YoY
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[7px] font-black text-gray-400 dark:text-wigoo-light/20 uppercase tracking-[0.2em] mb-0.5 truncate">CPA</p>
                  <div className="flex flex-col">
                     <span className={`font-bold text-gray-900 dark:text-white ${getDynamicFontSize(formatCurrency(p.cpa.current), 'text-[13px]')} truncate`}>{formatCurrency(p.cpa.current)}</span>
                     {p.cpa.diff !== undefined && p.cpa.diff !== 0 && p.cpa.previous > 0 && (
                       <span className={`text-[8px] font-bold ${p.cpa.diff > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                         {p.cpa.diff > 0 ? '+' : ''}{p.cpa.diff.toFixed(2)} YoY
                       </span>
                     )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[7px] font-black text-gray-400 dark:text-wigoo-light/20 uppercase tracking-[0.2em] mb-0.5 truncate">ROAS</p>
                  <div className="flex flex-col">
                    <span className={`font-black text-[14px] ${p.roas.current > 8 ? 'text-emerald-500' : 'text-wigoo-primary'}`}>
                      {p.roas.current.toFixed(2)}x
                    </span>
                    {p.roas.diff !== undefined && p.roas.diff !== 0 && p.roas.previous > 0 && (
                      <span className={`text-[8px] font-bold ${p.roas.diff < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {p.roas.diff > 0 ? '+' : ''}{p.roas.diff.toFixed(2)} YoY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformPerformance;
