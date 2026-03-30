
import React, { useState } from 'react';
import { Campaign } from '../types';
import { formatCurrency } from '../utils/parser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const CampaignTable: React.FC<{ campaigns: Campaign[] }> = ({ campaigns }) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [sortKey, setSortKey] = useState<keyof Campaign>('roas');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  // Filtramos apenas campanhas com ROAS > 0 para o gráfico não ficar vazio
  const filteredCampaigns = campaigns.filter(c => c.roas > 0 || c.investment > 0);

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return direction === 'desc' ? valB - valA : valA - valB;
    }
    return 0;
  }).slice(0, 10);

  const handleSort = (key: keyof Campaign) => {
    if (key === sortKey) {
      setDirection(direction === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setDirection('desc');
    }
  };

  const getSourceHex = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('meta')) return '#1877F2';
    if (s.includes('google')) return '#4CAF50';
    if (s.includes('pinterest')) return '#E60023';
    if (s.includes('tiktok')) return '#EE1D52';
    return '#FF6B35';
  };

  return (
    <div className="bg-white dark:bg-wigoo-gray border border-gray-200 dark:border-wigoo-gray-light/30 rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl card campaign-table flex flex-col w-full max-w-[1200px] mx-auto theme-transition print:border print:shadow-none">
      <div className="p-8 border-b border-gray-100 dark:border-wigoo-gray-light/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-wigoo-dark/20 theme-transition no-print-section">
        <div>
          <h3 className="text-xl font-black flex items-center gap-4 text-gray-900 dark:text-white">
            <div className="w-12 h-12 rounded-xl bg-wigoo-primary/10 flex items-center justify-center border border-wigoo-primary/20">
              <i className="fa-solid fa-trophy text-wigoo-primary"></i>
            </div>
            Top 10 Campanhas
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-wigoo-light/30 uppercase tracking-widest mt-2 ml-16">Ranking de Eficiência Estratégica</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-wigoo-dark/50 p-1 rounded-2xl border border-gray-200 dark:border-white/5 no-print theme-transition">
          <button 
            onClick={() => setViewMode('table')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-wigoo-primary text-white shadow-lg' : 'text-gray-500 dark:text-wigoo-light/40 hover:text-wigoo-primary'}`}
          >
            <i className="fa-solid fa-list-ul mr-2"></i> Tabela
          </button>
          <button 
            onClick={() => setViewMode('chart')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-wigoo-primary text-white shadow-lg' : 'text-gray-500 dark:text-wigoo-light/40 hover:text-wigoo-primary'}`}
          >
            <i className="fa-solid fa-chart-simple mr-2"></i> Gráfico
          </button>
        </div>
      </div>

      <div className="flex-grow w-full relative">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto print:overflow-visible w-full">
            <table className="w-full text-left text-sm border-collapse print:table-fixed">
              <thead className="text-gray-400 dark:text-wigoo-light/30 uppercase text-[10px] font-black tracking-[0.2em] bg-gray-50/30 dark:bg-white/[0.01]">
                <tr>
                  <th className="px-6 md:px-10 py-6">Campanha</th>
                  <th className="px-6 md:px-10 py-6">Fonte</th>
                  <th className="px-6 md:px-10 py-6 text-right cursor-pointer hover:text-wigoo-primary" onClick={() => handleSort('investment')}>Invest.</th>
                  <th className="px-6 md:px-10 py-6 text-right cursor-pointer hover:text-wigoo-primary" onClick={() => handleSort('revenue')}>Receita</th>
                  <th className="px-6 md:px-10 py-6 text-right cursor-pointer hover:text-wigoo-primary" onClick={() => handleSort('roas')}>ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                {sortedCampaigns.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 md:px-10 py-6 font-bold text-gray-900 dark:text-white" title={c.name}>{c.name}</td>
                    <td className="px-6 md:px-10 py-6">
                      <span className="px-4 py-1 rounded-full text-[9px] font-black uppercase bg-gray-100 dark:bg-wigoo-dark border border-gray-200 dark:border-white/5" style={{ color: getSourceHex(c.source) }}>
                        {c.source}
                      </span>
                    </td>
                    <td className="px-6 md:px-10 py-6 text-right font-mono text-xs text-gray-500 dark:text-wigoo-light/60">{formatCurrency(c.investment)}</td>
                    <td className="px-6 md:px-10 py-6 text-right font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(c.revenue)}</td>
                    <td className={`px-6 md:px-10 py-6 text-right font-black text-lg ${c.roas > 8 ? 'text-emerald-600' : 'text-wigoo-primary'}`}>
                      {c.roas.toFixed(2)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 w-full h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={sortedCampaigns} margin={{ top: 20, right: 80, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="currentColor" 
                  fontSize={10} 
                  width={180}
                  axisLine={false} 
                  tickLine={false}
                  className="text-gray-500 dark:text-white/70 font-bold"
                  tickFormatter={(val) => val.length > 25 ? val.substring(0, 22) + '...' : val}
                />
                <ReTooltip 
                   cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="roas" 
                  name="ROAS" 
                  radius={[0, 4, 4, 0]} 
                  barSize={24}
                  isAnimationActive={true}
                >
                  <LabelList 
                    dataKey="revenue" 
                    position="right" 
                    formatter={(val: number) => formatCurrency(val)}
                    style={{ fontSize: '10px', fontWeight: 'bold', fill: 'currentColor', opacity: 0.8 }}
                    offset={10}
                  />
                  {sortedCampaigns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSourceHex(entry.source)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignTable;
