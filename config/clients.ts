
export interface ClientConfig {
  id: string;
  name: string;
  slug: string;
  datasetId: string;
  measuresTable: string;
  performanceDax: string;
  creativeDax: string;
  /** Quando true, ignora Power BI e mostra apenas upload de imagens para análise visual */
  creativesOnly?: boolean;
  /** Dataset BigQuery (ex: 'CasaDaToalha'). Se definido, tenta BQ primeiro com PBI como fallback. */
  bqDataset?: string;
}

export const CLIENTS: ClientConfig[] = [
  {
    id: 'cea',
    name: 'C&A',
    slug: 'cea',
    datasetId: '4269623c-ac5a-480f-82a9-c887fbbd781d',
    measuresTable: '_Medidas',
    performanceDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- M-1 (período anterior injetado pelo frontend) ---
VAR _PrevStart = {{PREV_START_DATE}}
VAR _PrevEnd = {{PREV_END_DATE}}

// --- Métricas M-1 Globais ---
VAR _inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _imp_ant = CALCULATE([ImpressõesGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _clk_ant = CALCULATE([CliquesGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _conv_ant = CALCULATE([ConversõesGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _cpa_ant = CALCULATE([CPCGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _roas_ant = IF(_inv_ant > 0, _rec_ant / _inv_ant, 0)
VAR _ctr_ant = CALCULATE([CTRGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))

// --- Métricas por Canal (período atual) ---
VAR _meta_inv = CALCULATE([InvestimentoGeral], 'dCanal'[Canal] IN {"Meta Ads", "Facebook Ads", "Instagram"})
VAR _meta_rec = CALCULATE([ReceitaGA], 'dCanal'[Canal] IN {"Meta Ads", "Facebook Ads", "Instagram"})

VAR _google_inv = CALCULATE([InvestimentoGeral], 'dCanal'[Canal] = "Google Ads")
VAR _google_rec = CALCULATE([ReceitaGA], 'dCanal'[Canal] = "Google Ads")

VAR _tiktok_inv = CALCULATE([InvestimentoGeral], 'dCanal'[Canal] = "TikTok Ads")
VAR _tiktok_rec = CALCULATE([ReceitaGA], 'dCanal'[Canal] = "TikTok Ads")

VAR _awin_inv = CALCULATE([InvestimentoGeral], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Awin")))
VAR _awin_rec = CALCULATE([ReceitaGA], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Awin")))

VAR _criteo_inv = CALCULATE([InvestimentoGeral], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Criteo")))
VAR _criteo_rec = CALCULATE([ReceitaGA], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Criteo")))

VAR _rtb_inv = CALCULATE([InvestimentoGeral], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "RTB")))
VAR _rtb_rec = CALCULATE([ReceitaGA], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "RTB")))

VAR _pinterest_inv = CALCULATE([InvestimentoGeral], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Pinterest")))
VAR _pinterest_rec = CALCULATE([ReceitaGA], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Pinterest")))

VAR _meliuz_inv = CALCULATE([InvestimentoGeral], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Meliuz")))
VAR _meliuz_rec = CALCULATE([ReceitaGA], KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Meliuz")))

// --- Métricas por Canal M-1 ---
VAR _meta_inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), 'dCanal'[Canal] IN {"Meta Ads", "Facebook Ads", "Instagram"})
VAR _meta_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), 'dCanal'[Canal] IN {"Meta Ads", "Facebook Ads", "Instagram"})

VAR _google_inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), 'dCanal'[Canal] = "Google Ads")
VAR _google_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), 'dCanal'[Canal] = "Google Ads")

VAR _tiktok_inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), 'dCanal'[Canal] = "TikTok Ads")
VAR _tiktok_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), 'dCanal'[Canal] = "TikTok Ads")

VAR _awin_inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Awin")))
VAR _awin_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Awin")))

VAR _criteo_inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Criteo")))
VAR _criteo_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Criteo")))

VAR _rtb_inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "RTB")))
VAR _rtb_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "RTB")))

VAR _pinterest_inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Pinterest")))
VAR _pinterest_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Pinterest")))

VAR _meliuz_inv_ant = CALCULATE([InvestimentoGeral], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Meliuz")))
VAR _meliuz_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd), KEEPFILTERS(CONTAINSSTRING('dCanal'[Canal], "Meliuz")))

// --- GA4 M-1 ---
VAR _ga4_sess_ant = CALCULATE([Sessões], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _ga4_users_ant = CALCULATE([Usuários], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _ga4_trans_ant = CALCULATE([Transações], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _ga4_rec_ant = CALCULATE([ReceitaGA], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _ga4_txconv_ant = CALCULATE([Tx. Conversão GA4], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))
VAR _ga4_tkm_ant = CALCULATE([TKM], FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd))

// --- Construção da String ---
VAR _StringBase = 
    "EXPORT_C&A" &
    ";;periodo_inicio=" & _Inicio &
    ";;periodo_fim=" & _Fim &
    ";;investimento=" & [InvestimentoGeral] &
    ";;investimento_anterior=" & _inv_ant &
    ";;investimento_fonte=Ads" &
    ";;impressoes=" & [ImpressõesGeral] &
    ";;impressoes_anterior=" & _imp_ant &
    ";;cliques=" & [CliquesGeral] &
    ";;cliques_anterior=" & _clk_ant &
    ";;ctr=" & [CTRGeral] &
    ";;ctr_anterior=" & _ctr_ant &
    ";;conversoes=" & [ConversõesGeral] &
    ";;conversoes_anterior=" & _conv_ant &
    ";;cpa=" & [CPCGeral] &
    ";;cpa_anterior=" & _cpa_ant &
    ";;receita=" & [ReceitaGA] &
    ";;receita_anterior=" & _rec_ant &
    ";;roas=" & [ROAS] &
    ";;roas_anterior=" & _roas_ant &
    
    // Canais (atual + M-1, só aparecem se houver investimento)
    IF(_meta_inv > 0, ";;meta_investimento=" & _meta_inv & ";;meta_investimento_anterior=" & _meta_inv_ant & ";;meta_receita=" & _meta_rec & ";;meta_receita_anterior=" & _meta_rec_ant, "") &
    IF(_google_inv > 0, ";;google_investimento=" & _google_inv & ";;google_investimento_anterior=" & _google_inv_ant & ";;google_receita=" & _google_rec & ";;google_receita_anterior=" & _google_rec_ant, "") &
    IF(_tiktok_inv > 0, ";;tiktok_investimento=" & _tiktok_inv & ";;tiktok_investimento_anterior=" & _tiktok_inv_ant & ";;tiktok_receita=" & _tiktok_rec & ";;tiktok_receita_anterior=" & _tiktok_rec_ant, "") &
    IF(_awin_inv > 0, ";;awin_investimento=" & _awin_inv & ";;awin_investimento_anterior=" & _awin_inv_ant & ";;awin_receita=" & _awin_rec & ";;awin_receita_anterior=" & _awin_rec_ant, "") &
    IF(_criteo_inv > 0, ";;criteo_investimento=" & _criteo_inv & ";;criteo_investimento_anterior=" & _criteo_inv_ant & ";;criteo_receita=" & _criteo_rec & ";;criteo_receita_anterior=" & _criteo_rec_ant, "") &
    IF(_rtb_inv > 0, ";;rtb_investimento=" & _rtb_inv & ";;rtb_investimento_anterior=" & _rtb_inv_ant & ";;rtb_receita=" & _rtb_rec & ";;rtb_receita_anterior=" & _rtb_rec_ant, "") &
    IF(_pinterest_inv > 0, ";;pinterest_investimento=" & _pinterest_inv & ";;pinterest_investimento_anterior=" & _pinterest_inv_ant & ";;pinterest_receita=" & _pinterest_rec & ";;pinterest_receita_anterior=" & _pinterest_rec_ant, "") &
    IF(_meliuz_inv > 0, ";;meliuz_investimento=" & _meliuz_inv & ";;meliuz_investimento_anterior=" & _meliuz_inv_ant & ";;meliuz_receita=" & _meliuz_rec & ";;meliuz_receita_anterior=" & _meliuz_rec_ant, "") &
    
    // GA4 & Backend (atual + M-1)
    ";;ga4_sessoes=" & [Sessões] &
    ";;ga4_sessoes_anterior=" & _ga4_sess_ant &
    ";;ga4_usuarios=" & [Usuários] &
    ";;ga4_usuarios_anterior=" & _ga4_users_ant &
    ";;ga4_transacoes=" & [Transações] &
    ";;ga4_transacoes_anterior=" & _ga4_trans_ant &
    ";;ga4_receita=" & [ReceitaGA] &
    ";;ga4_receita_anterior=" & _ga4_rec_ant &
    ";;ga4_tx_conversao=" & [Tx. Conversão GA4] &
    ";;ga4_tx_conversao_anterior=" & _ga4_txconv_ant &
    ";;ga4_ticket_medio=" & [TKM] &
    ";;ga4_ticket_medio_anterior=" & _ga4_tkm_ant &
    ";;vtex_receita=" & [ReceitaGA] &
    ";;vtex_receita_anterior=" & _ga4_rec_ant &
    ";;vtex_pedidos=" & [Transações] &
    ";;vtex_pedidos_anterior=" & _ga4_trans_ant &
    ";;vtex_ticket_medio=" & [TKM] &
    ";;vtex_ticket_medio_anterior=" & _ga4_tkm_ant &

    // Top 10 Campanhas
    ";;campanhas_top10=" & 
        CONCATENATEX(
            TOPN(10, ALLSELECTED('dCampanhas'), [InvestimentoGeral], DESC),
            "c:" & 'dCampanhas'[campaign_name] & 
            "|i:" & [InvestimentoGeral] &
            "|im:" & [ImpressõesGeral] &
            "|cl:" & [CliquesGeral] &
            "|co:" & [ConversõesGeral] &
            "|re:" & [ReceitaGA] &
            "|ro:" & [ROAS] &
            "|cp:" & [CPCGeral],
            "||"
        ) &
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
RETURN _FinalString`
  },
  {
    id: 'gama',
    name: 'Gama Italy',
    slug: 'gama-italy',
    datasetId: 'ccd22cca-95b4-49be-89ca-7ef3bc33914f',
    measuresTable: 'Medidas',
    performanceDax: `
// --- Período (injetado pelo frontend via CALCULATETABLE) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- Meta Ads ---
VAR _meta_inv = CALCULATE(SUM('fb_campanhas'[spend]))
VAR _meta_imp = CALCULATE(SUM('fb_campanhas'[impressions]))
VAR _meta_clk = CALCULATE(SUM('fb_campanhas'[inline_link_clicks]))
VAR _meta_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Meta Ads")

// --- Google Ads ---
VAR _google_inv = CALCULATE(SUM('google_ads_campanhas'[metrics_cost]))
VAR _google_imp = CALCULATE(SUM('google_ads_campanhas'[metrics_impressions]))
VAR _google_clk = CALCULATE(SUM('google_ads_campanhas'[metrics_clicks]))
VAR _google_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Google Ads")

// --- TikTok Ads ---
VAR _tiktok_inv = CALCULATE(SUM('tiktokAds'[spend]))
VAR _tiktok_imp = CALCULATE(SUM('tiktokAds'[impressions]))
VAR _tiktok_clk = CALCULATE(SUM('tiktokAds'[clicks]))

// --- GA4 Global ---
VAR _ga4_rec   = CALCULATE(SUM('GA4_Origem'[totalrevenue]))
VAR _ga4_sess  = CALCULATE(SUM('GA4_Origem'[sessions]))
VAR _ga4_users = CALCULATE(SUM('GA4_Origem'[totalusers]))
VAR _ga4_trans = CALCULATE(SUM('GA4_Origem'[transactions]))

// --- Totais ---
VAR _inv_total = _meta_inv + _google_inv + _tiktok_inv
VAR _rec_total = _meta_rec + _google_rec
VAR _imp_total = _meta_imp + _google_imp + _tiktok_imp
VAR _clk_total = _meta_clk + _google_clk + _tiktok_clk
VAR _ctr  = IF(_imp_total > 0, DIVIDE(_clk_total, _imp_total) * 100, 0)
VAR _roas = IF(_inv_total > 0, DIVIDE(_rec_total, _inv_total), 0)

// --- Top 10 Campanhas (Meta + Google combinados) ---
VAR _meta_camp =
    SELECTCOLUMNS(
        TOPN(5,
            ADDCOLUMNS(
                SUMMARIZE('fb_campanhas', 'fb_campanhas'[campaign_name]),
                "inv", CALCULATE(SUM('fb_campanhas'[spend])),
                "imp", CALCULATE(SUM('fb_campanhas'[impressions])),
                "clk", CALCULATE(SUM('fb_campanhas'[inline_link_clicks]))
            ),
            [inv], DESC),
        "nome", 'fb_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _google_camp =
    SELECTCOLUMNS(
        TOPN(5,
            ADDCOLUMNS(
                SUMMARIZE('google_ads_campanhas', 'google_ads_campanhas'[campaign_name]),
                "inv", CALCULATE(SUM('google_ads_campanhas'[metrics_cost])),
                "imp", CALCULATE(SUM('google_ads_campanhas'[metrics_impressions])),
                "clk", CALCULATE(SUM('google_ads_campanhas'[metrics_clicks]))
            ),
            [inv], DESC),
        "nome", 'google_ads_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _all_camp = TOPN(10, UNION(_meta_camp, _google_camp), [inv], DESC)

// --- Construção da String ---
VAR _StringBase =
    "EXPORT_MOM_GAMA" &
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
    ";;conversoes=" & _ga4_trans &
    ";;conversoes_anterior=0" &
    ";;cpa=0" &
    ";;cpa_anterior=0" &
    ";;receita=" & _rec_total &
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
        ";;meta_receita=" & _meta_rec &
        ";;meta_receita_anterior=0", "") &

    IF(_google_inv > 0,
        ";;google_investimento=" & _google_inv &
        ";;google_investimento_anterior=0" &
        ";;google_impressoes=" & _google_imp &
        ";;google_impressoes_anterior=0" &
        ";;google_cliques=" & _google_clk &
        ";;google_cliques_anterior=0" &
        ";;google_receita=" & _google_rec &
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

    ";;ga4_sessoes=" & _ga4_sess &
    ";;ga4_sessoes_anterior=0" &
    ";;ga4_usuarios=" & _ga4_users &
    ";;ga4_usuarios_anterior=0" &
    ";;ga4_transacoes=" & _ga4_trans &
    ";;ga4_transacoes_anterior=0" &
    ";;ga4_receita=" & _ga4_rec &
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
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- M-1 (período anterior injetado pelo frontend) ---
VAR _PrevStart = {{PREV_START_DATE}}
VAR _PrevEnd = {{PREV_END_DATE}}

VAR _AdList = DISTINCT(SELECTCOLUMNS('fb_ads', "ad_id", 'fb_ads'[ad_id], "ad_name", 'fb_ads'[ad_name]))

VAR _CreativeTable =
    FILTER(
        GENERATE(
            _AdList,
            VAR _CurrentAdId = [ad_id]
            RETURN
                CALCULATETABLE(
                    ROW(
                        "Invest", SUM('fb_ads'[spend]),
                        "InvestAnt", CALCULATE(SUM('fb_ads'[spend]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Impres", SUM('fb_ads'[impressions]),
                        "ImpresAnt", CALCULATE(SUM('fb_ads'[impressions]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Clicks", SUM('fb_ads'[inline_link_clicks]),
                        "ClicksAnt", CALCULATE(SUM('fb_ads'[inline_link_clicks]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "DifCriativo", DATEDIFF(MIN('fb_ads'[metric_date]), MAX('fb_ads'[metric_date]), DAY) + 1,
                        "thumbnail_url", LOOKUPVALUE('fb_ad'[creative_thumbnail_url], 'fb_ad'[ad_id], _CurrentAdId)
                    ),
                    'fb_ads'[ad_id] = _CurrentAdId
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

RETURN _FinalString`
  },

  // ─── Casa da Toalha ──────────────────────────────────────────────────────────
  {
    id: 'casadatoalha',
    name: 'Casa da Toalha',
    slug: 'casa-da-toalha',
<<<<<<< HEAD
    bqDataset: 'CasaDaToalha',
=======
>>>>>>> origin/main
    datasetId: 'cf6dded6-68aa-46c6-9e2b-295eade30979',
    measuresTable: 'Medidas',
    performanceDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- Meta Ads ---
VAR _meta_inv = CALCULATE(SUM('fb_campanhas'[spend]))
VAR _meta_imp = CALCULATE(SUM('fb_campanhas'[impressions]))
VAR _meta_clk = CALCULATE(SUM('fb_campanhas'[inline_link_clicks]))
VAR _meta_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Meta Ads")

// --- Google Ads ---
VAR _google_inv = CALCULATE(SUM('google_ads_campanhas'[metrics_cost]))
VAR _google_imp = CALCULATE(SUM('google_ads_campanhas'[metrics_impressions]))
VAR _google_clk = CALCULATE(SUM('google_ads_campanhas'[metrics_clicks]))
VAR _google_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Google Ads")

// --- GA4 Global (fonte de verdade — prioridade sobre pixel Meta) ---
VAR _ga4_rec   = CALCULATE(SUM('GA4_Origem'[totalrevenue]))
VAR _ga4_sess  = CALCULATE(SUM('GA4_Origem'[sessions]))
VAR _ga4_users = CALCULATE(SUM('GA4_Origem'[totalusers]))
VAR _ga4_trans = CALCULATE(SUM('GA4_Origem'[transactions]))

// --- Totais ---
VAR _inv_total = _meta_inv + _google_inv
VAR _rec_total = _ga4_rec
VAR _imp_total = _meta_imp + _google_imp
VAR _clk_total = _meta_clk + _google_clk
VAR _ctr  = IF(_imp_total > 0, DIVIDE(_clk_total, _imp_total) * 100, 0)
VAR _roas = IF(_inv_total > 0, DIVIDE(_rec_total, _inv_total), 0)
VAR _cpa  = IF(_ga4_trans > 0, DIVIDE(_inv_total, _ga4_trans), 0)

// --- Top 10 Campanhas (Meta + Google combinados) ---
VAR _meta_camp =
    SELECTCOLUMNS(
        TOPN(5,
            ADDCOLUMNS(
                SUMMARIZE('fb_campanhas', 'fb_campanhas'[campaign_name]),
                "inv", CALCULATE(SUM('fb_campanhas'[spend])),
                "imp", CALCULATE(SUM('fb_campanhas'[impressions])),
                "clk", CALCULATE(SUM('fb_campanhas'[inline_link_clicks])),
                "rec", CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Meta Ads")
            ),
            [inv], DESC),
        "nome", 'fb_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk], "rec", [rec])

VAR _google_camp =
    SELECTCOLUMNS(
        TOPN(5,
            ADDCOLUMNS(
                SUMMARIZE('google_ads_campanhas', 'google_ads_campanhas'[campaign_name]),
                "inv", CALCULATE(SUM('google_ads_campanhas'[metrics_cost])),
                "imp", CALCULATE(SUM('google_ads_campanhas'[metrics_impressions])),
                "clk", CALCULATE(SUM('google_ads_campanhas'[metrics_clicks])),
                "rec", CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Google Ads")
            ),
            [inv], DESC),
        "nome", 'google_ads_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk], "rec", [rec])

VAR _all_camp = TOPN(10, UNION(_meta_camp, _google_camp), [inv], DESC)

VAR _StringBase =
    "EXPORT_MOM_CASADATOALHA" &
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
    ";;conversoes=" & _ga4_trans &
    ";;conversoes_anterior=0" &
    ";;cpa=" & _cpa &
    ";;cpa_anterior=0" &
    ";;receita=" & _rec_total &
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
        ";;meta_receita=" & _meta_rec &
        ";;meta_receita_anterior=0", "") &

    IF(_google_inv > 0,
        ";;google_investimento=" & _google_inv &
        ";;google_investimento_anterior=0" &
        ";;google_impressoes=" & _google_imp &
        ";;google_impressoes_anterior=0" &
        ";;google_cliques=" & _google_clk &
        ";;google_cliques_anterior=0" &
        ";;google_receita=" & _google_rec &
        ";;google_receita_anterior=0", "") &

    ";;ga4_sessoes=" & _ga4_sess &
    ";;ga4_sessoes_anterior=0" &
    ";;ga4_usuarios=" & _ga4_users &
    ";;ga4_usuarios_anterior=0" &
    ";;ga4_transacoes=" & _ga4_trans &
    ";;ga4_transacoes_anterior=0" &
    ";;ga4_receita=" & _ga4_rec &
    ";;ga4_receita_anterior=0" &

    ";;campanhas_top10=" &
    CONCATENATEX(
        _all_camp,
        "c:" & [nome] &
        "|i:" & [inv] &
        "|im:" & [imp] &
        "|cl:" & [clk] &
        "|co:0|re:" & [rec] & "|ro:0|cp:0",
        "||"
    ) &
    ";;END_EXPORT"

RETURN _StringBase`,
    creativeDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- M-1 (período anterior injetado pelo frontend) ---
VAR _PrevStart = {{PREV_START_DATE}}
VAR _PrevEnd = {{PREV_END_DATE}}

VAR _AdList = DISTINCT(SELECTCOLUMNS('fb_ads', "ad_id", 'fb_ads'[ad_id], "ad_name", 'fb_ads'[ad_name]))

VAR _CreativeTable =
    FILTER(
        GENERATE(
            _AdList,
            VAR _CurrentAdId = [ad_id]
            RETURN
                CALCULATETABLE(
                    ROW(
                        "Invest",    SUM('fb_ads'[spend]),
                        "InvestAnt", CALCULATE(SUM('fb_ads'[spend]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Impres",    SUM('fb_ads'[impressions]),
                        "ImpresAnt", CALCULATE(SUM('fb_ads'[impressions]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Clicks",    SUM('fb_ads'[inline_link_clicks]),
                        "ClicksAnt", CALCULATE(SUM('fb_ads'[inline_link_clicks]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Rec",       SUM('fb_ads'[value_purchase]),
                        "DifCriativo", DATEDIFF(MIN('fb_ads'[metric_date]), MAX('fb_ads'[metric_date]), DAY) + 1,
                        "thumbnail_url", LOOKUPVALUE('fb_ad'[creative_thumbnail_url], 'fb_ad'[ad_id], _CurrentAdId)
                    ),
                    'fb_ads'[ad_id] = _CurrentAdId
                )
        ),
        [Invest] > 0 && NOT(ISBLANK([thumbnail_url]))
    )

VAR _FinalString =
    "EXPORT_CREATIVOS_FULL_MOM" &
    ";;plataforma=Meta Ads" &
    ";;periodo_inicio=" & _Inicio &
    ";;periodo_fim=" & _Fim &
    ";;detalhamento_criativos=" &
    CONCATENATEX(
        TOPN(30, _CreativeTable, [Invest], DESC),
        "n:" & [ad_name] &
        " | i:" & [Invest] &
        " | i_ant:" & [InvestAnt] &
        " | im:" & [Impres] &
        " | im_ant:" & [ImpresAnt] &
        " | cl:" & [Clicks] &
        " | cl_ant:" & [ClicksAnt] &
        " | co:0" &
        " | re:" & [Rec] &
        " | dif_criativo:" & [DifCriativo] &
        " | url:" & [thumbnail_url],
        "||"
    ) &
    ";;END_EXPORT"
RETURN _FinalString`
  },

  // ─── Dabelle ─────────────────────────────────────────────────────────────────
  {
    id: 'dabelle',
    name: 'Dabelle',
    slug: 'dabelle',
    datasetId: '027b28bb-3e26-4aee-97a4-a4324e95ca35',
    measuresTable: 'Medidas',
    performanceDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- Meta Ads ---
VAR _meta_inv = CALCULATE(SUM('fb_campanhas'[spend]))
VAR _meta_imp = CALCULATE(SUM('fb_campanhas'[impressions]))
VAR _meta_clk = CALCULATE(SUM('fb_campanhas'[inline_link_clicks]))
VAR _meta_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Meta Ads")

// --- Google Ads ---
VAR _google_inv = CALCULATE(SUM('google_ads_campanhas'[metrics_cost]))
VAR _google_imp = CALCULATE(SUM('google_ads_campanhas'[metrics_impressions]))
VAR _google_clk = CALCULATE(SUM('google_ads_campanhas'[metrics_clicks]))
VAR _google_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Google Ads")

// --- GA4 Global (fonte de verdade para receita) ---
VAR _ga4_rec   = CALCULATE(SUM('GA4_Origem'[totalrevenue]))
VAR _ga4_sess  = CALCULATE(SUM('GA4_Origem'[sessions]))
VAR _ga4_users = CALCULATE(SUM('GA4_Origem'[totalusers]))
VAR _ga4_trans = CALCULATE(SUM('GA4_Origem'[transactions]))

// --- Totais ---
VAR _inv_total = _meta_inv + _google_inv
VAR _rec_total = _ga4_rec
VAR _imp_total = _meta_imp + _google_imp
VAR _clk_total = _meta_clk + _google_clk
VAR _ctr  = IF(_imp_total > 0, DIVIDE(_clk_total, _imp_total) * 100, 0)
VAR _roas = IF(_inv_total > 0, DIVIDE(_rec_total, _inv_total), 0)
VAR _cpa  = IF(_ga4_trans > 0, DIVIDE(_inv_total, _ga4_trans), 0)

// --- Top 10 Campanhas (Meta + Google combinados) ---
VAR _meta_camp =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('fb_campanhas', 'fb_campanhas'[campaign_name]),
            "inv", CALCULATE(SUM('fb_campanhas'[spend])),
            "imp", CALCULATE(SUM('fb_campanhas'[impressions])),
            "clk", CALCULATE(SUM('fb_campanhas'[inline_link_clicks]))
        ), [inv], DESC),
        "nome", 'fb_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _google_camp =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('google_ads_campanhas', 'google_ads_campanhas'[campaign_name]),
            "inv", CALCULATE(SUM('google_ads_campanhas'[metrics_cost])),
            "imp", CALCULATE(SUM('google_ads_campanhas'[metrics_impressions])),
            "clk", CALCULATE(SUM('google_ads_campanhas'[metrics_clicks]))
        ), [inv], DESC),
        "nome", 'google_ads_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _all_camp = TOPN(10, UNION(_meta_camp, _google_camp), [inv], DESC)

VAR _StringBase =
    "EXPORT_MOM_DABELLE" &
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
    ";;conversoes=" & _ga4_trans &
    ";;conversoes_anterior=0" &
    ";;cpa=" & _cpa &
    ";;cpa_anterior=0" &
    ";;receita=" & _rec_total &
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
        ";;meta_receita=" & _meta_rec &
        ";;meta_receita_anterior=0", "") &

    IF(_google_inv > 0,
        ";;google_investimento=" & _google_inv &
        ";;google_investimento_anterior=0" &
        ";;google_impressoes=" & _google_imp &
        ";;google_impressoes_anterior=0" &
        ";;google_cliques=" & _google_clk &
        ";;google_cliques_anterior=0" &
        ";;google_receita=" & _google_rec &
        ";;google_receita_anterior=0", "") &

    ";;ga4_sessoes=" & _ga4_sess &
    ";;ga4_sessoes_anterior=0" &
    ";;ga4_usuarios=" & _ga4_users &
    ";;ga4_usuarios_anterior=0" &
    ";;ga4_transacoes=" & _ga4_trans &
    ";;ga4_transacoes_anterior=0" &
    ";;ga4_receita=" & _ga4_rec &
    ";;ga4_receita_anterior=0" &

    ";;campanhas_top10=" &
    CONCATENATEX(
        _all_camp,
        "c:" & [nome] & "|i:" & [inv] & "|im:" & [imp] & "|cl:" & [clk] & "|co:0|re:0|ro:0|cp:0",
        "||"
    ) &
    ";;END_EXPORT"

RETURN _StringBase`,
    creativeDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- M-1 (período anterior injetado pelo frontend) ---
VAR _PrevStart = {{PREV_START_DATE}}
VAR _PrevEnd = {{PREV_END_DATE}}

VAR _AdList = DISTINCT(SELECTCOLUMNS('fb_ads', "ad_id", 'fb_ads'[ad_id], "ad_name", 'fb_ads'[ad_name]))

VAR _CreativeTable =
    FILTER(
        GENERATE(
            _AdList,
            VAR _CurrentAdId = [ad_id]
            RETURN
                CALCULATETABLE(
                    ROW(
                        "Invest",    SUM('fb_ads'[spend]),
                        "InvestAnt", CALCULATE(SUM('fb_ads'[spend]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Impres",    SUM('fb_ads'[impressions]),
                        "ImpresAnt", CALCULATE(SUM('fb_ads'[impressions]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Clicks",    SUM('fb_ads'[inline_link_clicks]),
                        "ClicksAnt", CALCULATE(SUM('fb_ads'[inline_link_clicks]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "DifCriativo", DATEDIFF(MIN('fb_ads'[metric_date]), MAX('fb_ads'[metric_date]), DAY) + 1,
                        "thumbnail_url", LOOKUPVALUE('fb_ad'[creative_thumbnail_url], 'fb_ad'[ad_id], _CurrentAdId)
                    ),
                    'fb_ads'[ad_id] = _CurrentAdId
                )
        ),
        [Invest] > 0 && NOT(ISBLANK([thumbnail_url]))
    )

VAR _FinalString =
    "EXPORT_CREATIVOS_FULL_MOM" &
    ";;plataforma=Meta Ads" &
    ";;periodo_inicio=" & _Inicio &
    ";;periodo_fim=" & _Fim &
    ";;detalhamento_criativos=" &
    CONCATENATEX(
        TOPN(30, _CreativeTable, [Invest], DESC),
        "n:" & [ad_name] &
        " | i:" & [Invest] &
        " | i_ant:" & [InvestAnt] &
        " | im:" & [Impres] &
        " | im_ant:" & [ImpresAnt] &
        " | cl:" & [Clicks] &
        " | cl_ant:" & [ClicksAnt] &
        " | co:0 | re:0" &
        " | dif_criativo:" & [DifCriativo] &
        " | url:" & [thumbnail_url],
        "||"
    ) &
    ";;END_EXPORT"
RETURN _FinalString`
  },

  // ─── Eico ─────────────────────────────────────────────────────────────────────
  {
    id: 'eico',
    name: 'Eico',
    slug: 'eico',
    datasetId: 'b97a60cd-42fd-48b2-bfbe-9d364594c40f',
    measuresTable: 'Medidas',
    performanceDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- Meta Ads ---
VAR _meta_inv = CALCULATE(SUM('fb_campanhas'[spend]))
VAR _meta_imp = CALCULATE(SUM('fb_campanhas'[impressions]))
VAR _meta_clk = CALCULATE(SUM('fb_campanhas'[inline_link_clicks]))
VAR _meta_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Meta Ads")

// --- Google Ads ---
VAR _google_inv = CALCULATE(SUM('google_ads_campanhas'[metrics_cost]))
VAR _google_imp = CALCULATE(SUM('google_ads_campanhas'[metrics_impressions]))
VAR _google_clk = CALCULATE(SUM('google_ads_campanhas'[metrics_clicks]))
VAR _google_rec = CALCULATE(SUM('GA4_Origem'[totalrevenue]), 'GA4_Origem'[Canal] = "Google Ads")

// --- GA4 Global (fonte de verdade para receita) ---
VAR _ga4_rec   = CALCULATE(SUM('GA4_Origem'[totalrevenue]))
VAR _ga4_sess  = CALCULATE(SUM('GA4_Origem'[sessions]))
VAR _ga4_users = CALCULATE(SUM('GA4_Origem'[totalusers]))
VAR _ga4_trans = CALCULATE(SUM('GA4_Origem'[transactions]))

// --- Totais ---
VAR _inv_total = _meta_inv + _google_inv
VAR _rec_total = _ga4_rec
VAR _imp_total = _meta_imp + _google_imp
VAR _clk_total = _meta_clk + _google_clk
VAR _ctr  = IF(_imp_total > 0, DIVIDE(_clk_total, _imp_total) * 100, 0)
VAR _roas = IF(_inv_total > 0, DIVIDE(_rec_total, _inv_total), 0)
VAR _cpa  = IF(_ga4_trans > 0, DIVIDE(_inv_total, _ga4_trans), 0)

// --- Top 10 Campanhas (Meta + Google combinados) ---
VAR _meta_camp =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('fb_campanhas', 'fb_campanhas'[campaign_name]),
            "inv", CALCULATE(SUM('fb_campanhas'[spend])),
            "imp", CALCULATE(SUM('fb_campanhas'[impressions])),
            "clk", CALCULATE(SUM('fb_campanhas'[inline_link_clicks]))
        ), [inv], DESC),
        "nome", 'fb_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _google_camp =
    SELECTCOLUMNS(
        TOPN(5, ADDCOLUMNS(
            SUMMARIZE('google_ads_campanhas', 'google_ads_campanhas'[campaign_name]),
            "inv", CALCULATE(SUM('google_ads_campanhas'[metrics_cost])),
            "imp", CALCULATE(SUM('google_ads_campanhas'[metrics_impressions])),
            "clk", CALCULATE(SUM('google_ads_campanhas'[metrics_clicks]))
        ), [inv], DESC),
        "nome", 'google_ads_campanhas'[campaign_name], "inv", [inv], "imp", [imp], "clk", [clk])

VAR _all_camp = TOPN(10, UNION(_meta_camp, _google_camp), [inv], DESC)

VAR _StringBase =
    "EXPORT_MOM_EICO" &
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
    ";;conversoes=" & _ga4_trans &
    ";;conversoes_anterior=0" &
    ";;cpa=" & _cpa &
    ";;cpa_anterior=0" &
    ";;receita=" & _rec_total &
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
        ";;meta_receita=" & _meta_rec &
        ";;meta_receita_anterior=0", "") &

    IF(_google_inv > 0,
        ";;google_investimento=" & _google_inv &
        ";;google_investimento_anterior=0" &
        ";;google_impressoes=" & _google_imp &
        ";;google_impressoes_anterior=0" &
        ";;google_cliques=" & _google_clk &
        ";;google_cliques_anterior=0" &
        ";;google_receita=" & _google_rec &
        ";;google_receita_anterior=0", "") &

    ";;ga4_sessoes=" & _ga4_sess &
    ";;ga4_sessoes_anterior=0" &
    ";;ga4_usuarios=" & _ga4_users &
    ";;ga4_usuarios_anterior=0" &
    ";;ga4_transacoes=" & _ga4_trans &
    ";;ga4_transacoes_anterior=0" &
    ";;ga4_receita=" & _ga4_rec &
    ";;ga4_receita_anterior=0" &

    ";;campanhas_top10=" &
    CONCATENATEX(
        _all_camp,
        "c:" & [nome] & "|i:" & [inv] & "|im:" & [imp] & "|cl:" & [clk] & "|co:0|re:0|ro:0|cp:0",
        "||"
    ) &
    ";;END_EXPORT"

RETURN _StringBase`,
    creativeDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- M-1 (período anterior injetado pelo frontend) ---
VAR _PrevStart = {{PREV_START_DATE}}
VAR _PrevEnd = {{PREV_END_DATE}}

VAR _AdList = DISTINCT(SELECTCOLUMNS('fb_ads', "ad_id", 'fb_ads'[ad_id], "ad_name", 'fb_ads'[ad_name]))

VAR _CreativeTable =
    FILTER(
        GENERATE(
            _AdList,
            VAR _CurrentAdId = [ad_id]
            RETURN
                CALCULATETABLE(
                    ROW(
                        "Invest",    SUM('fb_ads'[spend]),
                        "InvestAnt", CALCULATE(SUM('fb_ads'[spend]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Impres",    SUM('fb_ads'[impressions]),
                        "ImpresAnt", CALCULATE(SUM('fb_ads'[impressions]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "Clicks",    SUM('fb_ads'[inline_link_clicks]),
                        "ClicksAnt", CALCULATE(SUM('fb_ads'[inline_link_clicks]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                        "DifCriativo", DATEDIFF(MIN('fb_ads'[metric_date]), MAX('fb_ads'[metric_date]), DAY) + 1,
                        "thumbnail_url", LOOKUPVALUE('fb_ad'[creative_thumbnail_url], 'fb_ad'[ad_id], _CurrentAdId)
                    ),
                    'fb_ads'[ad_id] = _CurrentAdId
                )
        ),
        [Invest] > 0 && NOT(ISBLANK([thumbnail_url]))
    )

VAR _FinalString =
    "EXPORT_CREATIVOS_FULL_MOM" &
    ";;plataforma=Meta Ads" &
    ";;periodo_inicio=" & _Inicio &
    ";;periodo_fim=" & _Fim &
    ";;detalhamento_criativos=" &
    CONCATENATEX(
        TOPN(30, _CreativeTable, [Invest], DESC),
        "n:" & [ad_name] &
        " | i:" & [Invest] &
        " | i_ant:" & [InvestAnt] &
        " | im:" & [Impres] &
        " | im_ant:" & [ImpresAnt] &
        " | cl:" & [Clicks] &
        " | cl_ant:" & [ClicksAnt] &
        " | co:0 | re:0" &
        " | dif_criativo:" & [DifCriativo] &
        " | url:" & [thumbnail_url],
        "||"
    ) &
    ";;END_EXPORT"
RETURN _FinalString`
  },

  {
    id: 'serasa_pme',
    name: 'Serasa PME',
    slug: 'serasa',
    datasetId: '447f0614-34ff-42e8-953f-ad12901616f8',
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
RETURN _FinalString`
  },

  // ─── B3 — Creative-Only (upload manual de imagens) ───────────────────────
  {
    id: 'b3',
    name: 'B3',
    slug: 'b3',
    creativesOnly: true,
    datasetId: '',
    measuresTable: '',
    performanceDax: '',
    creativeDax: '',
  },
];
