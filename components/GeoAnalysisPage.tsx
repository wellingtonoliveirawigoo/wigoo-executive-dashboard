import React, { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MonthEntry { rev: number; orders: number; sessions: number; }
interface CampaignRow {
  id: string;
  name: string;
  src: string;
  total: MonthEntry;
  months: Record<string, MonthEntry>;
}
interface StateRow {
  name: string;
  abbr: string;
  rev: number;
  orders: number;
  ticket: number;
}

// ─── Dados estáticos (GA4 · Meta Ads · Jan–Abr 2026) ─────────────────────────

const MONTH_TOTALS: Record<string, MonthEntry & { label: string }> = {
  '202601': { label: 'Janeiro',   rev: 236265, orders: 666,  sessions: 73607  },
  '202602': { label: 'Fevereiro', rev: 225092, orders: 693,  sessions: 71129  },
  '202603': { label: 'Março',     rev: 345774, orders: 1106, sessions: 106829 },
  '202604': { label: 'Abril',     rev: 236841, orders: 717,  sessions: 76478  },
};

const CAMPAIGNS: CampaignRow[] = [
  {
    id: '120216037685880533', name: 'Essence VD · Você Está Sendo Enganado',
    src: 'meta_est_conv_adv_essence_vd',
    total: { rev: 209135, orders: 626, sessions: 59917 },
    months: {
      '202601': { rev: 50591,  orders: 141, sessions: 14500 },
      '202602': { rev: 50961,  orders: 167, sessions: 15200 },
      '202603': { rev: 65899,  orders: 205, sessions: 18700 },
      '202604': { rev: 41684,  orders: 113, sessions: 11517 },
    },
  },
  {
    id: '120233362899670533', name: 'Catálogo DPA 01 · Remarketing',
    src: 'meta_est_conv_catalogo_dpa_01',
    total: { rev: 104816, orders: 358, sessions: 28189 },
    months: {
      '202601': { rev: 20303,  orders: 63,  sessions: 5800  },
      '202602': { rev: 21864,  orders: 72,  sessions: 6500  },
      '202603': { rev: 30657,  orders: 116, sessions: 9000  },
      '202604': { rev: 31993,  orders: 107, sessions: 6889  },
    },
  },
  {
    id: '120209904601020533', name: 'Wave VD · 63 Centavos',
    src: 'meta_est_conv_wave_vd_unico_63_centavos',
    total: { rev: 85101, orders: 255, sessions: 25473 },
    months: {
      '202601': { rev: 24798,  orders: 71,  sessions: 7000  },
      '202602': { rev: 26752,  orders: 84,  sessions: 7700  },
      '202603': { rev: 22587,  orders: 71,  sessions: 7100  },
      '202604': { rev: 10964,  orders: 29,  sessions: 3673  },
    },
  },
  {
    id: '120237824657680533', name: 'LAL Jogo Wave · Est. Branca',
    src: 'meta_est_conv_lal_jogo_wave_est_branca',
    total: { rev: 82551, orders: 253, sessions: 13993 },
    months: {
      '202601': { rev: 22047,  orders: 68,  sessions: 3600  },
      '202602': { rev: 24033,  orders: 73,  sessions: 3800  },
      '202603': { rev: 23590,  orders: 71,  sessions: 3700  },
      '202604': { rev: 12881,  orders: 41,  sessions: 2893  },
    },
  },
  {
    id: 'WG_CONVERSÃO_KIT_WAVE', name: 'WG Conversão · Kit Wave',
    src: 'meta / paid_social',
    total: { rev: 60514, orders: 183, sessions: 9292 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0    },
      '202602': { rev: 0,      orders: 0,   sessions: 0    },
      '202603': { rev: 40721,  orders: 125, sessions: 5900 },
      '202604': { rev: 19793,  orders: 58,  sessions: 3392 },
    },
  },
  {
    id: '120240276217390533', name: 'Essence VD · Enganado (Variante B)',
    src: 'meta_est_conv_adv_essence_vd',
    total: { rev: 54602, orders: 184, sessions: 17166 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0    },
      '202602': { rev: 0,      orders: 0,   sessions: 0    },
      '202603': { rev: 32686,  orders: 110, sessions: 10500 },
      '202604': { rev: 21916,  orders: 74,  sessions: 6666 },
    },
  },
  {
    id: 'WG_CONVERSÃO_ANO_NOVO', name: 'WG Conversão · Ano Novo',
    src: 'meta / paid_social',
    total: { rev: 53690, orders: 175, sessions: 11009 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0    },
      '202602': { rev: 0,      orders: 0,   sessions: 0    },
      '202603': { rev: 29407,  orders: 103, sessions: 6800 },
      '202604': { rev: 24282,  orders: 72,  sessions: 4209 },
    },
  },
  {
    id: '120240276183270533', name: 'Essence VD · Enganado (Variante C)',
    src: 'meta_est_conv_adv_essence_vd',
    total: { rev: 50101, orders: 147, sessions: 14430 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0    },
      '202602': { rev: 0,      orders: 0,   sessions: 0    },
      '202603': { rev: 36630,  orders: 107, sessions: 9800 },
      '202604': { rev: 13471,  orders: 40,  sessions: 4630 },
    },
  },
  {
    id: '120237822074150533', name: 'LAL Kit Wave · Est. Degrade',
    src: 'meta_est_conv_lal_kit_wave_est_degrade',
    total: { rev: 43933, orders: 117, sessions: 5783 },
    months: {
      '202601': { rev: 6533,   orders: 20,  sessions: 860  },
      '202602': { rev: 30798,  orders: 78,  sessions: 3800 },
      '202603': { rev: 6602,   orders: 19,  sessions: 1000 },
      '202604': { rev: 0,      orders: 0,   sessions: 0    },
    },
  },
  {
    id: '120236241962090533', name: 'RMKT Toalha Azul · Multi-formato',
    src: 'meta_conv_toalha_azul_rmkt',
    total: { rev: 23218, orders: 71, sessions: 3294 },
    months: {
      '202601': { rev: 4468,   orders: 16,  sessions: 700  },
      '202602': { rev: 8394,   orders: 24,  sessions: 1000 },
      '202603': { rev: 8124,   orders: 23,  sessions: 1100 },
      '202604': { rev: 2232,   orders: 8,   sessions: 494  },
    },
  },
];

const STATES: StateRow[] = [
  { name: 'São Paulo',        abbr: 'SP', rev: 298934, orders: 973, ticket: 307 },
  { name: 'Rio de Janeiro',   abbr: 'RJ', rev: 136445, orders: 435, ticket: 314 },
  { name: 'Minas Gerais',     abbr: 'MG', rev: 102425, orders: 311, ticket: 329 },
  { name: 'Bahia',            abbr: 'BA', rev: 51482,  orders: 129, ticket: 399 },
  { name: 'Rio Grande do Sul',abbr: 'RS', rev: 46130,  orders: 154, ticket: 300 },
  { name: 'Pernambuco',       abbr: 'PE', rev: 40641,  orders: 105, ticket: 387 },
  { name: 'Santa Catarina',   abbr: 'SC', rev: 36527,  orders: 116, ticket: 315 },
  { name: 'Paraná',           abbr: 'PR', rev: 34382,  orders: 115, ticket: 299 },
  { name: 'Distrito Federal', abbr: 'DF', rev: 30342,  orders: 84,  ticket: 361 },
  { name: 'Goiás',            abbr: 'GO', rev: 29262,  orders: 86,  ticket: 340 },
  { name: 'Espírito Santo',   abbr: 'ES', rev: 26636,  orders: 78,  ticket: 341 },
  { name: 'Ceará',            abbr: 'CE', rev: 23297,  orders: 61,  ticket: 382 },
  { name: 'Mato Grosso',      abbr: 'MT', rev: 14091,  orders: 42,  ticket: 335 },
  { name: 'Amazonas',         abbr: 'AM', rev: 11120,  orders: 24,  ticket: 463 },
  { name: 'Pará',             abbr: 'PA', rev: 10865,  orders: 30,  ticket: 362 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtR = (v: number) =>
  v >= 1_000_000 ? `R$${(v/1_000_000).toFixed(2)}M`
  : v >= 1_000   ? `R$${(v/1_000).toFixed(1)}k`
  : `R$${v.toFixed(0)}`;

const fmtFull = (v: number) =>
  'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const MONTHS_ORDER = ['202601','202602','202603','202604'];

// ─── Componente Principal ─────────────────────────────────────────────────────

interface Props { clientName: string; theme: 'light' | 'dark'; }

const GeoAnalysisPage: React.FC<Props> = ({ theme }) => {
  const [activePeriod, setActivePeriod] = useState<'geral'|'202601'|'202602'|'202603'|'202604'>('geral');
  const [activeTab, setActiveTab] = useState<'estados'|'campanhas'>('campanhas');

  const isDark = theme === 'dark';

  // Totais do período selecionado
  const periodTotal: MonthEntry = activePeriod === 'geral'
    ? Object.values(MONTH_TOTALS).reduce((acc, m) => ({ rev: acc.rev + m.rev, orders: acc.orders + m.orders, sessions: acc.sessions + m.sessions }), { rev: 0, orders: 0, sessions: 0 })
    : MONTH_TOTALS[activePeriod];

  const totalTicket = periodTotal.orders > 0 ? Math.round(periodTotal.rev / periodTotal.orders) : 0;

  // Campanhas filtradas pelo período
  const filteredCampaigns = CAMPAIGNS.map(c => {
    const data: MonthEntry = activePeriod === 'geral'
      ? c.total
      : (c.months[activePeriod] || { rev: 0, orders: 0, sessions: 0 });
    return { ...c, data };
  }).filter(c => c.data.orders > 0).sort((a, b) => b.data.rev - a.data.rev);

  const bg = isDark ? '#1a1a2e' : '#f8fafc';
  const card = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2f4a' : '#e2e8f0';
  const text = isDark ? '#e2e8f0' : '#0f172a';
  const muted = isDark ? '#64748b' : '#94a3b8';

  return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f2027 100%)',
        padding: '40px 48px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decoração */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(59,130,246,0.12)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(16,185,129,0.08)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <span style={{ background:'rgba(59,130,246,0.2)', border:'1px solid rgba(59,130,246,0.4)', color:'#93c5fd', fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', padding:'4px 12px', borderRadius:100 }}>
              Meta Ads · 2026
            </span>
            <span style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#6ee7b7', fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 12px', borderRadius:100 }}>
              GA4 · casadatoalha.com.br
            </span>
          </div>
          <h1 style={{ fontSize:32, fontWeight:900, color:'#fff', margin:'0 0 4px', letterSpacing:'-0.5px' }}>
            Análise Geográfica & Campanhas
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:0 }}>
            Receita e pedidos atribuídos ao Meta Ads · Jan → Abr 2026
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 24px' }}>

        {/* ── FILTRO DE PERÍODO ── */}
        <div style={{ display:'flex', gap:8, marginTop:28, marginBottom:24, flexWrap:'wrap' }}>
          {([['geral','Geral 2026'],['202601','Janeiro'],['202602','Fevereiro'],['202603','Março'],['202604','Abril¹']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActivePeriod(key as any)}
              style={{
                padding:'9px 20px', borderRadius:100, cursor:'pointer', fontSize:12, fontWeight:700,
                background: activePeriod === key ? '#2563eb' : card,
                color: activePeriod === key ? '#fff' : muted,
                boxShadow: activePeriod === key ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
                border: activePeriod === key ? '1px solid transparent' : `1px solid ${border}`,
                transition:'all .2s',
              }}>
              {label}
            </button>
          ))}
          {activePeriod === '202604' && (
            <span style={{ alignSelf:'center', fontSize:10, color:muted, fontStyle:'italic' }}>¹ Até 27/04/2026</span>
          )}
        </div>

        {/* ── KPI CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {[
            { label:'Receita Meta',    value: fmtFull(periodTotal.rev),    sub:'Total atribuído', color:'#10b981', icon:'💰' },
            { label:'Pedidos',         value: periodTotal.orders.toLocaleString('pt-BR'), sub:'Transações GA4', color:'#3b82f6', icon:'🛒' },
            { label:'Ticket Médio',    value:`R$ ${totalTicket.toLocaleString('pt-BR')}`,  sub:'Receita ÷ Pedidos',  color:'#f59e0b', icon:'🎯' },
            { label:'Sessões Meta',    value: periodTotal.sessions.toLocaleString('pt-BR'), sub:'Visitas atribuídas', color:'#8b5cf6', icon:'📱' },
          ].map(k => (
            <div key={k.label} style={{ background:card, border:`1px solid ${border}`, borderRadius:20, padding:'20px 22px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${k.color},${k.color}99)` }} />
              <div style={{ fontSize:22, marginBottom:6 }}>{k.icon}</div>
              <div style={{ fontSize:22, fontWeight:900, color:text, letterSpacing:'-0.5px', marginBottom:2 }}>{k.value}</div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:muted }}>{k.label}</div>
              <div style={{ fontSize:10, color:muted, marginTop:2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:2, background: isDark ? '#0f172a' : '#f1f5f9', padding:4, borderRadius:16, marginBottom:24, width:'fit-content' }}>
          {([['campanhas','📢 Campanhas'],['estados','📍 Estados']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                padding:'10px 24px', borderRadius:12, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                background: activeTab === key ? card : 'transparent',
                color: activeTab === key ? text : muted,
                boxShadow: activeTab === key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition:'all .2s',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── ABA: CAMPANHAS ── */}
        {activeTab === 'campanhas' && (
          <div style={{ background:card, border:`1px solid ${border}`, borderRadius:24, overflow:'hidden' }}>
            {/* cabeçalho */}
            <div style={{ padding:'20px 24px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:900, color:text }}>Top Campanhas Meta Ads</div>
                <div style={{ fontSize:11, color:muted, marginTop:2 }}>
                  {activePeriod === 'geral' ? 'Janeiro a Abril 2026' : MONTH_TOTALS[activePeriod].label + ' 2026'} · Ordenado por receita atribuída (GA4)
                </div>
              </div>
              <span style={{ background:'#eff6ff', color:'#2563eb', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 14px', borderRadius:100 }}>
                {filteredCampaigns.length} campanhas ativas
              </span>
            </div>

            {/* header tabela */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 90px 90px 90px', gap:12, padding:'10px 24px', borderBottom:`1px solid ${border}` }}>
              {['Campanha','Evolução Mensal','Receita','Pedidos','Ticket'].map(h => (
                <div key={h} style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:muted, textAlign: h !== 'Campanha' && h !== 'Evolução Mensal' ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            {/* linhas */}
            {filteredCampaigns.map((c, idx) => {
              const ticket = c.data.orders > 0 ? Math.round(c.data.rev / c.data.orders) : 0;
              const maxMonthRev = Math.max(...MONTHS_ORDER.map(m => c.months[m]?.rev || 0));
              return (
                <div key={c.id} style={{
                  display:'grid', gridTemplateColumns:'2fr 1fr 90px 90px 90px', gap:12,
                  padding:'14px 24px', borderBottom: idx < filteredCampaigns.length-1 ? `1px solid ${border}` : 'none',
                  transition:'background .15s',
                }}>
                  {/* nome */}
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:10, fontWeight:900, color:muted, width:18 }}>{idx+1}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:text, lineHeight:1.3 }}>{c.name}</div>
                        <div style={{ fontSize:10, color:muted, marginTop:2, fontFamily:'monospace' }}>
                          {c.id.length > 12 ? c.id : c.id} · {c.src}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* sparkline mensal */}
                  <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:32 }}>
                    {MONTHS_ORDER.map(m => {
                      const val = c.months[m]?.rev || 0;
                      const pct = maxMonthRev > 0 ? val / maxMonthRev : 0;
                      const isActive = m === activePeriod;
                      return (
                        <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                          <div style={{
                            width:'100%', height: Math.max(pct * 24, val > 0 ? 4 : 0),
                            background: isActive ? '#2563eb' : (val > 0 ? '#bfdbfe' : '#e2e8f0'),
                            borderRadius:2, transition:'height .3s',
                          }} />
                          <div style={{ fontSize:8, color: isActive ? '#2563eb' : muted, fontWeight: isActive ? 800 : 400 }}>
                            {['J','F','M','A'][MONTHS_ORDER.indexOf(m)]}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* métricas */}
                  <div style={{ fontSize:13, fontWeight:800, color:text, textAlign:'right' }}>{fmtFull(c.data.rev)}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#2563eb', textAlign:'right' }}>{c.data.orders}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#10b981', textAlign:'right' }}>R$ {ticket.toLocaleString('pt-BR')}</div>
                </div>
              );
            })}

            {filteredCampaigns.length === 0 && (
              <div style={{ padding:48, textAlign:'center', color:muted, fontSize:13 }}>
                Nenhuma campanha ativa neste período.
              </div>
            )}
          </div>
        )}

        {/* ── ABA: ESTADOS ── */}
        {activeTab === 'estados' && (
          <div>
            {/* aviso período */}
            {activePeriod !== 'geral' && (
              <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#92400e', display:'flex', gap:8, alignItems:'center' }}>
                <span>ℹ️</span>
                <span>O ranking de estados exibe dados consolidados de <strong>Jan–Abr 2026</strong>. Para quebra por mês por estado, aguardar integração Kondado em andamento.</span>
              </div>
            )}

            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:24, overflow:'hidden' }}>
              <div style={{ padding:'20px 24px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:900, color:text }}>Receita por Estado · Meta Ads</div>
                  <div style={{ fontSize:11, color:muted, marginTop:2 }}>Jan–Abr 2026 · 15 estados com maior receita atribuída</div>
                </div>
                <span style={{ background:'#f0fdf4', color:'#16a34a', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 14px', borderRadius:100 }}>
                  R$ 892,6k atribuído
                </span>
              </div>

              {/* col headers */}
              <div style={{ display:'grid', gridTemplateColumns:'28px 120px 1fr 100px 70px 80px', gap:12, padding:'10px 24px', borderBottom:`1px solid ${border}` }}>
                {['#','Estado','Participação','Receita','Pedidos','Ticket'].map((h,i) => (
                  <div key={h} style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:muted, textAlign: i > 3 ? 'right' : 'left' }}>{h}</div>
                ))}
              </div>

              {STATES.map((s, idx) => {
                const pct = (s.rev / STATES[0].rev) * 100;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : String(idx+1);
                const barColor = idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#ec4899' : '#3b82f6';
                const isHighTicket = s.ticket > 360;
                return (
                  <div key={s.abbr} style={{
                    display:'grid', gridTemplateColumns:'28px 120px 1fr 100px 70px 80px', gap:12, alignItems:'center',
                    padding:'12px 24px',
                    borderBottom: idx < STATES.length-1 ? `1px solid ${border}` : 'none',
                    background: idx < 3 ? (isDark ? 'rgba(255,255,255,0.02)' : (idx===0?'#fffbeb':idx===1?'#f8fafc':'#fdf4ff')) : 'transparent',
                  }}>
                    <div style={{ fontSize:14, textAlign:'center' }}>{medal}</div>
                    <div>
                      <span style={{ fontSize:12, fontWeight:700, color:text }}>{s.name}</span>
                      <span style={{ fontSize:10, color:muted, marginLeft:6, fontWeight:600, background: isDark?'#1a2035':'#f1f5f9', padding:'1px 6px', borderRadius:4 }}>{s.abbr}</span>
                    </div>
                    <div style={{ height:8, background: isDark?'#1e2a3a':'#e2e8f0', borderRadius:100, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:barColor, borderRadius:100, transition:'width .4s' }} />
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, color:text, textAlign:'right' }}>{fmtFull(s.rev)}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:muted, textAlign:'right' }}>{s.orders}</div>
                    <div style={{ fontSize:12, fontWeight:700, color: isHighTicket ? '#f59e0b' : '#10b981', textAlign:'right' }}>
                      R$ {s.ticket.toLocaleString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* insights */}
            <div style={{
              background: isDark ? '#1a2035' : 'linear-gradient(135deg,#eff6ff,#f0fdf4)',
              border:`1px solid ${isDark?'#2a3a5a':'#bfdbfe'}`,
              borderRadius:20, padding:'22px 28px', marginTop:20,
            }}>
              <div style={{ fontSize:10, fontWeight:900, letterSpacing:'0.2em', textTransform:'uppercase', color:'#2563eb', marginBottom:14 }}>
                📍 Insights Geográficos · Meta Ads 2026
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  { icon:'🏆', title:'SP + RJ + MG = 60% da Receita', body:'Os 3 maiores estados concentram R$537K dos R$892K atribuídos ao Meta. Reforçar segmentação geo nessas praças é prioritário.' },
                  { icon:'💎', title:'Nordeste tem ticket acima da média', body:'BA (R$399), PE (R$387) e CE (R$382) superam a média nacional de R$330. Oportunidade de escalar campanhas premium no Nordeste.' },
                  { icon:'🚀', title:'DF e GO: alto ticket, volume a crescer', body:'Distrito Federal (R$361) e Goiás (R$340) têm tickets saudáveis com pedidos ainda limitados — bom potencial de escala.' },
                  { icon:'🌊', title:'Amazonas: maior ticket do ranking', body:'AM apresenta R$463 de ticket médio, acima de SP e RJ. Vale testar verba incremental com campanhas de produto premium.' },
                ].map(i => (
                  <div key={i.title}>
                    <div style={{ fontSize:12, fontWeight:800, color:text, marginBottom:4 }}>{i.icon} {i.title}</div>
                    <div style={{ fontSize:11, color: isDark?'#94a3b8':'#475569', lineHeight:1.6 }}>{i.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EVOLUÇÃO MENSAL (sempre visível) ── */}
        <div style={{ background:card, border:`1px solid ${border}`, borderRadius:24, padding:'22px 24px', marginTop:24 }}>
          <div style={{ fontSize:14, fontWeight:900, color:text, marginBottom:4 }}>Evolução Mensal · Meta Ads 2026</div>
          <div style={{ fontSize:11, color:muted, marginBottom:20 }}>Receita e pedidos mês a mês</div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {MONTHS_ORDER.map(m => {
              const d = MONTH_TOTALS[m];
              const isActive = activePeriod === m;
              const ticket = d.orders > 0 ? Math.round(d.rev / d.orders) : 0;
              const maxRev = Math.max(...Object.values(MONTH_TOTALS).map(x => x.rev));
              const barPct = (d.rev / maxRev) * 100;
              return (
                <button key={m} onClick={() => setActivePeriod(m as any)}
                  style={{
                    background: isActive ? '#2563eb' : (isDark?'#0f172a':'#f8fafc'),
                    border:`1px solid ${isActive?'#2563eb':border}`,
                    borderRadius:16, padding:'16px 18px', cursor:'pointer', textAlign:'left',
                    boxShadow: isActive ? '0 6px 20px rgba(37,99,235,0.3)' : 'none',
                    transition:'all .2s',
                  }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color: isActive?'rgba(255,255,255,0.7)':muted, marginBottom:8 }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize:18, fontWeight:900, color: isActive?'#fff':text, marginBottom:2 }}>
                    {fmtR(d.rev)}
                  </div>
                  <div style={{ fontSize:11, color: isActive?'rgba(255,255,255,0.65)':muted, marginBottom:12 }}>
                    {d.orders} pedidos · R${ticket} ticket
                  </div>
                  {/* barra */}
                  <div style={{ height:4, background: isActive?'rgba(255,255,255,0.2)':'#e2e8f0', borderRadius:100, overflow:'hidden' }}>
                    <div style={{ width:`${barPct}%`, height:'100%', background: isActive?'rgba(255,255,255,0.8)':'#2563eb', borderRadius:100 }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* destaques */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:16 }}>
            <div style={{ background: isDark?'#0f172a':'#f0fdf4', border:`1px solid ${isDark?'#1e3a2a':'#bbf7d0'}`, borderRadius:12, padding:'12px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#16a34a', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>📈 Melhor Mês</div>
              <div style={{ fontSize:16, fontWeight:900, color:text }}>Março 2026</div>
              <div style={{ fontSize:11, color:muted }}>R$ 345,7k · 1.106 pedidos</div>
            </div>
            <div style={{ background: isDark?'#0f172a':'#eff6ff', border:`1px solid ${isDark?'#1e2a4a':'#bfdbfe'}`, borderRadius:12, padding:'12px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#2563eb', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>📊 Total Acumulado</div>
              <div style={{ fontSize:16, fontWeight:900, color:text }}>R$ 1,044M</div>
              <div style={{ fontSize:11, color:muted }}>3.182 pedidos · Jan–Abr</div>
            </div>
            <div style={{ background: isDark?'#0f172a':'#fefce8', border:`1px solid ${isDark?'#3a2a00':'#fde68a'}`, borderRadius:12, padding:'12px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#d97706', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>🎯 Ticket Médio Geral</div>
              <div style={{ fontSize:16, fontWeight:900, color:text }}>R$ 328</div>
              <div style={{ fontSize:11, color:muted }}>Média dos 4 meses</div>
            </div>
          </div>
        </div>

        {/* ── RODAPÉ ── */}
        <div style={{ marginTop:32, paddingTop:16, borderTop:`1px solid ${border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:10, color:muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Fonte: Google Analytics 4 · Propriedade 310472089 · casadatoalha.com.br
          </span>
          <span style={{ fontSize:10, color:muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Wigoo Analytics · Dados: Meta Ads · Jan–Abr 2026
          </span>
        </div>

      </div>
    </div>
  );
};

export default GeoAnalysisPage;
