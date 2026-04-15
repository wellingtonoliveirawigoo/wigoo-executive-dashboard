import { PerformanceDaxConfig } from './types';

/**
 * Gera a DAX de performance padrão (cobre ~90% dos clientes Wigoo).
 *
 * Tabelas esperadas no dataset Power BI:
 *   fb_campanhas, google_ads_campanhas, GA4_Origem, dCalendario
 *   (opcional) tiktokAds — habilitar com hasTikTok: true
 *
 * Para clientes com schema diferente (C&A, Serasa PME), manter DAX literal
 * no arquivo de configuração do cliente.
 */
export function buildPerformanceDax(cfg: PerformanceDaxConfig): string {
  const recTotal = cfg.revenueMode === 'ga4_channel'
    ? '_meta_rec + _google_rec'
    : '_ga4_rec';

  return `
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim    = "{{END_DATE_FORMATTED}}"

// ── Meta Ads ─────────────────────────────────────────────────────────────────
VAR _meta_inv = CALCULATE(SUM('fb_campanhas'[spend]))
VAR _meta_imp = CALCULATE(SUM('fb_campanhas'[impressions]))
VAR _meta_clk = CALCULATE(SUM('fb_campanhas'[inline_link_clicks]))
VAR _meta_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Meta Ads")

// ── Google Ads ────────────────────────────────────────────────────────────────
VAR _google_inv = CALCULATE(SUM('google_ads_campanhas'[metrics_cost]))
VAR _google_imp = CALCULATE(SUM('google_ads_campanhas'[metrics_impressions]))
VAR _google_clk = CALCULATE(SUM('google_ads_campanhas'[metrics_clicks]))
VAR _google_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Google Ads")
${cfg.hasTikTok ? `
// ── TikTok Ads ────────────────────────────────────────────────────────────────
VAR _tiktok_inv = CALCULATE(SUM('tiktokAds'[spend]))
VAR _tiktok_imp = CALCULATE(SUM('tiktokAds'[impressions]))
VAR _tiktok_clk = CALCULATE(SUM('tiktokAds'[clicks]))
` : ''}
// ── GA4 Global ────────────────────────────────────────────────────────────────
VAR _ga4_rec   = CALCULATE(SUM('GA4_Origem'[totalrevenue]))
VAR _ga4_sess  = CALCULATE(SUM('GA4_Origem'[sessions]))
VAR _ga4_users = CALCULATE(SUM('GA4_Origem'[totalusers]))
VAR _ga4_trans = CALCULATE(SUM('GA4_Origem'[transactions]))

// ── Totais ────────────────────────────────────────────────────────────────────
VAR _inv_total = _meta_inv + _google_inv${cfg.hasTikTok ? ' + _tiktok_inv' : ''}
VAR _rec_total = ${recTotal}
VAR _imp_total = _meta_imp + _google_imp${cfg.hasTikTok ? ' + _tiktok_imp' : ''}
VAR _clk_total = _meta_clk + _google_clk${cfg.hasTikTok ? ' + _tiktok_clk' : ''}
VAR _ctr  = IF(_imp_total > 0, DIVIDE(_clk_total, _imp_total) * 100, 0)
VAR _roas = IF(_inv_total > 0, DIVIDE(_rec_total, _inv_total), 0)
VAR _cpa  = IF(_ga4_trans > 0, DIVIDE(_inv_total, _ga4_trans), 0)

// ── Top 10 Campanhas ──────────────────────────────────────────────────────────
VAR _meta_camp =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('fb_campanhas', 'fb_campanhas'[campaign_name]),
            "inv", CALCULATE(SUM('fb_campanhas'[spend])),
            "imp", CALCULATE(SUM('fb_campanhas'[impressions])),
            "clk", CALCULATE(SUM('fb_campanhas'[inline_link_clicks])),
            "rec", CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Meta Ads")
        ), [inv], DESC),
        "nome", 'fb_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk], "rec", [rec])

VAR _google_camp =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('google_ads_campanhas', 'google_ads_campanhas'[campaign_name]),
            "inv", CALCULATE(SUM('google_ads_campanhas'[metrics_cost])),
            "imp", CALCULATE(SUM('google_ads_campanhas'[metrics_impressions])),
            "clk", CALCULATE(SUM('google_ads_campanhas'[metrics_clicks])),
            "rec", CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Google Ads")
        ), [inv], DESC),
        "nome", 'google_ads_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk], "rec", [rec])

VAR _all_camp = TOPN(10, UNION(_meta_camp, _google_camp), [inv], DESC)

// ── String de exportação ──────────────────────────────────────────────────────
VAR _StringBase =
    "${cfg.exportTag}" &
    ";;periodo_inicio=" & _Inicio & ";;periodo_fim=" & _Fim &
    ";;investimento=" & _inv_total & ";;investimento_anterior=0" &
    ";;impressoes=" & _imp_total & ";;impressoes_anterior=0" &
    ";;cliques=" & _clk_total & ";;cliques_anterior=0" &
    ";;ctr=" & _ctr & ";;ctr_anterior=0" &
    ";;conversoes=" & _ga4_trans & ";;conversoes_anterior=0" &
    ";;cpa=" & _cpa & ";;cpa_anterior=0" &
    ";;receita=" & _rec_total & ";;receita_anterior=0" &
    ";;roas=" & _roas & ";;roas_anterior=0" &
    IF(_meta_inv > 0,
        ";;meta_investimento=" & _meta_inv & ";;meta_investimento_anterior=0" &
        ";;meta_impressoes=" & _meta_imp & ";;meta_impressoes_anterior=0" &
        ";;meta_cliques=" & _meta_clk & ";;meta_cliques_anterior=0" &
        ";;meta_receita=" & _meta_rec & ";;meta_receita_anterior=0", "") &
    IF(_google_inv > 0,
        ";;google_investimento=" & _google_inv & ";;google_investimento_anterior=0" &
        ";;google_impressoes=" & _google_imp & ";;google_impressoes_anterior=0" &
        ";;google_cliques=" & _google_clk & ";;google_cliques_anterior=0" &
        ";;google_receita=" & _google_rec & ";;google_receita_anterior=0", "") &${cfg.hasTikTok ? `
    IF(_tiktok_inv > 0,
        ";;tiktok_investimento=" & _tiktok_inv & ";;tiktok_investimento_anterior=0" &
        ";;tiktok_impressoes=" & _tiktok_imp & ";;tiktok_impressoes_anterior=0" &
        ";;tiktok_cliques=" & _tiktok_clk & ";;tiktok_cliques_anterior=0" &
        ";;tiktok_receita=0;;tiktok_receita_anterior=0", "") &` : ''}
    ";;ga4_sessoes=" & _ga4_sess & ";;ga4_sessoes_anterior=0" &
    ";;ga4_usuarios=" & _ga4_users & ";;ga4_usuarios_anterior=0" &
    ";;ga4_transacoes=" & _ga4_trans & ";;ga4_transacoes_anterior=0" &
    ";;ga4_receita=" & _ga4_rec & ";;ga4_receita_anterior=0" &
    ";;campanhas_top10=" &
    CONCATENATEX(_all_camp,
        "c:" & [nome] & "|i:" & [inv] & "|im:" & [imp] & "|cl:" & [clk] &
        "|co:0|re:" & [rec] & "|ro:0|cp:0", "||") &
    ";;END_EXPORT"

RETURN _StringBase`;
}
