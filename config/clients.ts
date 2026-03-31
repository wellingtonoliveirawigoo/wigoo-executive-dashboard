
export interface ClientConfig {
  id: string;
  name: string;
  datasetId: string;
  measuresTable: string;
  performanceDax: string;
  creativeDax: string;
}

export const CLIENTS: ClientConfig[] = [
  {
    id: 'cea',
    name: 'C&A',
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

VAR _CreativeTable = 
    FILTER(
        ADDCOLUMNS(
            SUMMARIZE(
                'meta_ads_cea_images',
                'meta_ads_cea_images'[ad_name],
                'meta_ads_cea_images'[thumbnail_url]
            ),
            "Invest", CALCULATE(SUM('meta_ads_cea_images'[spend])),
            "Impres", CALCULATE(SUM('meta_ads_cea_images'[impressions])),
            "Clicks", CALCULATE(SUM('meta_ads_cea_images'[clicks])),
            "Conv", CALCULATE(SUM('meta_ads_cea_images'[actions_offsite_conversion_fb_pixel_purchase])),
            "Rec", CALCULATE([ReceitaGA]),
            "DifCriativo", CALCULATE(DATEDIFF(MIN('meta_ads_cea_images'[date]), MAX('meta_ads_cea_images'[date]), DAY)) + 1
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
    id: 'serasa_pme',
    name: 'Serasa PME',
    datasetId: '', // Dataset ID provisionally empty
    measuresTable: '_Medidas',
    performanceDax: `
// Performance DAX for Serasa PME (Placeholder)
// Same logic as C&A can be adapted here when metrics are ready
`,
    creativeDax: `
// --- Período (injetado pelo frontend) ---
VAR _Inicio = "{{START_DATE_FORMATTED}}"
VAR _Fim = "{{END_DATE_FORMATTED}}"

// --- M-1 (período anterior injetado pelo frontend) ---
VAR _PrevStart = {{PREV_START_DATE}}
VAR _PrevEnd = {{PREV_END_DATE}}

VAR _CreativeTable = 
    FILTER(
        ADDCOLUMNS(
            SUMMARIZE(
                'meta_ads_serasa_pme', 
                'meta_ads_serasa_pme'[ad_name],
                'meta_ads_serasa_pme'[thumbnail_url]
            ),
            "Invest", CALCULATE(SUM('meta_ads_serasa_pme'[spend])),
            "InvestAnt", CALCULATE(SUM('meta_ads_serasa_pme'[spend]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
            "Impres", CALCULATE(SUM('meta_ads_serasa_pme'[impressions])),
            "ImpresAnt", CALCULATE(SUM('meta_ads_serasa_pme'[impressions]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
            "Clicks", CALCULATE(SUM('meta_ads_serasa_pme'[clicks])),
            "ClicksAnt", CALCULATE(SUM('meta_ads_serasa_pme'[clicks]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
            "Visits", CALCULATE(SUM('meta_ads_serasa_pme'[sessions])),
            "VisitsAnt", CALCULATE(SUM('meta_ads_serasa_pme'[sessions]), FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
            "CPS", DIVIDE([Invest], [Visits]),
            "CPSAnt", DIVIDE([InvestAnt], [VisitsAnt]),
            "DifCriativo", CALCULATE(DATEDIFF(MIN('meta_ads_serasa_pme'[date]), MAX('meta_ads_serasa_pme'[date]), DAY)) + 1
        ),
        [Invest] > 0
    )

VAR _FinalString = 
    "EXPORT_CREATIVOS_FULL_MOM" &
    ";;plataforma=Meta Ads" &
    ";;periodo_inicio=" & _Inicio &
    ";;periodo_fim=" & _Fim &
    ";;periodo_inicio_anterior=" & _PrevStart &
    ";;periodo_fim_anterior=" & _PrevEnd &
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
        " | visit:" & [Visits] &
        " | visit_ant:" & [VisitsAnt] &
        " | cps:" & [CPS] &
        " | cps_ant:" & [CPSAnt] &
        " | dif_criativo:" & [DifCriativo] &
        " | url:" & [thumbnail_url],
        "||"
    ) &
    ";;END_EXPORT"
RETURN _FinalString`
  }
];
