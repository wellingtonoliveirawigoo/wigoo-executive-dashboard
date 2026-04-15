
import { DashboardData, Campaign, PlatformData, MetricYoY, Creative } from '../types';

const parseSingleNumber = (val: string | undefined): number => {
  if (!val || typeof val !== 'string' || val.trim() === '' || val === '∞' || val === '∞%') return 0;
  const clean = val.replace(/\./g, '').replace(',', '.').replace('%', '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export const getDynamicFontSize = (text: string, baseSize: string = 'text-xl'): string => {
  const len = text.length;
  if (len > 22) return 'text-[9px]';
  if (len > 18) return 'text-[10px]';
  if (len > 15) return 'text-xs';
  if (len > 12) return 'text-sm';
  if (len > 10) return 'text-base';
  return baseSize;
};

const calculateVariation = (current: number, previous: number): string | undefined => {
  if (previous === 0) return undefined;
  const variation = ((current - previous) / previous) * 100;
  return variation > 0 ? `+${variation.toFixed(2)}%` : `${variation.toFixed(2)}%`;
};

const parseYoYMetric = (val: string | undefined, valAnterior?: string): MetricYoY => {
  if (!val) return { current: 0, previous: 0 };
  
  if (val.includes('|') && !val.includes('||')) {
    const parts = val.split('|');
    const map: Record<string, string> = {};
    parts.forEach(p => {
      const splitIdx = p.indexOf('=');
      if (splitIdx !== -1) {
        const key = p.substring(0, splitIdx);
        const value = p.substring(splitIdx + 1);
        map[key] = value;
      }
    });

    return {
      current: parseSingleNumber(map['atual']),
      previous: parseSingleNumber(map['anterior']),
      variation: map['var'] || undefined,
      diff: map['diff'] ? parseSingleNumber(map['diff']) : undefined
    };
  }

  const current = parseSingleNumber(val);
  const previous = valAnterior ? parseSingleNumber(valAnterior) : 0;
  
  return {
    current,
    previous,
    variation: calculateVariation(current, previous),
    diff: current - previous
  };
};

export const parsePbiExport = (input: string): DashboardData | null => {
  if (!input) return null;

  const isCreativeExport = input.includes('EXPORT_CREATIVOS_FULL_MOM');
  const isPerformanceExport = !isCreativeExport && (
                               input.includes('_EXPORT_') || 
                               input.includes('EXPORT_YOY') || 
                               input.includes('EXPORT_C&A') || 
                               input.includes('EXPORT_MOM')
                             );
                  
  if (!isCreativeExport && !isPerformanceExport) return null;

  const segments = input.split(';;');
  const kv: Record<string, string> = {};

  segments.forEach(seg => {
    const splitIdx = seg.indexOf('=');
    if (splitIdx !== -1) {
      const key = seg.substring(0, splitIdx).trim();
      const value = seg.substring(splitIdx + 1).trim();
      kv[key] = value;
    }
  });

  if (isCreativeExport) {
    const rawCreatives = kv['detalhamento_criativos'] || '';
    const creatives: Creative[] = rawCreatives.split('||').map((item, idx) => {
      const pMap: Record<string, string> = {};
      
      // Known keys in the export
      const keys = ['n', 'i', 'i_ant', 'im', 'im_ant', 'cl', 'cl_ant', 'co', 'co_ant', 're', 're_ant', 'roas', 'roas_ant', 'cpa', 'cpa_ant', 'url', 'dif_criativo', 'dias_ativos', 'visit', 'visit_ant', 'cps', 'cps_ant'];
      
      // Improved parsing: find keys followed by colons, but handle the fact that values (like URLs or names) might contain pipes or colons
      // We'll use a more surgical approach: split by " | " (space pipe space) which is the standard separator
      const parts = item.split(' | ');
      
      parts.forEach(p => {
        const colonIdx = p.indexOf(':');
        if (colonIdx !== -1) {
          const k = p.substring(0, colonIdx).trim();
          const v = p.substring(colonIdx + 1).trim();
          if (keys.includes(k)) {
            pMap[k] = v;
          }
        }
      });

      // Special handling for the first part which might not have a leading space before 'n:'
      if (!pMap['n']) {
        const firstPart = parts[0];
        const nMatch = firstPart.match(/^n:\s*(.*)$/i) || firstPart.match(/[\s|]n:\s*(.*)$/i);
        if (nMatch) pMap['n'] = nMatch[1].trim();
      }

      // Special handling for the URL which is often the last part and might contain pipes
      if (item.includes('url:')) {
        const urlPart = item.substring(item.indexOf('url:') + 4).split(' || ')[0].trim();
        if (urlPart) pMap['url'] = urlPart;
      }
      
      const name = pMap['n'] && pMap['n'].trim() !== '' ? pMap['n'] : `Criativo ${String(idx + 1).padStart(2, '0')}`;
      const url = pMap['url'] || '';
      
      const isCpsMode = pMap['cps'] !== undefined || pMap['visit'] !== undefined;
      
      return {
        name,
        investment: { current: parseSingleNumber(pMap['i']), previous: parseSingleNumber(pMap['i_ant']) },
        impressions: { current: parseSingleNumber(pMap['im']), previous: parseSingleNumber(pMap['im_ant']) },
        clicks: { current: parseSingleNumber(pMap['cl']), previous: parseSingleNumber(pMap['cl_ant']) },
        conversions: { 
          current: parseSingleNumber(pMap[isCpsMode ? 'visit' : 'co']), 
          previous: parseSingleNumber(pMap[isCpsMode ? 'visit_ant' : 'co_ant']) 
        },
        revenue: { 
          current: parseSingleNumber(pMap[isCpsMode ? 'cps' : 're']), 
          previous: parseSingleNumber(pMap[isCpsMode ? 'cps_ant' : 're_ant']) 
        },
        daysRunning: parseSingleNumber(pMap['dif_criativo'] || pMap['dias_ativos']),
        url,
        metricNames: isCpsMode ? {
          conversions: 'Visitas',
          revenue: 'CPS',
          efficiency: 'CPS'
        } : undefined
      };
    }).filter(c => {
      if (!c.url || c.url === '') return false;
      // Filtra URLs de imagens placeholder/default do Facebook (catálogo genérico)
      const lowerUrl = c.url.toLowerCase();
      if (lowerUrl.includes('75341531_494485104475166')) return false; // Placeholder padrão do catálogo FB
      if (!lowerUrl.includes('http')) return false;
      // Só aceita URLs de imagens reais (jpg, jpeg, png com conteúdo real)
      const isImageUrl = lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || lowerUrl.includes('.webp') || lowerUrl.includes('scontent') || lowerUrl.includes('external-') || lowerUrl.includes('fbcdn.net');
      return isImageUrl;
    });

    return {
      exportType: 'CREATIVE',
      periodStart: kv['periodo_inicio'] || '',
      periodEnd: kv['periodo_fim'] || '',
      periodLyStart: kv['periodo_inicio_anterior'] || '',
      periodLyEnd: kv['periodo_fim_anterior'] || '',
      investment: { current: 0, previous: 0 },
      impressions: { current: 0, previous: 0 },
      cliques: { current: 0, previous: 0 },
      conversions: { current: 0, previous: 0 },
      receita: { current: 0, previous: 0 },
      roas: { current: 0, previous: 0 },
      cpa: { current: 0, previous: 0 },
      ctr: { current: 0, previous: 0 },
      platforms: [],
      campaigns: [],
      creatives
    };
  }

  const allPlatformNames = Array.from(new Set(Object.keys(kv)
    .filter(k => k.endsWith('_investimento') || k.endsWith('_receita'))
    .map(k => k.split('_')[0].replace('_anterior', ''))
    .filter(name => !['ga4', 'vtex', 'vendas', 'periodo'].includes(name.toLowerCase()))));

  const platforms: PlatformData[] = allPlatformNames.map(name => {
    const investment = parseYoYMetric(kv[`${name}_investimento`], kv[`${name}_investimento_anterior`]);
    const revenue = parseYoYMetric(kv[`${name}_receita`], kv[`${name}_receita_anterior`]);
    const conversions = parseYoYMetric(kv[`${name}_conversoes`], kv[`${name}_conversoes_anterior`]);
    
    // Calculate ROAS if missing
    let roas = parseYoYMetric(kv[`${name}_roas`], kv[`${name}_roas_anterior`]);
    if (roas.current === 0 && investment.current > 0) {
      roas.current = revenue.current / investment.current;
      roas.previous = investment.previous > 0 ? revenue.previous / investment.previous : 0;
      roas.variation = calculateVariation(roas.current, roas.previous);
      roas.diff = roas.current - roas.previous;
    }

    // Calculate CPA if missing
    let cpa = parseYoYMetric(kv[`${name}_cpa`], kv[`${name}_cpa_anterior`]);
    if (cpa.current === 0 && conversions.current > 0) {
      cpa.current = investment.current / conversions.current;
      cpa.previous = conversions.previous > 0 ? investment.previous / conversions.previous : 0;
      cpa.variation = calculateVariation(cpa.current, cpa.previous);
      cpa.diff = cpa.current - cpa.previous;
    }

    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      investment,
      impressions: parseYoYMetric(kv[`${name}_impressoes`], kv[`${name}_impressoes_anterior`]),
      clicks: parseYoYMetric(kv[`${name}_cliques`], kv[`${name}_cliques_anterior`]),
      conversions,
      revenue,
      roas,
      cpa,
      pct: parseYoYMetric(kv[`${name}_pct`], kv[`${name}_pct_anterior`]),
    };
  }).filter(p => p.investment.current > 0 || p.revenue.current > 0);

  const result: DashboardData = {
    exportType: 'PERFORMANCE',
    periodStart: kv['periodo_inicio'] || '',
    periodEnd: kv['periodo_fim'] || '',
    periodLyStart: kv['periodo_inicio_anterior'],
    periodLyEnd: kv['periodo_fim_anterior'],
    investment: parseYoYMetric(kv['investimento'], kv['investimento_anterior']),
    impressions: parseYoYMetric(kv['impressoes'], kv['impressoes_anterior']),
    cliques: parseYoYMetric(kv['cliques'], kv['cliques_anterior']),
    conversions: parseYoYMetric(kv['conversoes'], kv['conversoes_anterior']),
    receita: parseYoYMetric(kv['receita'], kv['receita_anterior']),
    roas: parseYoYMetric(kv['roas'], kv['roas_anterior']),
    cpa: parseYoYMetric(kv['cpa'], kv['cpa_anterior']),
    ctr: parseYoYMetric(kv['ctr'], kv['ctr_anterior']),
    platforms,
    campaigns: []
  };

  // Restaura GA4 e VTEX
  if (kv['ga4_sessoes'] || kv['ga4_receita']) {
    const sessions = parseYoYMetric(kv['ga4_sessoes'], kv['ga4_sessoes_anterior']);
    const revenue = parseYoYMetric(kv['ga4_receita'], kv['ga4_receita_anterior']);
    const transactions = parseYoYMetric(kv['ga4_transacoes'], kv['ga4_transacoes_anterior']);
    
    // Calculate Conversion Rate if missing
    let conversionRate = parseYoYMetric(kv['ga4_taxa_conversao'], kv['ga4_taxa_conversao_anterior']);
    if (conversionRate.current === 0 && sessions.current > 0 && transactions.current > 0) {
      conversionRate.current = (transactions.current / sessions.current) * 100;
      conversionRate.previous = sessions.previous > 0 ? (transactions.previous / sessions.previous) * 100 : 0;
      conversionRate.variation = calculateVariation(conversionRate.current, conversionRate.previous);
    }

    // Calculate Avg Ticket if missing
    let avgTicket = parseYoYMetric(kv['ga4_ticket_medio'], kv['ga4_ticket_medio_anterior']);
    if (avgTicket.current === 0 && transactions.current > 0) {
      avgTicket.current = revenue.current / transactions.current;
      avgTicket.previous = transactions.previous > 0 ? revenue.previous / transactions.previous : 0;
      avgTicket.variation = calculateVariation(avgTicket.current, avgTicket.previous);
    }

    result.ga4 = {
      sessions,
      users: parseYoYMetric(kv['ga4_usuarios'], kv['ga4_usuarios_anterior']),
      transactions,
      revenue,
      conversionRate,
      avgTicket,
    };
  }
  
  // ── E-commerce platforms (detecção genérica por ordem de prioridade) ─────────
  // Adicionar novas plataformas aqui — o parser detecta automaticamente
  // se o export string contiver os campos {prefix}_receita ou {prefix}_pedidos
  const ECOMMERCE_PLATFORMS = [
    { key: 'vtex',        label: 'VTEX' },
    { key: 'shopify',     label: 'Shopify' },
    { key: 'magento',     label: 'Magento' },
    { key: 'tray',        label: 'Tray' },
    { key: 'nuvemshop',   label: 'Nuvemshop' },
    { key: 'woocommerce', label: 'WooCommerce' },
    { key: 'loja',        label: 'Loja Virtual' },
  ];

  result.ecommercePlatforms = [];

  for (const platform of ECOMMERCE_PLATFORMS) {
    const revenueKey = `${platform.key}_receita`;
    const ordersKey  = `${platform.key}_pedidos`;
    if (!kv[revenueKey] && !kv[ordersKey]) continue;

    const revenue = parseYoYMetric(kv[revenueKey], kv[`${revenueKey}_anterior`]);
    const orders  = parseYoYMetric(kv[ordersKey],  kv[`${ordersKey}_anterior`]);

    let avgTicket = parseYoYMetric(kv[`${platform.key}_ticket_medio`], kv[`${platform.key}_ticket_medio_anterior`]);
    if (avgTicket.current === 0 && orders.current > 0) {
      avgTicket.current  = revenue.current / orders.current;
      avgTicket.previous = orders.previous > 0 ? revenue.previous / orders.previous : 0;
      avgTicket.variation = calculateVariation(avgTicket.current, avgTicket.previous);
    }

    result.ecommercePlatforms.push({ name: platform.key, label: platform.label, revenue, orders, avgTicket });

    // Mantém compatibilidade com campo vtex legado
    if (platform.key === 'vtex') {
      result.vtex = { revenue, orders, avgTicket };
    }
  }

  // Restaura campanhas_top10
  if (kv['campanhas_top10']) {
    const rawCampaigns = kv['campanhas_top10'].split('||');
    result.campaigns = rawCampaigns.map(item => {
      const pMap: Record<string, string> = {};
      const parts = item.split('|');
      
      parts.forEach(p => {
        const colonIdx = p.indexOf(':');
        if (colonIdx !== -1) {
          const k = p.substring(0, colonIdx).trim();
          const v = p.substring(colonIdx + 1).trim();
          pMap[k] = v;
        }
      });

      const investment = parseSingleNumber(pMap['i']);
      const revenue = parseSingleNumber(pMap['re']);
      const conversions = parseSingleNumber(pMap['co']);

      return {
        name: pMap['c'] || 'Campanha Desconhecida',
        source: pMap['src'] || pMap['p'] || 'Auto',
        investment,
        impressions: parseSingleNumber(pMap['im']),
        clicks: parseSingleNumber(pMap['cl']),
        conversions,
        revenue,
        roas: parseSingleNumber(pMap['ro']),
        cpa: parseSingleNumber(pMap['cp'])
      };
    }).filter(c => c.investment > 0 || c.revenue > 0);
  }

  return result;
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const formatNumber = (val: number) => {
  return new Intl.NumberFormat('pt-BR').format(val);
};
