import { ClientConfig } from './types';
import { buildCreativeDax } from '../dax/creative';

export const redeamericasClient: ClientConfig = {
  id: 'redeamericas',
  name: 'Rede Américas',
  slug: 'rede-americas',
  datasetId: 'd176aa0e-a825-4f80-a3c3-0508e615fe17',
  workspaceId: '4df52fd1-0c33-4081-b331-d439b336cf7d',
  measuresTable: 'facebook_ad_insights_hospital',
  calendarTable: 'dCalendario.date',
  performanceDax: `
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim    = "{{END_DATE_FORMATTED}}"

// ── Meta Ads ─────────────────────────────────────────────────────────────────
VAR _meta_inv  = CALCULATE(SUM('facebook_ad_insights_hospital'[spend]))
VAR _meta_imp  = CALCULATE(SUM('facebook_ad_insights_hospital'[impressions]))
VAR _meta_clk  = CALCULATE(SUM('facebook_ad_insights_hospital'[inline_link_clicks]))
VAR _meta_conv = CALCULATE(SUM('facebook_ad_insights_hospital'[a_call_confirm_grouped]))

// ── Google Ads ────────────────────────────────────────────────────────────────
VAR _google_inv = CALCULATE(SUM('googleads_custom_report_campanhas'[metrics_cost]))
VAR _google_imp = CALCULATE(SUM('googleads_custom_report_campanhas'[metrics_impressions]))
VAR _google_clk = CALCULATE(SUM('googleads_custom_report_campanhas'[metrics_clicks]))

// ── Totais ────────────────────────────────────────────────────────────────────
VAR _inv_total  = _meta_inv + _google_inv
VAR _imp_total  = _meta_imp + _google_imp
VAR _clk_total  = _meta_clk + _google_clk
VAR _conv_total = _meta_conv
VAR _ctr  = IF(_imp_total > 0, DIVIDE(_clk_total, _imp_total) * 100, 0)
VAR _cpa  = IF(_conv_total > 0, DIVIDE(_inv_total, _conv_total), 0)

// ── Top 10 Campanhas ──────────────────────────────────────────────────────────
VAR _meta_camp =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('facebook_ad_insights_hospital', 'facebook_ad_insights_hospital'[campaign_name]),
            "inv", CALCULATE(SUM('facebook_ad_insights_hospital'[spend])),
            "imp", CALCULATE(SUM('facebook_ad_insights_hospital'[impressions])),
            "clk", CALCULATE(SUM('facebook_ad_insights_hospital'[inline_link_clicks])),
            "rec", 0
        ), [inv], DESC),
        "nome", 'facebook_ad_insights_hospital'[campaign_name],
        "inv", [inv], "imp", [imp], "clk", [clk], "rec", [rec])

VAR _google_camp =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('googleads_custom_report_campanhas', 'googleads_custom_report_campanhas'[campaign_name]),
            "inv", CALCULATE(SUM('googleads_custom_report_campanhas'[metrics_cost])),
            "imp", CALCULATE(SUM('googleads_custom_report_campanhas'[metrics_impressions])),
            "clk", CALCULATE(SUM('googleads_custom_report_campanhas'[metrics_clicks])),
            "rec", 0
        ), [inv], DESC),
        "nome", 'googleads_custom_report_campanhas'[campaign_name],
        "inv", [inv], "imp", [imp], "clk", [clk], "rec", [rec])

VAR _all_camp = TOPN(10, UNION(_meta_camp, _google_camp), [inv], DESC)

// ── String de exportação ──────────────────────────────────────────────────────
VAR _StringBase =
    "EXPORT_MOM_REDEAMERICAS" &
    ";;periodo_inicio=" & _Inicio & ";;periodo_fim=" & _Fim &
    ";;investimento=" & _inv_total & ";;investimento_anterior=0" &
    ";;impressoes=" & _imp_total & ";;impressoes_anterior=0" &
    ";;cliques=" & _clk_total & ";;cliques_anterior=0" &
    ";;ctr=" & _ctr & ";;ctr_anterior=0" &
    ";;conversoes=" & _conv_total & ";;conversoes_anterior=0" &
    ";;cpa=" & _cpa & ";;cpa_anterior=0" &
    ";;receita=0;;receita_anterior=0" &
    ";;roas=0;;roas_anterior=0" &
    IF(_meta_inv > 0,
        ";;meta_investimento=" & _meta_inv & ";;meta_investimento_anterior=0" &
        ";;meta_impressoes=" & _meta_imp & ";;meta_impressoes_anterior=0" &
        ";;meta_cliques=" & _meta_clk & ";;meta_cliques_anterior=0" &
        ";;meta_receita=0;;meta_receita_anterior=0", "") &
    IF(_google_inv > 0,
        ";;google_investimento=" & _google_inv & ";;google_investimento_anterior=0" &
        ";;google_impressoes=" & _google_imp & ";;google_impressoes_anterior=0" &
        ";;google_cliques=" & _google_clk & ";;google_cliques_anterior=0" &
        ";;google_receita=0;;google_receita_anterior=0", "") &
    ";;ga4_sessoes=0;;ga4_sessoes_anterior=0" &
    ";;ga4_usuarios=0;;ga4_usuarios_anterior=0" &
    ";;ga4_transacoes=0;;ga4_transacoes_anterior=0" &
    ";;ga4_receita=0;;ga4_receita_anterior=0" &
    ";;campanhas_top10=" &
    CONCATENATEX(_all_camp,
        "c:" & [nome] & "|i:" & [inv] & "|im:" & [imp] & "|cl:" & [clk] &
        "|co:0|re:" & [rec] & "|ro:0|cp:0", "||") &
    ";;END_EXPORT"

RETURN _StringBase`,
  creativeDax: buildCreativeDax(),
};
