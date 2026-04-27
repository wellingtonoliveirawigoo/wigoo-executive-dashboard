/**
 * BigQuery integration service.
 * Builds SQL queries, calls /api/bq, assembles the same EXPORT_MOM_* / EXPORT_CREATIVOS_*
 * string format expected by parsePbiExport — so no changes to the parser are needed.
 */

// ─── Helper ─────────────────────────────────────────────────────────────────

async function bqFetch(queries: string[]): Promise<Record<string, string>[][]> {
  const resp = await fetch('/api/bq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queries })
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`BQ API error ${resp.status}: ${txt}`);
  }

  const json = (await resp.json()) as { results: Record<string, string>[][] };
  return json.results;
}

function n(val: string | undefined | null): number {
  const v = parseFloat(val || '0');
  return isNaN(v) ? 0 : v;
}

function fmt(val: number): string {
  return val.toString();
}

// ─── Casa da Toalha ─────────────────────────────────────────────────────────

function casadatoalhaQueries(start: string, end: string) {
  return [
    // 0: Meta agregado
    `SELECT SUM(spend) AS invest, SUM(impressions) AS imp, SUM(inline_link_clicks) AS clk
     FROM \`power-bi-wigoo.CasaDaToalha.facebook_campaign_insights_casadatoalha\`
     WHERE metric_date BETWEEN '${start}' AND '${end}'`,

    // 1: Top 5 campanhas Meta
    `SELECT campaign_name, SUM(spend) AS inv, SUM(impressions) AS imp, SUM(inline_link_clicks) AS clk
     FROM \`power-bi-wigoo.CasaDaToalha.facebook_campaign_insights_casadatoalha\`
     WHERE metric_date BETWEEN '${start}' AND '${end}'
     GROUP BY campaign_name ORDER BY inv DESC LIMIT 5`,

    // 2: Google agregado
    `SELECT SUM(metrics_cost) AS invest, SUM(metrics_impressions) AS imp, SUM(metrics_clicks) AS clk
     FROM \`power-bi-wigoo.CasaDaToalha.googleads_custom_report_campanha_casadatoalha\`
     WHERE segments_date BETWEEN '${start}' AND '${end}'`,

    // 3: Top 5 campanhas Google
    `SELECT campaign_name, SUM(metrics_cost) AS inv, SUM(metrics_impressions) AS imp, SUM(metrics_clicks) AS clk
     FROM \`power-bi-wigoo.CasaDaToalha.googleads_custom_report_campanha_casadatoalha\`
     WHERE segments_date BETWEEN '${start}' AND '${end}'
     GROUP BY campaign_name ORDER BY inv DESC LIMIT 5`,

    // 4: GA4 (sessões/usuários/transações + atribuição por canal)
    `SELECT SUM(totalrevenue) AS revenue, SUM(sessions) AS sessions,
            SUM(totalusers) AS users, SUM(transactions) AS transactions,
            SUM(CASE WHEN LOWER(sessionsourcemedium) LIKE '%meta%'
                          OR LOWER(sessionsourcemedium) LIKE '%facebook%'
                          OR LOWER(sessionsourcemedium) LIKE '%ig /%'
                          OR LOWER(sessionsourcemedium) LIKE '%instagram%'
                     THEN totalrevenue ELSE 0 END) AS meta_rev,
            SUM(CASE WHEN LOWER(sessionsourcemedium) LIKE '%google%'
                     THEN totalrevenue ELSE 0 END) AS google_rev
     FROM \`power-bi-wigoo.CasaDaToalha.ga4_custom_report_origem_casadatoalha\`
     WHERE date BETWEEN '${start}' AND '${end}'`,

    // 5: Shopify — fonte primária de receita (Prioridade 1)
    `SELECT COUNT(*) AS orders, SUM(total_price) AS revenue
     FROM \`power-bi-wigoo.CasaDaToalha.shopify_orders_casadatoalha\`
     WHERE DATE(processed_at) BETWEEN '${start}' AND '${end}'
       AND UPPER(financial_status) = 'PAID'`
  ];
}

function casadatoalhaCreativeQueries(start: string, end: string, prevStart: string, prevEnd: string) {
  return [
    // 0: Criativos top 30 por spend (período atual)
    `SELECT a.ad_id, a.ad_name,
            SUM(a.spend) AS invest,
            SUM(a.impressions) AS imp,
            SUM(a.inline_link_clicks) AS clk,
            SUM(a.value_purchase) AS revenue,
            DATE_DIFF(MAX(a.metric_date), MIN(a.metric_date), DAY) + 1 AS days,
            d.creative_thumbnail_url AS url
     FROM \`power-bi-wigoo.CasaDaToalha.facebook_ad_insights_casadatoalha\` a
     LEFT JOIN (
       SELECT DISTINCT ad_id, creative_thumbnail_url
       FROM \`power-bi-wigoo.CasaDaToalha.facebook_ad_details_casadatoalha\`
       WHERE creative_thumbnail_url IS NOT NULL
     ) d ON a.ad_id = d.ad_id
     WHERE a.metric_date BETWEEN '${start}' AND '${end}'
       AND d.creative_thumbnail_url IS NOT NULL
     GROUP BY a.ad_id, a.ad_name, d.creative_thumbnail_url
     HAVING SUM(a.spend) > 0
     ORDER BY invest DESC LIMIT 30`,

    // 1: Período anterior para os mesmos anúncios (M-1)
    `SELECT a.ad_id,
            SUM(a.spend) AS invest_ant,
            SUM(a.impressions) AS imp_ant,
            SUM(a.inline_link_clicks) AS clk_ant
     FROM \`power-bi-wigoo.CasaDaToalha.facebook_ad_insights_casadatoalha\` a
     WHERE a.metric_date BETWEEN '${prevStart}' AND '${prevEnd}'
     GROUP BY a.ad_id`
  ];
}

// ─── String assembly ─────────────────────────────────────────────────────────

function buildPerformanceExport(
  clientTag: string,
  startFmt: string,
  endFmt: string,
  results: Record<string, string>[][]
): string {
  const [metaRows, metaCampRows, googleRows, googleCampRows, ga4Rows, shopifyRows] = results;

  const meta_inv   = n(metaRows[0]?.invest);
  const meta_imp   = n(metaRows[0]?.imp);
  const meta_clk   = n(metaRows[0]?.clk);
  const meta_rec   = n(ga4Rows[0]?.meta_rev);

  const google_inv = n(googleRows[0]?.invest);
  const google_imp = n(googleRows[0]?.imp);
  const google_clk = n(googleRows[0]?.clk);
  const google_rec = n(ga4Rows[0]?.google_rev);

  const ga4_sess   = n(ga4Rows[0]?.sessions);
  const ga4_users  = n(ga4Rows[0]?.users);
  const ga4_trans  = n(ga4Rows[0]?.transactions);
  const ga4_rec    = n(ga4Rows[0]?.revenue);

  // Shopify = Prioridade 1
  const shopify_orders  = n(shopifyRows[0]?.orders);
  const shopify_revenue = n(shopifyRows[0]?.revenue);

  const inv_total = meta_inv + google_inv;
  const rec_total = shopify_revenue > 0 ? shopify_revenue : ga4_rec;
  const imp_total = meta_imp + google_imp;
  const clk_total = meta_clk + google_clk;
  const ctr  = imp_total > 0 ? (clk_total / imp_total) * 100 : 0;
  const roas = inv_total > 0 ? rec_total / inv_total : 0;
  const cpa  = shopify_orders > 0 ? inv_total / shopify_orders : (ga4_trans > 0 ? inv_total / ga4_trans : 0);
  const conv = shopify_orders > 0 ? shopify_orders : ga4_trans;

  // Campanhas (Meta + Google combinadas, top 10 por invest)
  const allCamps = [
    ...metaCampRows.map(r => ({ nome: r.campaign_name, inv: n(r.inv), imp: n(r.imp), clk: n(r.clk), rec: 0 })),
    ...googleCampRows.map(r => ({ nome: r.campaign_name, inv: n(r.inv), imp: n(r.imp), clk: n(r.clk), rec: 0 }))
  ].sort((a, b) => b.inv - a.inv).slice(0, 10);

  const campsStr = allCamps
    .map(c => `c:${c.nome}|i:${fmt(c.inv)}|im:${fmt(c.imp)}|cl:${fmt(c.clk)}|co:0|re:${fmt(c.rec)}|ro:0|cp:0`)
    .join('||');

  let out = `${clientTag}` +
    `;;periodo_inicio=${startFmt}` +
    `;;periodo_fim=${endFmt}` +
    `;;investimento=${fmt(inv_total)}` +
    `;;investimento_anterior=0` +
    `;;impressoes=${fmt(imp_total)}` +
    `;;impressoes_anterior=0` +
    `;;cliques=${fmt(clk_total)}` +
    `;;cliques_anterior=0` +
    `;;ctr=${fmt(ctr)}` +
    `;;ctr_anterior=0` +
    `;;conversoes=${fmt(conv)}` +
    `;;conversoes_anterior=0` +
    `;;cpa=${fmt(cpa)}` +
    `;;cpa_anterior=0` +
    `;;receita=${fmt(rec_total)}` +
    `;;receita_anterior=0` +
    `;;roas=${fmt(roas)}` +
    `;;roas_anterior=0`;

  if (meta_inv > 0) {
    out += `;;meta_investimento=${fmt(meta_inv)}` +
      `;;meta_investimento_anterior=0` +
      `;;meta_impressoes=${fmt(meta_imp)}` +
      `;;meta_impressoes_anterior=0` +
      `;;meta_cliques=${fmt(meta_clk)}` +
      `;;meta_cliques_anterior=0` +
      `;;meta_receita=${fmt(meta_rec)}` +
      `;;meta_receita_anterior=0`;
  }

  if (google_inv > 0) {
    out += `;;google_investimento=${fmt(google_inv)}` +
      `;;google_investimento_anterior=0` +
      `;;google_impressoes=${fmt(google_imp)}` +
      `;;google_impressoes_anterior=0` +
      `;;google_cliques=${fmt(google_clk)}` +
      `;;google_cliques_anterior=0` +
      `;;google_receita=${fmt(google_rec)}` +
      `;;google_receita_anterior=0`;
  }

  out += `;;ga4_sessoes=${fmt(ga4_sess)}` +
    `;;ga4_sessoes_anterior=0` +
    `;;ga4_usuarios=${fmt(ga4_users)}` +
    `;;ga4_usuarios_anterior=0` +
    `;;ga4_transacoes=${fmt(ga4_trans)}` +
    `;;ga4_transacoes_anterior=0` +
    `;;ga4_receita=${fmt(ga4_rec)}` +
    `;;ga4_receita_anterior=0`;

  if (shopify_revenue > 0) {
    out += `;;shopify_receita=${fmt(shopify_revenue)}` +
      `;;shopify_receita_anterior=0` +
      `;;shopify_pedidos=${fmt(shopify_orders)}` +
      `;;shopify_pedidos_anterior=0`;
  }

  out += `;;campanhas_top10=${campsStr};;END_EXPORT`;

  return out;
}

function buildCreativeExport(
  startFmt: string,
  endFmt: string,
  results: Record<string, string>[][]
): string {
  const [currentRows, prevRows] = results;

  // Indexa período anterior por ad_id
  const prevMap: Record<string, Record<string, string>> = {};
  for (const row of prevRows) {
    if (row.ad_id) prevMap[row.ad_id] = row;
  }

  const creativeStr = currentRows.map(row => {
    const prev = prevMap[row.ad_id] || {};
    return `n:${row.ad_name}` +
      ` | i:${fmt(n(row.invest))}` +
      ` | i_ant:${fmt(n(prev.invest_ant))}` +
      ` | im:${fmt(n(row.imp))}` +
      ` | im_ant:${fmt(n(prev.imp_ant))}` +
      ` | cl:${fmt(n(row.clk))}` +
      ` | cl_ant:${fmt(n(prev.clk_ant))}` +
      ` | co:0` +
      ` | re:${fmt(n(row.revenue))}` +
      ` | dif_criativo:${fmt(n(row.days))}` +
      ` | url:${row.url}`;
  }).join('||');

  return `EXPORT_CREATIVOS_FULL_MOM` +
    `;;plataforma=Meta Ads` +
    `;;periodo_inicio=${startFmt}` +
    `;;periodo_fim=${endFmt}` +
    `;;detalhamento_criativos=${creativeStr}` +
    `;;END_EXPORT`;
}

// ─── Casa da Toalha — Análise Geográfica ────────────────────────────────────

function casadatoalhaGeoQueries(start: string, end: string) {
  return [
    // 0: Vendas por estado (Shopify)
    `SELECT
       COALESCE(
         NULLIF(TRIM(shipping_address_province), ''),
         NULLIF(TRIM(billing_address_province), ''),
         'Não informado'
       ) AS estado,
       COUNT(*) AS pedidos,
       SUM(total_price) AS receita,
       AVG(total_price) AS ticket_medio
     FROM \`power-bi-wigoo.CasaDaToalha.shopify_orders_casadatoalha\`
     WHERE DATE(processed_at) BETWEEN '${start}' AND '${end}'
       AND UPPER(financial_status) = 'PAID'
     GROUP BY estado
     ORDER BY receita DESC
     LIMIT 30`,

    // 1: Campanhas Meta por período
    `SELECT
       campaign_name,
       SUM(spend) AS inv,
       SUM(impressions) AS imp,
       SUM(inline_link_clicks) AS clk,
       SUM(value_purchase) AS receita,
       SAFE_DIVIDE(SUM(spend), SUM(value_purchase)) AS roas
     FROM \`power-bi-wigoo.CasaDaToalha.facebook_campaign_insights_casadatoalha\`
     WHERE metric_date BETWEEN '${start}' AND '${end}'
       AND spend > 0
     GROUP BY campaign_name
     ORDER BY inv DESC
     LIMIT 20`,

    // 2: Totais do período (resumo)
    `SELECT
       COUNT(*) AS total_pedidos,
       SUM(total_price) AS total_receita,
       AVG(total_price) AS ticket_medio
     FROM \`power-bi-wigoo.CasaDaToalha.shopify_orders_casadatoalha\`
     WHERE DATE(processed_at) BETWEEN '${start}' AND '${end}'
       AND UPPER(financial_status) = 'PAID'`,

    // 3: Pedidos por dia (série temporal para sparkline)
    `SELECT
       DATE(processed_at) AS dia,
       COUNT(*) AS pedidos,
       SUM(total_price) AS receita
     FROM \`power-bi-wigoo.CasaDaToalha.shopify_orders_casadatoalha\`
     WHERE DATE(processed_at) BETWEEN '${start}' AND '${end}'
       AND UPPER(financial_status) = 'PAID'
     GROUP BY dia
     ORDER BY dia`
  ];
}

export interface GeoStateData {
  estado: string;
  pedidos: number;
  receita: number;
  ticketMedio: number;
}

export interface GeoCampaignData {
  nome: string;
  inv: number;
  imp: number;
  clk: number;
  receita: number;
  roas: number;
}

export interface GeoAnalysisResult {
  states: GeoStateData[];
  campaigns: GeoCampaignData[];
  totalPedidos: number;
  totalReceita: number;
  ticketMedio: number;
  dailySeries: { dia: string; pedidos: number; receita: number }[];
  periodStart: string;
  periodEnd: string;
}

export async function executeBigQueryGeoQuery(
  startDate: string,
  endDate: string
): Promise<GeoAnalysisResult> {
  const DATE_RE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
    throw new Error('Datas inválidas. Formato esperado: YYYY-MM-DD');
  }

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  const results = await bqFetch(casadatoalhaGeoQueries(startDate, endDate));
  const [stateRows, campaignRows, totalRows, dailyRows] = results;

  return {
    states: stateRows.map(r => ({
      estado: r.estado || 'Não informado',
      pedidos: n(r.pedidos),
      receita: n(r.receita),
      ticketMedio: n(r.ticket_medio),
    })),
    campaigns: campaignRows.map(r => ({
      nome: r.campaign_name || '',
      inv: n(r.inv),
      imp: n(r.imp),
      clk: n(r.clk),
      receita: n(r.receita),
      roas: n(r.roas),
    })),
    totalPedidos: n(totalRows[0]?.total_pedidos),
    totalReceita: n(totalRows[0]?.total_receita),
    ticketMedio: n(totalRows[0]?.ticket_medio),
    dailySeries: dailyRows.map(r => ({
      dia: r.dia || '',
      pedidos: n(r.pedidos),
      receita: n(r.receita),
    })),
    periodStart: fmtDate(startDate),
    periodEnd: fmtDate(endDate),
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function executeBigQueryQuery(
  clientId: string,
  startDate: string,
  endDate: string,
  mode: 'performance' | 'creative'
): Promise<string> {
  const DATE_RE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
    throw new Error('Datas inválidas. Formato esperado: YYYY-MM-DD');
  }
  if (startDate > endDate) {
    throw new Error('Data de início não pode ser posterior à data de fim');
  }
  // Format dates for display (dd/MM/yyyy)
  const fmt = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };
  const startFmt = fmt(startDate);
  const endFmt = fmt(endDate);

  // Previous year (YoY) for creative M-1
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  const prevStartObj = new Date(startObj);
  prevStartObj.setFullYear(prevStartObj.getFullYear() - 1);
  const prevEndObj = new Date(endObj);
  prevEndObj.setFullYear(prevEndObj.getFullYear() - 1);
  const prevStart = prevStartObj.toISOString().split('T')[0];
  const prevEnd = prevEndObj.toISOString().split('T')[0];

  if (clientId === 'casadatoalha') {
    if (mode === 'performance') {
      const results = await bqFetch(casadatoalhaQueries(startDate, endDate));
      return buildPerformanceExport('EXPORT_MOM_CASADATOALHA', startFmt, endFmt, results);
    } else {
      const results = await bqFetch(casadatoalhaCreativeQueries(startDate, endDate, prevStart, prevEnd));
      return buildCreativeExport(startFmt, endFmt, results);
    }
  }

  throw new Error(`BigQuery not configured for client: ${clientId}`);
}
