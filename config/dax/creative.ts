import { CreativeDaxConfig } from './types';

/**
 * Gera a DAX de criativos padrão (cobre ~90% dos clientes Wigoo).
 *
 * Tabelas esperadas no dataset Power BI:
 *   fb_ads, fb_ad (para creative_thumbnail_url), dCalendario
 *
 * Para clientes com schema diferente (C&A, Serasa PME), manter DAX literal
 * no arquivo de configuração do cliente.
 */
export function buildCreativeDax(cfg: CreativeDaxConfig = {}): string {
  const recField = cfg.hasValuePurchase
    ? "SUM('fb_ads'[value_purchase])"
    : '0';

  return `
VAR _Inicio    = "{{START_DATE_FORMATTED}}"
VAR _Fim       = "{{END_DATE_FORMATTED}}"
VAR _PrevStart = {{PREV_START_DATE}}
VAR _PrevEnd   = {{PREV_END_DATE}}

VAR _AdList = DISTINCT(SELECTCOLUMNS('fb_ads',
    "ad_id",   'fb_ads'[ad_id],
    "ad_name", 'fb_ads'[ad_name]))

VAR _CreativeTable =
    FILTER(
        GENERATE(
            _AdList,
            VAR _id = [ad_id]
            RETURN CALCULATETABLE(
                ROW(
                    "Invest",      SUM('fb_ads'[spend]),
                    "InvestAnt",   CALCULATE(SUM('fb_ads'[spend]),
                                       FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                    "Impres",      SUM('fb_ads'[impressions]),
                    "ImpresAnt",   CALCULATE(SUM('fb_ads'[impressions]),
                                       FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                    "Clicks",      SUM('fb_ads'[inline_link_clicks]),
                    "ClicksAnt",   CALCULATE(SUM('fb_ads'[inline_link_clicks]),
                                       FILTER(ALL('dCalendario'), 'dCalendario'[Date] >= _PrevStart && 'dCalendario'[Date] <= _PrevEnd)),
                    "Rec",         ${recField},
                    "DifCriativo", DATEDIFF(MIN('fb_ads'[metric_date]), MAX('fb_ads'[metric_date]), DAY) + 1,
                    "thumb",       LOOKUPVALUE('fb_ad'[creative_thumbnail_url], 'fb_ad'[ad_id], _id)
                ),
                'fb_ads'[ad_id] = _id
            )
        ),
        [Invest] > 0 && NOT(ISBLANK([thumb]))
    )

RETURN
    "EXPORT_CREATIVOS_FULL_MOM" &
    ";;plataforma=Meta Ads" &
    ";;periodo_inicio=" & _Inicio & ";;periodo_fim=" & _Fim &
    ";;detalhamento_criativos=" &
    CONCATENATEX(
        TOPN(30, _CreativeTable, [Invest], DESC),
        "n:" & [ad_name] &
        " | i:"          & [Invest]    & " | i_ant:"  & [InvestAnt] &
        " | im:"         & [Impres]    & " | im_ant:" & [ImpresAnt] &
        " | cl:"         & [Clicks]    & " | cl_ant:" & [ClicksAnt] &
        " | co:0 | re:"  & [Rec] &
        " | dif_criativo:" & [DifCriativo] &
        " | url:"        & [thumb],
        "||") &
    ";;END_EXPORT"`;
}
