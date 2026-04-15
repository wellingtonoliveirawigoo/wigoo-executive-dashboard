import { ClientConfig } from './types';

export const serasaPmeClient: ClientConfig = {
  id: 'serasa_pme',
  name: 'Serasa PME',
  slug: 'serasa',
  datasetId: '447f0614-34ff-42e8-953f-ad12901616f8',
  workspaceId: '63631127-88f7-44b2-98e6-0b24bff00d60',
  measuresTable: 'MedidasCalculadas',
  performanceDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// ── Investimento por canal ──────────────────────────────────────────────────
VAR _meta_inv   = CALCULATE(SUM('facebook_campaign_serasa_pme'[spend]))
VAR _meta_imp   = CALCULATE(SUM('facebook_campaign_serasa_pme'[impressions]))
VAR _meta_clk   = CALCULATE(SUM('facebook_campaign_serasa_pme'[clicks]))

VAR _google_inv = CALCULATE(SUM('googleads_campanha_serasa_pme'[metrics_cost]))
VAR _google_imp = CALCULATE(SUM('googleads_campanha_serasa_pme'[metrics_impressions]))
VAR _google_clk = CALCULATE(SUM('googleads_campanha_serasa_pme'[metrics_clicks]))

VAR _tiktok_inv = CALCULATE(SUM('tiktokads_reports_campaign_report_serasa'[spend]))
VAR _tiktok_imp = CALCULATE(SUM('tiktokads_reports_campaign_report_serasa'[impressions]))
VAR _tiktok_clk = CALCULATE(SUM('tiktokads_reports_campaign_report_serasa'[clicks]))

VAR _ms_inv     = CALCULATE(SUM('microsoftsads_campaignperformance_serasa'[spend]))
VAR _ms_imp     = CALCULATE(SUM('microsoftsads_campaignperformance_serasa'[impressions]))
VAR _ms_clk     = CALCULATE(SUM('microsoftsads_campaignperformance_serasa'[clicks]))

// ── Totais de mídia ─────────────────────────────────────────────────────────
VAR _inv_total = _meta_inv + _google_inv + _tiktok_inv + _ms_inv
VAR _imp_total = _meta_imp + _google_imp + _tiktok_imp + _ms_imp
VAR _clk_total = _meta_clk + _google_clk + _tiktok_clk + _ms_clk
VAR _ctr       = IF(_imp_total > 0, DIVIDE(_clk_total, _imp_total) * 100, 0)

// ── Portal B2B — fonte de verdade para conversões e receita ─────────────────
VAR _conv    = CALCULATE(SUM('B2B - Portal PME Sem Device'[Pedidos Pagos]))
VAR _receita = CALCULATE(SUM('B2B - Portal PME Sem Device'[Receita Total]))
VAR _sessoes = CALCULATE(SUM('B2B - Portal PME Sem Device'[Visits]))

// ── Métricas derivadas ───────────────────────────────────────────────────────
VAR _cpa  = IF(_conv > 0, DIVIDE(_inv_total, _conv), 0)
VAR _roas = IF(_inv_total > 0, DIVIDE(_receita, _inv_total), 0)

// ── Top 10 Campanhas (todas as plataformas) ─────────────────────────────────
VAR _meta_camp =
    SELECTCOLUMNS(
        TOPN(4, ADDCOLUMNS(
            SUMMARIZE('facebook_campaign_serasa_pme', 'facebook_campaign_serasa_pme'[campaign_name]),
            "inv", CALCULATE(SUM('facebook_campaign_serasa_pme'[spend])),
            "imp", CALCULATE(SUM('facebook_campaign_serasa_pme'[impressions])),
            "clk", CALCULATE(SUM('facebook_campaign_serasa_pme'[clicks]))
        ), [inv], DESC),
        "nome", 'facebook_campaign_serasa_pme'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _google_camp =
    SELECTCOLUMNS(
        TOPN(3, ADDCOLUMNS(
            SUMMARIZE('googleads_campanha_serasa_pme', 'googleads_campanha_serasa_pme'[campaign_name]),
            "inv", CALCULATE(SUM('googleads_campanha_serasa_pme'[metrics_cost])),
            "imp", CALCULATE(SUM('googleads_campanha_serasa_pme'[metrics_impressions])),
            "clk", CALCULATE(SUM('googleads_campanha_serasa_pme'[metrics_clicks]))
        ), [inv], DESC),
        "nome", 'googleads_campanha_serasa_pme'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _ms_camp =
    SELECTCOLUMNS(
        TOPN(2, ADDCOLUMNS(
            SUMMARIZE('microsoftsads_campaignperformance_serasa', 'microsoftsads_campaignperformance_serasa'[campaign_name]),
            "inv", CALCULATE(SUM('microsoftsads_campaignperformance_serasa'[spend])),
            "imp", CALCULATE(SUM('microsoftsads_campaignperformance_serasa'[impressions])),
            "clk", CALCULATE(SUM('microsoftsads_campaignperformance_serasa'[clicks]))
        ), [inv], DESC),
        "nome", 'microsoftsads_campaignperformance_serasa'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _tiktok_camp =
    SELECTCOLUMNS(
        TOPN(1, ADDCOLUMNS(
            SUMMARIZE('tiktokads_reports_campaign_report_serasa', 'tiktokads_reports_campaign_report_serasa'[campaign_name]),
            "inv", CALCULATE(SUM('tiktokads_reports_campaign_report_serasa'[spend])),
            "imp", CALCULATE(SUM('tiktokads_reports_campaign_report_serasa'[impressions])),
            "clk", CALCULATE(SUM('tiktokads_reports_campaign_report_serasa'[clicks]))
        ), [inv], DESC),
        "nome", 'tiktokads_reports_campaign_report_serasa'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _all_camp = TOPN(10, UNION(_meta_camp, _google_camp, _ms_camp, _tiktok_camp), [inv], DESC)

// ── Construção da String de Export ───────────────────────────────────────────
VAR _StringBase =
    "EXPORT_MOM_SERASA_PME" &
    ";;periodo_inicio=" & _Inicio &
    ";;periodo_fim=" & _Fim &
    ";;investimento=" & _inv_total &
    ";;investimento_anterior=0" &
    ";;impressoes=" & _imp_total &
    ";;impressoes_anterior=0" &
    ";;cliques=" & _clk_total &
    ";;cliques_anterior=0" &
    ";;ctr=" & _ctr &
    ";;ctr_anterior=0" &
    ";;conversoes=" & _conv &
    ";;conversoes_anterior=0" &
    ";;cpa=" & _cpa &
    ";;cpa_anterior=0" &
    ";;receita=" & _receita &
    ";;receita_anterior=0" &
    ";;roas=" & _roas &
    ";;roas_anterior=0" &

    IF(_meta_inv > 0,
        ";;meta_investimento=" & _meta_inv &
        ";;meta_investimento_anterior=0" &
        ";;meta_impressoes=" & _meta_imp &
        ";;meta_impressoes_anterior=0" &
        ";;meta_cliques=" & _meta_clk &
        ";;meta_cliques_anterior=0" &
        ";;meta_receita=0" &
        ";;meta_receita_anterior=0", "") &

    IF(_google_inv > 0,
        ";;google_investimento=" & _google_inv &
        ";;google_investimento_anterior=0" &
        ";;google_impressoes=" & _google_imp &
        ";;google_impressoes_anterior=0" &
        ";;google_cliques=" & _google_clk &
        ";;google_cliques_anterior=0" &
        ";;google_receita=0" &
        ";;google_receita_anterior=0", "") &

    IF(_tiktok_inv > 0,
        ";;tiktok_investimento=" & _tiktok_inv &
        ";;tiktok_investimento_anterior=0" &
        ";;tiktok_impressoes=" & _tiktok_imp &
        ";;tiktok_impressoes_anterior=0" &
        ";;tiktok_cliques=" & _tiktok_clk &
        ";;tiktok_cliques_anterior=0" &
        ";;tiktok_receita=0" &
        ";;tiktok_receita_anterior=0", "") &

    IF(_ms_inv > 0,
        ";;microsoft_investimento=" & _ms_inv &
        ";;microsoft_investimento_anterior=0" &
        ";;microsoft_impressoes=" & _ms_imp &
        ";;microsoft_impressoes_anterior=0" &
        ";;microsoft_cliques=" & _ms_clk &
        ";;microsoft_cliques_anterior=0" &
        ";;microsoft_receita=0" &
        ";;microsoft_receita_anterior=0", "") &

    ";;ga4_sessoes=" & _sessoes &
    ";;ga4_sessoes_anterior=0" &
    ";;ga4_usuarios=0" &
    ";;ga4_usuarios_anterior=0" &
    ";;ga4_transacoes=" & _conv &
    ";;ga4_transacoes_anterior=0" &
    ";;ga4_receita=" & _receita &
    ";;ga4_receita_anterior=0" &

    ";;campanhas_top10=" &
    CONCATENATEX(
        _all_camp,
        "c:" & [nome] &
        "|i:" & [inv] &
        "|im:" & [imp] &
        "|cl:" & [clk] &
        "|co:0|re:0|ro:0|cp:0",
        "||"
    ) &
    ";;END_EXPORT"

RETURN _StringBase`,
  creativeDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio    = "{{START_DATE_FORMATTED}}"
VAR _Fim       = "{{END_DATE_FORMATTED}}"
VAR _StartDate = {{START_DATE_DAX}}
VAR _EndDate   = {{END_DATE_DAX}}

// --- M-1 (período anterior injetado pelo frontend) ---
VAR _PrevStart = {{PREV_START_DATE}}
VAR _PrevEnd   = {{PREV_END_DATE}}

// facebook_ads_serasa_pme não tem relacionamento com dCalendario —
// filtramos diretamente por metric_date para garantir o período correto
VAR _AdList =
    DISTINCT(SELECTCOLUMNS(
        FILTER('facebook_ads_serasa_pme',
            'facebook_ads_serasa_pme'[metric_date] >= _StartDate &&
            'facebook_ads_serasa_pme'[metric_date] <= _EndDate
        ),
        "ad_id",   'facebook_ads_serasa_pme'[ad_id],
        "ad_name", 'facebook_ads_serasa_pme'[ad_name]
    ))

VAR _CreativeTable =
    FILTER(
        GENERATE(
            _AdList,
            VAR _CurrentAdId = [ad_id]
            RETURN
                CALCULATETABLE(
                    ROW(
                        "Invest",    SUM('facebook_ads_serasa_pme'[spend]),
                        "InvestAnt", CALCULATE(SUM('facebook_ads_serasa_pme'[spend]),
                                        'facebook_ads_serasa_pme'[metric_date] >= _PrevStart,
                                        'facebook_ads_serasa_pme'[metric_date] <= _PrevEnd),
                        "Impres",    SUM('facebook_ads_serasa_pme'[impressions]),
                        "ImpresAnt", CALCULATE(SUM('facebook_ads_serasa_pme'[impressions]),
                                        'facebook_ads_serasa_pme'[metric_date] >= _PrevStart,
                                        'facebook_ads_serasa_pme'[metric_date] <= _PrevEnd),
                        "Clicks",    SUM('facebook_ads_serasa_pme'[inline_link_clicks]),
                        "ClicksAnt", CALCULATE(SUM('facebook_ads_serasa_pme'[inline_link_clicks]),
                                        'facebook_ads_serasa_pme'[metric_date] >= _PrevStart,
                                        'facebook_ads_serasa_pme'[metric_date] <= _PrevEnd),
                        "DifCriativo", DATEDIFF(MIN('facebook_ads_serasa_pme'[metric_date]), MAX('facebook_ads_serasa_pme'[metric_date]), DAY) + 1,
                        "thumbnail_url", LOOKUPVALUE('facebook_ads_DETAILS_serasa_pme'[creative_thumbnail_url], 'facebook_ads_DETAILS_serasa_pme'[ad_id], _CurrentAdId)
                    ),
                    'facebook_ads_serasa_pme'[ad_id] = _CurrentAdId,
                    'facebook_ads_serasa_pme'[metric_date] >= _StartDate,
                    'facebook_ads_serasa_pme'[metric_date] <= _EndDate
                )
        ),
        [Invest] > 0
    )

VAR _FinalString =
    "EXPORT_CREATIVOS_FULL_MOM" &
    ";;plataforma=Meta Ads" &
    ";;periodo_inicio=" & _Inicio &
    ";;periodo_fim=" & _Fim &
    ";;detalhamento_criativos=" &
    CONCATENATEX(
        _CreativeTable,
        "n:" & [ad_name] &
        " | i:" & [Invest] &
        " | i_ant:" & [InvestAnt] &
        " | im:" & [Impres] &
        " | im_ant:" & [ImpresAnt] &
        " | cl:" & [Clicks] &
        " | cl_ant:" & [ClicksAnt] &
        " | dif_criativo:" & [DifCriativo] &
        " | url:" & [thumbnail_url],
        "||"
    ) &
    ";;END_EXPORT"
RETURN _FinalString`,
};
