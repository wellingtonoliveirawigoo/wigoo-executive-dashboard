/**
 * Configuração para geração dinâmica de DAX de performance.
 * Usado por buildPerformanceDax() em performance.ts.
 */
export interface PerformanceDaxConfig {
  /** Prefixo da string de exportação. Ex: 'EXPORT_MOM_DABELLE' */
  exportTag: string;
  /** Cliente tem TikTok Ads? Default: false */
  hasTikTok?: boolean;
  /**
   * Como calcular _rec_total (base para ROAS/receita):
   * - 'ga4_total'   → SUM(GA4_Origem[totalrevenue])              (default — maioria dos clientes)
   * - 'ga4_channel' → _meta_rec + _google_rec (soma por canal)    (ex: Gama Italy)
   */
  revenueMode?: 'ga4_total' | 'ga4_channel';
}

/**
 * Configuração para geração dinâmica de DAX de criativos.
 * Usado por buildCreativeDax() em creative.ts.
 */
export interface CreativeDaxConfig {
  /** Cliente tem campo value_purchase em fb_ads? Default: false */
  hasValuePurchase?: boolean;
}
