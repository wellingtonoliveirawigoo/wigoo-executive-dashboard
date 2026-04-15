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
  /** Workspace Power BI (UUID). Necessário quando o dataset está num workspace sem acesso global. */
  workspaceId?: string;
  /**
   * Nome da tabela calendário + coluna de data, separados por ponto.
   * Formato: "nomeDaTabela.nomeColuna"  Ex: "d_calendario.data"
   * Padrão automático: tenta ['dCalendario.Date', 'd_calendario.data', 'Calendario.Date']
   * Use '' (vazio) para desativar o filtro de datas (DAX gerencia internamente).
   */
  calendarTable?: string;
  /** Dataset BigQuery (ex: 'CasaDaToalha'). Se definido, usa como fallback após Power BI. */
  bqDataset?: string;
}
