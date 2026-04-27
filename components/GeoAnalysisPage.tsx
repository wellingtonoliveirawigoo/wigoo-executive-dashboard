import React, { useState, useCallback } from 'react';
import { executeBigQueryGeoQuery, GeoAnalysisResult } from '../services/bigquery';

const BR_STATE_ABBR: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
  'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
  'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
  'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE',
  'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR',
  'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
};

const abbr = (name: string) => BR_STATE_ABBR[name] || name.slice(0, 2).toUpperCase();

const fmt = (v: number) =>
  v >= 1_000_000
    ? `R$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `R$${(v / 1_000).toFixed(1)}k`
    : `R$${v.toFixed(0)}`;

const fmtN = (v: number) =>
  v >= 1_000 ? `${(v / 1_000).toFixed(1)}k` : String(v);

interface Props {
  clientName: string;
  theme: 'light' | 'dark';
}

const GeoAnalysisPage: React.FC<Props> = ({ clientName, theme }) => {
  const today = new Date().toISOString().split('T')[0];
  const minus5 = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(minus5);
  const [endDate, setEndDate] = useState(today);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GeoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'estados' | 'campanhas'>('estados');

  const handleSync = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await executeBigQueryGeoQuery(startDate, endDate);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  const maxReceita = data?.states[0]?.receita || 1;
  const maxCampInv = data?.campaigns[0]?.inv || 1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-wigoo-dark theme-transition">
      <main className="flex-grow container mx-auto px-4 py-12 space-y-10 flex flex-col items-center">

        {/* Header */}
        <div className="w-full max-w-[1200px] bg-white dark:bg-wigoo-gray rounded-[3.5rem] p-12 shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-wigoo-gradient"></div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-black text-wigoo-accent uppercase tracking-[0.6em] mb-2">
                <i className="fa-solid fa-map-location-dot mr-2"></i>Análise Geográfica
              </p>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                {clientName} <span className="text-gray-300 dark:text-white/20 font-thin mx-2">·</span> Vendas por Estado
              </h1>
              <p className="text-[11px] text-gray-400 dark:text-white/30 font-bold uppercase tracking-widest mt-2">
                Desempenho regional · Campanhas Meta · Shopify Orders
              </p>
            </div>
            {data && (
              <div className="flex gap-8">
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Pedidos</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{fmtN(data.totalPedidos)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Receita Total</p>
                  <p className="text-2xl font-black text-wigoo-primary">{fmt(data.totalReceita)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ticket Médio</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{fmt(data.ticketMedio)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Picker + Sync */}
        <div className="w-full max-w-[1200px] bg-white/70 dark:bg-wigoo-gray/70 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest ml-1">Data Início</label>
                <input
                  type="date" value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-wigoo-dark border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-wigoo-primary/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest ml-1">Data Fim</label>
                <input
                  type="date" value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-wigoo-dark border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-wigoo-primary/50 transition-all"
                />
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={isLoading}
              className={`h-[52px] px-10 rounded-2xl bg-wigoo-primary text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl shadow-wigoo-primary/20 whitespace-nowrap ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
            >
              {isLoading ? (
                <><i className="fa-solid fa-circle-notch animate-spin"></i> Carregando...</>
              ) : (
                <><i className="fa-solid fa-bolt"></i> Carregar Dados</>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full max-w-[1200px] bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/30 rounded-3xl px-8 py-5 flex items-center gap-4">
            <i className="fa-solid fa-triangle-exclamation text-rose-500 text-lg"></i>
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!data && !isLoading && !error && (
          <div className="w-full max-w-[1200px] flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-wigoo-primary/10 flex items-center justify-center">
              <i className="fa-solid fa-map-location-dot text-4xl text-wigoo-primary/40"></i>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 dark:text-white">Selecione o período e carregue os dados</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mt-2">Vendas por estado · Campanhas Meta · Cruzamento dinâmico</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {data && (
          <div className="w-full max-w-[1200px] space-y-8 animate-in">

            {/* Tabs */}
            <div className="flex bg-white dark:bg-wigoo-gray/50 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-md w-fit">
              <button
                onClick={() => setActiveTab('estados')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'estados' ? 'bg-wigoo-primary text-white shadow-lg shadow-wigoo-primary/20' : 'text-gray-400 hover:text-wigoo-primary'}`}
              >
                <i className="fa-solid fa-map-location-dot mr-2"></i>Vendas por Estado
              </button>
              <button
                onClick={() => setActiveTab('campanhas')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'campanhas' ? 'bg-wigoo-primary text-white shadow-lg shadow-wigoo-primary/20' : 'text-gray-400 hover:text-wigoo-primary'}`}
              >
                <i className="fa-solid fa-bullhorn mr-2"></i>Campanhas Meta
              </button>
            </div>

            {/* Estados Tab */}
            {activeTab === 'estados' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Ranking de Estados */}
                <div className="lg:col-span-3 bg-white dark:bg-wigoo-gray rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white">Ranking por Receita</h2>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Pedidos pagos · Shopify</p>
                    </div>
                    <div className="text-[9px] font-black text-gray-300 dark:text-white/20 uppercase tracking-widest">
                      {data.periodStart} → {data.periodEnd}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.states.map((s, i) => {
                      const pct = (s.receita / maxReceita) * 100;
                      const isTop3 = i < 3;
                      return (
                        <div key={s.estado} className="flex items-center gap-4">
                          {/* Rank */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0 ${isTop3 ? 'bg-wigoo-primary text-white shadow-lg shadow-wigoo-primary/30' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                            {i + 1}
                          </div>

                          {/* Estado */}
                          <div className="w-10 text-[11px] font-black text-gray-500 dark:text-white/50 flex-shrink-0">
                            {abbr(s.estado)}
                          </div>

                          {/* Bar */}
                          <div className="flex-grow h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: isTop3
                                  ? 'linear-gradient(90deg, #00D4AA, #00A896)'
                                  : '#d1d5db'
                              }}
                            />
                          </div>

                          {/* Valores */}
                          <div className="text-right flex-shrink-0 min-w-[90px]">
                            <p className={`text-[13px] font-black ${isTop3 ? 'text-wigoo-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                              {fmt(s.receita)}
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold">{fmtN(s.pedidos)} pedidos</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cards laterais */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Top 3 destaque */}
                  {data.states.slice(0, 3).map((s, i) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const shareRevenue = ((s.receita / data.totalReceita) * 100).toFixed(1);
                    return (
                      <div key={s.estado} className="bg-white dark:bg-wigoo-gray rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-3xl opacity-20">{medals[i]}</div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{medals[i]} {i + 1}º lugar</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">{s.estado}</p>
                        <p className="text-2xl font-black text-wigoo-primary mt-2">{fmt(s.receita)}</p>
                        <div className="flex gap-4 mt-3">
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Pedidos</p>
                            <p className="text-[13px] font-black text-gray-700 dark:text-gray-300">{fmtN(s.pedidos)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Ticket Médio</p>
                            <p className="text-[13px] font-black text-gray-700 dark:text-gray-300">{fmt(s.ticketMedio)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Share</p>
                            <p className="text-[13px] font-black text-emerald-500">{shareRevenue}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Info sobre Meta Geo */}
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-3xl px-6 py-5">
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-circle-info text-amber-500 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Cruzamento Meta × Estado</p>
                        <p className="text-[10px] text-amber-600/80 dark:text-amber-500/60 font-bold mt-1 leading-relaxed">
                          Para cruzar campanhas Meta com estado de compra, adicione a tabela <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">facebook_campaign_insights_geo</code> ao BigQuery com o breakdown regional da API Meta.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campanhas Tab */}
            {activeTab === 'campanhas' && (
              <div className="bg-white dark:bg-wigoo-gray rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Campanhas Meta</h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Ordenadas por investimento · {data.periodStart} → {data.periodEnd}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-gray-300 dark:text-white/20 uppercase tracking-widest">
                    <i className="fa-brands fa-meta text-blue-500"></i> Meta Ads
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="col-span-5">Campanha</div>
                    <div className="col-span-2 text-right">Investimento</div>
                    <div className="col-span-1 text-right">Imp.</div>
                    <div className="col-span-1 text-right">Cliques</div>
                    <div className="col-span-2 text-right">Receita</div>
                    <div className="col-span-1 text-right">ROAS</div>
                  </div>

                  {data.campaigns.map((c, i) => {
                    const pct = (c.inv / maxCampInv) * 100;
                    const roas = c.roas > 0 ? c.roas : (c.inv > 0 && c.receita > 0 ? c.receita / c.inv : 0);
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-4 items-center bg-gray-50 dark:bg-white/[0.02] hover:bg-wigoo-primary/5 dark:hover:bg-white/5 rounded-2xl px-4 py-4 transition-colors"
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-1.5 h-8 rounded-full bg-wigoo-primary/20 overflow-hidden flex-shrink-0">
                            <div
                              className="w-full rounded-full bg-wigoo-primary transition-all"
                              style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                            />
                          </div>
                          <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-tight line-clamp-2">
                            {c.nome}
                          </p>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-[12px] font-black text-gray-900 dark:text-white">{fmt(c.inv)}</p>
                        </div>
                        <div className="col-span-1 text-right">
                          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{fmtN(c.imp)}</p>
                        </div>
                        <div className="col-span-1 text-right">
                          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{fmtN(c.clk)}</p>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                            {c.receita > 0 ? fmt(c.receita) : '—'}
                          </p>
                        </div>
                        <div className="col-span-1 text-right">
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${roas >= 3 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : roas >= 1 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                            {roas > 0 ? `${roas.toFixed(1)}x` : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Série Temporal */}
            {data.dailySeries.length > 1 && (
              <div className="bg-white dark:bg-wigoo-gray rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 shadow-2xl">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Evolução Diária de Pedidos</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-8">Shopify · Pedidos pagos por dia</p>
                <div className="flex items-end gap-1 h-24">
                  {(() => {
                    const maxPed = Math.max(...data.dailySeries.map(d => d.pedidos), 1);
                    return data.dailySeries.map((d, i) => {
                      const h = Math.max((d.pedidos / maxPed) * 100, 4);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10">
                            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black px-2 py-1 rounded-lg whitespace-nowrap">
                              {d.pedidos} pedidos<br />{fmt(d.receita)}
                            </div>
                          </div>
                          <div
                            className="w-full rounded-t-sm bg-wigoo-primary/60 hover:bg-wigoo-primary transition-colors cursor-default"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-bold">
                  <span>{data.dailySeries[0]?.dia}</span>
                  <span>{data.dailySeries[data.dailySeries.length - 1]?.dia}</span>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default GeoAnalysisPage;
