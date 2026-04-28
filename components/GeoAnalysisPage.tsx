import React, { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MonthEntry { rev: number; orders: number; sessions: number; }
interface StateEntry { state: string; rev: number; orders: number; }
interface CampaignRow {
  id: string;
  name: string;
  src: string;
  total: MonthEntry;
  months: Record<string, MonthEntry>;
  byState: StateEntry[];
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
  '202601': { label: 'Janeiro',   rev: 236045, orders: 665,  sessions: 73594  },
  '202602': { label: 'Fevereiro', rev: 225092, orders: 693,  sessions: 71128  },
  '202603': { label: 'Março',     rev: 345774, orders: 1106, sessions: 106826 },
  '202604': { label: 'Abril',     rev: 240089, orders: 726,  sessions: 77835  },
};

const CAMPAIGNS: CampaignRow[] = [
  {
    id: '120216037685880533', name: 'Essence VD · Você Está Sendo Enganado',
    src: 'meta / cpc',
    total: { rev: 209925, orders: 630, sessions: 62178 },
    months: {
      '202601': { rev: 50991,  orders: 143, sessions: 14589 },
      '202602': { rev: 51150,  orders: 168, sessions: 15307 },
      '202603': { rev: 65899,  orders: 205, sessions: 18809 },
      '202604': { rev: 41884,  orders: 114, sessions: 13473 },
    },
    byState: [
      { state:'SP', rev:75592, orders:246 }, { state:'MG', rev:14418, orders:44 },
      { state:'RJ', rev:13893, orders:46 },  { state:'RS', rev:11008, orders:42 },
      { state:'BA', rev:9251,  orders:26 },  { state:'PR', rev:9154,  orders:33 },
      { state:'SC', rev:9027,  orders:31 },  { state:'PE', rev:8752,  orders:18 },
    ],
  },
  {
    id: '120237824657680533', name: 'LAL Jogo Wave · Est. Branca',
    src: 'meta / cpc',
    total: { rev: 106632, orders: 319, sessions: 17389 },
    months: {
      '202601': { rev: 39636,  orders: 113, sessions: 6590 },
      '202602': { rev: 24253,  orders: 74,  sessions: 4102 },
      '202603': { rev: 24079,  orders: 72,  sessions: 4145 },
      '202604': { rev: 18663,  orders: 60,  sessions: 2552 },
    },
    byState: [
      { state:'SP', rev:29050, orders:93  }, { state:'RJ', rev:12797, orders:39  },
      { state:'MG', rev:11052, orders:32  }, { state:'SC', rev:7729,  orders:23  },
      { state:'BA', rev:6896,  orders:16  }, { state:'RS', rev:5988,  orders:20  },
      { state:'PE', rev:5484,  orders:15  }, { state:'PR', rev:5442,  orders:17  },
    ],
  },
  {
    id: '120233362899670533', name: 'Catálogo DPA 01 · Remarketing',
    src: 'meta / cpc',
    total: { rev: 105824, orders: 361, sessions: 28342 },
    months: {
      '202601': { rev: 20303,  orders: 63,  sessions: 3098  },
      '202602': { rev: 21864,  orders: 72,  sessions: 4508  },
      '202603': { rev: 30657,  orders: 116, sessions: 10314 },
      '202604': { rev: 33000,  orders: 110, sessions: 10422 },
    },
    byState: [
      { state:'SP', rev:34997, orders:124 }, { state:'RJ', rev:22281, orders:73  },
      { state:'MG', rev:12065, orders:42  }, { state:'BA', rev:5065,  orders:14  },
      { state:'PE', rev:5035,  orders:16  }, { state:'RS', rev:3812,  orders:17  },
      { state:'ES', rev:3765,  orders:11  }, { state:'SC', rev:3193,  orders:9   },
    ],
  },
  {
    id: '120209904601020533', name: 'Wave VD · 63 Centavos',
    src: 'meta / cpc',
    total: { rev: 94184, orders: 281, sessions: 27547 },
    months: {
      '202601': { rev: 24798,  orders: 71,  sessions: 7868  },
      '202602': { rev: 26752,  orders: 84,  sessions: 7775  },
      '202603': { rev: 24141,  orders: 77,  sessions: 7658  },
      '202604': { rev: 18493,  orders: 49,  sessions: 4246  },
    },
    byState: [
      { state:'SP', rev:36133, orders:109 }, { state:'MG', rev:10361, orders:33  },
      { state:'RJ', rev:7155,  orders:25  }, { state:'SC', rev:6114,  orders:17  },
      { state:'BA', rev:5156,  orders:11  }, { state:'DF', rev:4876,  orders:11  },
      { state:'RS', rev:4610,  orders:15  }, { state:'PR', rev:3777,  orders:12  },
    ],
  },
  {
    id: '120237822074150533', name: 'LAL Kit Wave · Est. Degradê',
    src: 'meta / cpc',
    total: { rev: 75886, orders: 198, sessions: 9521 },
    months: {
      '202601': { rev: 27837,  orders: 72,  sessions: 3419 },
      '202602': { rev: 38110,  orders: 98,  sessions: 4953 },
      '202603': { rev: 9939,   orders: 28,  sessions: 1136 },
      '202604': { rev: 0,      orders: 0,   sessions: 13   },
    },
    byState: [
      { state:'RJ', rev:18765, orders:43  }, { state:'SP', rev:16009, orders:42  },
      { state:'GO', rev:5355,  orders:13  }, { state:'MG', rev:5656,  orders:18  },
      { state:'RS', rev:4790,  orders:15  }, { state:'PE', rev:4004,  orders:8   },
      { state:'BA', rev:2852,  orders:8   }, { state:'PR', rev:2697,  orders:7   },
    ],
  },
  {
    id: '120236241962090533', name: 'RMKT Toalha Azul · Multi-formato',
    src: 'meta / cpc',
    total: { rev: 71874, orders: 228, sessions: 10494 },
    months: {
      '202601': { rev: 25011,  orders: 79,  sessions: 3285 },
      '202602': { rev: 19337,  orders: 59,  sessions: 2646 },
      '202603': { rev: 15006,  orders: 51,  sessions: 2581 },
      '202604': { rev: 12520,  orders: 39,  sessions: 1982 },
    },
    byState: [
      { state:'SP', rev:22537, orders:75  }, { state:'RJ', rev:12862, orders:43  },
      { state:'MG', rev:6936,  orders:20  }, { state:'RS', rev:4556,  orders:13  },
      { state:'BA', rev:3914,  orders:15  }, { state:'PR', rev:3396,  orders:10  },
      { state:'SC', rev:2905,  orders:7   }, { state:'PE', rev:2886,  orders:7   },
    ],
  },
  {
    id: 'WG_CONVERSÃO_KIT_WAVE', name: 'WG Conversão · Kit Wave',
    src: 'facebook / paid_social',
    total: { rev: 60732, orders: 184, sessions: 9286 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0    },
      '202602': { rev: 0,      orders: 0,   sessions: 0    },
      '202603': { rev: 40721,  orders: 125, sessions: 5970 },
      '202604': { rev: 20011,  orders: 59,  sessions: 3316 },
    },
    byState: [
      { state:'SP', rev:19087, orders:59  }, { state:'RJ', rev:5380,  orders:19  },
      { state:'BA', rev:4543,  orders:11  }, { state:'CE', rev:4330,  orders:11  },
      { state:'PR', rev:3789,  orders:13  }, { state:'MG', rev:3561,  orders:10  },
      { state:'PE', rev:3529,  orders:11  }, { state:'MT', rev:2556,  orders:4   },
    ],
  },
  {
    id: '120240276217390533', name: 'Essence VD · Enganado (Variante B)',
    src: 'meta / cpc',
    total: { rev: 56621, orders: 188, sessions: 17531 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0     },
      '202602': { rev: 0,      orders: 0,   sessions: 0     },
      '202603': { rev: 34705,  orders: 114, sessions: 10329 },
      '202604': { rev: 21916,  orders: 74,  sessions: 7202  },
    },
    byState: [
      { state:'RJ', rev:25559, orders:87  }, { state:'SP', rev:12792, orders:47  },
      { state:'MG', rev:4962,  orders:16  }, { state:'ES', rev:3027,  orders:8   },
      { state:'RS', rev:2406,  orders:4   }, { state:'BA', rev:2296,  orders:5   },
      { state:'PR', rev:976,   orders:5   }, { state:'MT', rev:792,   orders:3   },
    ],
  },
  {
    id: 'WG_CONVERSÃO_ANO_NOVO', name: 'WG Conversão · Ano Novo',
    src: 'facebook / paid_social',
    total: { rev: 53874, orders: 176, sessions: 11182 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0    },
      '202602': { rev: 0,      orders: 0,   sessions: 0    },
      '202603': { rev: 29407,  orders: 103, sessions: 5747 },
      '202604': { rev: 24466,  orders: 73,  sessions: 5435 },
    },
    byState: [
      { state:'SP', rev:19156, orders:67  }, { state:'MG', rev:7379,  orders:19  },
      { state:'RJ', rev:4572,  orders:18  }, { state:'RS', rev:3834,  orders:11  },
      { state:'DF', rev:2396,  orders:7   }, { state:'BA', rev:2305,  orders:8   },
      { state:'SC', rev:2269,  orders:7   }, { state:'PE', rev:1952,  orders:6   },
    ],
  },
  {
    id: '120240276183270533', name: 'Essence VD · Enganado (Variante C)',
    src: 'meta / cpc',
    total: { rev: 51239, orders: 151, sessions: 14701 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0     },
      '202602': { rev: 0,      orders: 0,   sessions: 0     },
      '202603': { rev: 37381,  orders: 110, sessions: 10805 },
      '202604': { rev: 13859,  orders: 41,  sessions: 3896  },
    },
    byState: [
      { state:'MG', rev:20902, orders:63  }, { state:'SP', rev:12890, orders:42  },
      { state:'BA', rev:5380,  orders:6   }, { state:'RJ', rev:5250,  orders:17  },
      { state:'GO', rev:1356,  orders:5   }, { state:'ES', rev:860,   orders:3   },
      { state:'PB', rev:810,   orders:2   }, { state:'RS', rev:784,   orders:2   },
    ],
  },
];

const STATES: StateRow[] = [
  { name: 'São Paulo',        abbr: 'SP', rev: 328165, orders: 1072, ticket: 306 },
  { name: 'Rio de Janeiro',   abbr: 'RJ', rev: 153314, orders: 479,  ticket: 320 },
  { name: 'Minas Gerais',     abbr: 'MG', rev: 118593, orders: 356,  ticket: 333 },
  { name: 'Bahia',            abbr: 'BA', rev: 56442,  orders: 142,  ticket: 397 },
  { name: 'Rio Grande do Sul',abbr: 'RS', rev: 51854,  orders: 174,  ticket: 298 },
  { name: 'Pernambuco',       abbr: 'PE', rev: 42776,  orders: 112,  ticket: 382 },
  { name: 'Paraná',           abbr: 'PR', rev: 38609,  orders: 128,  ticket: 302 },
  { name: 'Santa Catarina',   abbr: 'SC', rev: 38293,  orders: 121,  ticket: 316 },
  { name: 'Distrito Federal', abbr: 'DF', rev: 32467,  orders: 89,   ticket: 365 },
  { name: 'Goiás',            abbr: 'GO', rev: 31159,  orders: 92,   ticket: 339 },
  { name: 'Espírito Santo',   abbr: 'ES', rev: 28241,  orders: 84,   ticket: 336 },
  { name: 'Ceará',            abbr: 'CE', rev: 25901,  orders: 67,   ticket: 387 },
  { name: 'Mato Grosso',      abbr: 'MT', rev: 17885,  orders: 48,   ticket: 373 },
  { name: 'Pará',             abbr: 'PA', rev: 12393,  orders: 34,   ticket: 365 },
  { name: 'Amazonas',         abbr: 'AM', rev: 11120,  orders: 24,   ticket: 463 },
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
  const [expandedCamp, setExpandedCamp] = useState<string | null>(null);

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

        {/* ── AVISO DE METODOLOGIA ── */}
        <div style={{
          background: isDark ? '#1a1f35' : '#f8faff',
          border: `1px solid ${isDark ? '#2a3555' : '#dbeafe'}`,
          borderRadius: 14, padding: '10px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
          <p style={{ fontSize: 11, color: isDark ? '#93c5fd' : '#1e40af', margin: 0, lineHeight: 1.6 }}>
            <strong>Metodologia:</strong> dados filtrados por{' '}
            <code style={{ background: isDark ? '#1e3a5f' : '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>
              Origem/mídia da sessão contém "meta"
            </code>{' '}
            ou{' '}
            <code style={{ background: isDark ? '#1e3a5f' : '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>
              "facebook"
            </code>
            . Receita por estado via dimensão{' '}
            <code style={{ background: isDark ? '#1e3a5f' : '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>region</code>{' '}
            do GA4.
          </p>
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
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 90px 90px 90px 28px', gap:12, padding:'10px 24px', borderBottom:`1px solid ${border}` }}>
              {['Campanha','Evolução Mensal','Receita','Pedidos','Ticket',''].map(h => (
                <div key={h} style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:muted, textAlign: h !== 'Campanha' && h !== 'Evolução Mensal' ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            {/* linhas */}
            {filteredCampaigns.map((c, idx) => {
              const ticket = c.data.orders > 0 ? Math.round(c.data.rev / c.data.orders) : 0;
              const maxMonthRev = Math.max(...MONTHS_ORDER.map(m => c.months[m]?.rev || 0));
              const isExpanded = expandedCamp === c.id;
              const maxStateRev = c.byState[0]?.rev || 1;
              return (
                <div key={c.id} style={{ borderBottom: idx < filteredCampaigns.length-1 ? `1px solid ${border}` : 'none' }}>
                  {/* linha principal — clicável */}
                  <div
                    onClick={() => setExpandedCamp(isExpanded ? null : c.id)}
                    style={{
                      display:'grid', gridTemplateColumns:'2fr 1fr 90px 90px 90px 28px', gap:12,
                      padding:'14px 24px', cursor:'pointer',
                      background: isExpanded ? (isDark ? 'rgba(37,99,235,0.08)' : '#f0f7ff') : 'transparent',
                      transition:'background .15s',
                    }}>
                    {/* nome */}
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:10, fontWeight:900, color:muted, width:18 }}>{idx+1}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:text, lineHeight:1.3 }}>{c.name}</div>
                        <div style={{ fontSize:10, color:muted, marginTop:2, fontFamily:'monospace' }}>
                          {c.id} · {c.src}
                        </div>
                      </div>
                    </div>
                    {/* sparkline */}
                    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:32 }}>
                      {MONTHS_ORDER.map(m => {
                        const val = c.months[m]?.rev || 0;
                        const pct = maxMonthRev > 0 ? val / maxMonthRev : 0;
                        const isActive = m === activePeriod;
                        return (
                          <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                            <div style={{
                              width:'100%', height: Math.max(pct * 24, val > 0 ? 4 : 0),
                              background: isActive ? '#2563eb' : (val > 0 ? '#bfdbfe' : (isDark?'#1e2a3a':'#e2e8f0')),
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
                    {/* chevron */}
                    <div style={{ fontSize:12, color:muted, textAlign:'center', alignSelf:'center', transform: isExpanded ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▾</div>
                  </div>

                  {/* painel de estados expandível */}
                  {isExpanded && (
                    <div style={{
                      background: isDark ? 'rgba(37,99,235,0.05)' : '#f8fbff',
                      borderTop: `1px dashed ${isDark ? '#2a3a6a' : '#bfdbfe'}`,
                      padding: '16px 24px 20px 52px',
                    }}>
                      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'#2563eb', marginBottom:12 }}>
                        📍 Receita por Estado · Jan–Abr 2026 (todos os períodos)
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                        {c.byState.map((s, si) => {
                          const pct = (s.rev / maxStateRev) * 100;
                          const stateTicket = s.orders > 0 ? Math.round(s.rev / s.orders) : 0;
                          return (
                            <div key={s.state} style={{
                              background: isDark ? '#0f172a' : '#fff',
                              border: `1px solid ${isDark ? '#1e2a4a' : '#dbeafe'}`,
                              borderRadius:10, padding:'10px 12px',
                            }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                                <span style={{ fontSize:11, fontWeight:800, color:text }}>{s.state}</span>
                                <span style={{ fontSize:9, fontWeight:700, color:muted }}>#{si+1}</span>
                              </div>
                              <div style={{ height:4, background: isDark?'#1e2a3a':'#e2e8f0', borderRadius:100, overflow:'hidden', marginBottom:6 }}>
                                <div style={{ width:`${pct}%`, height:'100%', background:'#3b82f6', borderRadius:100 }} />
                              </div>
                              <div style={{ fontSize:12, fontWeight:800, color:text }}>{fmtR(s.rev)}</div>
                              <div style={{ fontSize:10, color:muted, marginTop:2 }}>{s.orders} ped · R${stateTicket} ticket</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
