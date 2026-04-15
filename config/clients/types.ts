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
