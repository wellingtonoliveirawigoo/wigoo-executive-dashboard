import { ClientConfig } from './types';

export const ceaClient: ClientConfig = {
  id: 'cea',
  name: 'C&A',
  slug: 'cea',
  datasetId: '4269623c-ac5a-480f-82a9-c887fbbd781d',
  workspaceId: '40937ccd-cffb-4f55-9029-e96472719963',
  measuresTable: '_Medidas',
  // Tabela e coluna de data do modelo C&A (diferente do padrão 'dCalendario.Date')
  calendarTable: 'd_calendario.data',
  performanceDax: `
// DAX C&A — tabelas: f_performance_midia, f_ga4_performance, v_d_campanha, d_calendario
// O filtro de datas é aplicado externamente via d_calendario[data] pelo powerbi.ts
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim    = "{{END_DATE_FORMATTED}}"

// ── Mídia (f_performance_midia) ───────────────────────────────────────────────
VAR _meta_inv   = CALCULATE(SUM('f_performance_midia'[custo]),     'f_performance_midia'[canal] = "Meta Ads")
VAR _meta_imp   = CALCULATE(SUM('f_performance_midia'[impressoes]),'f_performance_midia'[canal] = "Meta Ads")
VAR _meta_clk   = CALCULATE(SUM('f_performance_midia'[cliques]),   'f_performance_midia'[canal] = "Meta Ads")
VAR _meta_conv  = CALCULATE(SUM('f_performance_midia'[conversoes]),'f_performance_midia'[canal] = "Meta Ads")
VAR _meta_rec   = CALCULATE(SUM('f_ga4_performance'[receita_ga4]), 'f_ga4_performance'[canal]   = "Meta Ads")

VAR _google_inv = CALCULATE(SUM('f_performance_midia'[custo]),     'f_performance_midia'[canal] = "Google Ads")
VAR _google_imp = CALCULATE(SUM('f_performance_midia'[impressoes]),'f_performance_midia'[canal] = "Google Ads")
VAR _google_clk = CALCULATE(SUM('f_performance_midia'[cliques]),   'f_performance_midia'[canal] = "Google Ads")
VAR _google_rec = CALCULATE(SUM('f_ga4_performance'[receita_ga4]), 'f_ga4_performance'[canal]   = "Google Ads")

VAR _tiktok_inv = CALCULATE(SUM('f_performance_midia'[custo]),     'f_performance_midia'[canal] = "TikTok Ads")
VAR _tiktok_imp = CALCULATE(SUM('f_performance_midia'[impressoes]),'f_performance_midia'[canal] = "TikTok Ads")
VAR _tiktok_clk = CALCULATE(SUM('f_performance_midia'[cliques]),   'f_performance_midia'[canal] = "TikTok Ads")

VAR _awin_inv   = CALCULATE(SUM('f_performance_midia'[custo]),     'f_performance_midia'[canal] = "Awin")
VAR _awin_rec   = CALCULATE(SUM('f_ga4_performance'[receita_ga4]), 'f_ga4_performance'[canal]   = "Awin")

VAR _criteo_inv = CALCULATE(SUM('f_performance_midia'[custo]),     'f_performance_midia'[canal] = "Criteo")
VAR _criteo_rec = CALCULATE(SUM('f_ga4_performance'[receita_ga4]), 'f_ga4_performance'[canal]   = "Criteo")

VAR _rtb_inv    = CALCULATE(SUM('f_performance_midia'[custo]),     'f_performance_midia'[canal] = "RTB")
VAR _rtb_rec    = CALCULATE(SUM('f_ga4_performance'[receita_ga4]), 'f_ga4_performance'[canal]   = "RTB")

// ── GA4 (f_ga4_performance) ───────────────────────────────────────────────────
VAR _ga4_rec   = CALCULATE(SUM('f_ga4_performance'[receita_ga4]))
VAR _ga4_sess  = CALCULATE(SUM('f_ga4_performance'[sessoes]))
VAR _ga4_users = CALCULATE(SUM('f_ga4_performance'[usuarios]))
VAR _ga4_trans = CALCULATE(SUM('f_ga4_performance'[transacoes_ga4]))

// ── Totais ────────────────────────────────────────────────────────────────────
VAR _inv_total = CALCULATE(SUM('f_performance_midia'[custo]))
VAR _imp_total = _meta_imp + _google_imp + _tiktok_imp
VAR _clk_total = _meta_clk + _google_clk + _tiktok_clk
VAR _conv_total = _meta_conv
VAR _rec_total = _ga4_rec
VAR _ctr  = IF(_imp_total > 0, DIVIDE(_clk_total, _imp_total) * 100, 0)
VAR _roas = IF(_inv_total > 0, DIVIDE(_rec_total, _inv_total), 0)
VAR _cpa  = IF(_conv_total > 0, DIVIDE(_inv_total, _conv_total), 0)

// ── Top 10 Campanhas ──────────────────────────────────────────────────────────
VAR _camp_meta =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('f_performance_midia', 'f_performance_midia'[nome_campanha]),
            "inv", CALCULATE(SUM('f_performance_midia'[custo]),     'f_performance_midia'[canal] = "Meta Ads"),
            "imp", CALCULATE(SUM('f_performance_midia'[impressoes]),'f_performance_midia'[canal] = "Meta Ads"),
            "clk", CALCULATE(SUM('f_performance_midia'[cliques]),   'f_performance_midia'[canal] = "Meta Ads"),
            "rec", CALCULATE(SUM('f_ga4_performance'[receita_ga4]), 'f_ga4_performance'[canal]   = "Meta Ads")
        ), [inv], DESC),
        "nome", 'f_performance_midia'[nome_campanha], "inv", [inv], "imp", [imp], "clk", [clk], "rec", [rec])

VAR _camp_google =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('f_performance_midia', 'f_performance_midia'[nome_campanha]),
            "inv", CALCULATE(SUM('f_performance_midia'[custo]),     'f_performance_midia'[canal] = "Google Ads"),
            "imp", CALCULATE(SUM('f_performance_midia'[impressoes]),'f_performance_midia'[canal] = "Google Ads"),
            "clk", CALCULATE(SUM('f_performance_midia'[cliques]),   'f_performance_midia'[canal] = "Google Ads"),
            "rec", CALCULATE(SUM('f_ga4_performance'[receita_ga4]), 'f_ga4_performance'[canal]   = "Google Ads")
        ), [inv], DESC),
        "nome", 'f_performance_midia'[nome_campanha], "inv", [inv], "imp", [imp], "clk", [clk], "rec", [rec])

VAR _all_camp = TOPN(10, UNION(_camp_meta, _camp_google), [inv], DESC)

// ── Export String ─────────────────────────────────────────────────────────────
VAR _StringBase =
    "EXPORT_C&A" &
    ";;periodo_inicio=" & _Inicio & ";;periodo_fim=" & _Fim &
    ";;investimento=" & _inv_total & ";;investimento_anterior=0" &
    ";;impressoes="   & _imp_total & ";;impressoes_anterior=0" &
    ";;cliques="      & _clk_total & ";;cliques_anterior=0" &
    ";;ctr="          & _ctr       & ";;ctr_anterior=0" &
    ";;conversoes="   & _conv_total& ";;conversoes_anterior=0" &
    ";;cpa="          & _cpa       & ";;cpa_anterior=0" &
    ";;receita="      & _rec_total & ";;receita_anterior=0" &
    ";;roas="         & _roas      & ";;roas_anterior=0" &
    IF(_meta_inv > 0,
        ";;meta_investimento=" & _meta_inv & ";;meta_investimento_anterior=0" &
        ";;meta_receita="      & _meta_rec & ";;meta_receita_anterior=0", "") &
    IF(_google_inv > 0,
        ";;google_investimento=" & _google_inv & ";;google_investimento_anterior=0" &
        ";;google_receita="      & _google_rec & ";;google_receita_anterior=0", "") &
    IF(_tiktok_inv > 0,
        ";;tiktok_investimento=" & _tiktok_inv & ";;tiktok_investimento_anterior=0", "") &
    IF(_awin_inv > 0,
        ";;awin_investimento=" & _awin_inv & ";;awin_investimento_anterior=0" &
        ";;awin_receita="      & _awin_rec & ";;awin_receita_anterior=0", "") &
    IF(_criteo_inv > 0,
        ";;criteo_investimento=" & _criteo_inv & ";;criteo_investimento_anterior=0" &
        ";;criteo_receita="      & _criteo_rec & ";;criteo_receita_anterior=0", "") &
    IF(_rtb_inv > 0,
        ";;rtb_investimento=" & _rtb_inv & ";;rtb_investimento_anterior=0" &
        ";;rtb_receita="      & _rtb_rec & ";;rtb_receita_anterior=0", "") &
    ";;ga4_sessoes="    & _ga4_sess  & ";;ga4_sessoes_anterior=0" &
    ";;ga4_usuarios="   & _ga4_users & ";;ga4_usuarios_anterior=0" &
    ";;ga4_transacoes=" & _ga4_trans & ";;ga4_transacoes_anterior=0" &
    ";;ga4_receita="    & _ga4_rec   & ";;ga4_receita_anterior=0" &
    ";;campanhas_top10=" &
        CONCATENATEX(_all_camp,
            "c:" & [nome] & "|i:" & [inv] & "|im:" & [imp] &
            "|cl:" & [clk] & "|co:0|re:" & [rec] & "|ro:0|cp:0", "||") &
    ";;END_EXPORT"

RETURN _StringBase`,
  creativeDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

VAR _Parsed =
    ADDCOLUMNS(
        SUMMARIZE('meta_ads_cea_images', 'meta_ads_cea_images'[thumbnail_url]),
        "CleanUrl", LEFT('meta_ads_cea_images'[thumbnail_url], FIND("?", 'meta_ads_cea_images'[thumbnail_url] & "?") - 1)
    )

VAR _CleanList = SUMMARIZE(_Parsed, [CleanUrl])

VAR _CreativeTable =
    FILTER(
        GENERATE(
            _CleanList,
            VAR _CurrentCleanUrl = [CleanUrl]
            VAR _OriginalURLs = SELECTCOLUMNS(FILTER(_Parsed, [CleanUrl] = _CurrentCleanUrl), "url", [thumbnail_url])
            RETURN
                CALCULATETABLE(
                    ROW(
                        "ad_name", MIN('meta_ads_cea_images'[ad_name]),
                        "Invest", SUM('meta_ads_cea_images'[spend]),
                        "Impres", SUM('meta_ads_cea_images'[impressions]),
                        "Clicks", SUM('meta_ads_cea_images'[clicks]),
                        "Conv", SUM('meta_ads_cea_images'[actions_offsite_conversion_fb_pixel_purchase]),
                        "Rec", [ReceitaGA],
                        "DifCriativo", DATEDIFF(MIN('meta_ads_cea_images'[date]), MAX('meta_ads_cea_images'[date]), DAY) + 1,
                        "thumbnail_url", MAXX(_OriginalURLs, [url])
                    ),
                    TREATAS(_OriginalURLs, 'meta_ads_cea_images'[thumbnail_url])
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
        " | im:" & [Impres] &
        " | cl:" & [Clicks] &
        " | co:" & [Conv] &
        " | re:" & [Rec] &
        " | dif_criativo:" & [DifCriativo] &
        " | url:" & [thumbnail_url],
        "||"
    ) &
    ";;END_EXPORT"
RETURN _FinalString`,
};
