
import { ClientConfig } from '../config/clients';

export const executePowerBiQuery = async (
  client: ClientConfig, 
  startDate: string, 
  endDate: string, 
  mode: 'performance' | 'creative'
) => {
  const start = startDate.split('-').map(Number);
  const end = endDate.split('-').map(Number);

  // Formata as datas para dd/MM/yyyy (exibição na string do export)
  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };
  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  // Calcula YoY (mesmo período deslocado 1 ano para trás)
  const startDateObj = new Date(start[0], start[1] - 1, start[2]);
  const endDateObj = new Date(end[0], end[1] - 1, end[2]);
  const prevStartObj = new Date(startDateObj);
  prevStartObj.setFullYear(prevStartObj.getFullYear() - 1);
  const prevEndObj = new Date(endDateObj);
  prevEndObj.setFullYear(prevEndObj.getFullYear() - 1);

  const prevStart = [prevStartObj.getFullYear(), prevStartObj.getMonth() + 1, prevStartObj.getDate()];
  const prevEnd = [prevEndObj.getFullYear(), prevEndObj.getMonth() + 1, prevEndObj.getDate()];
  const prevStartFormatted = `${String(prevStartObj.getDate()).padStart(2,'0')}/${String(prevStartObj.getMonth()+1).padStart(2,'0')}/${prevStartObj.getFullYear()}`;
  const prevEndFormatted = `${String(prevEndObj.getDate()).padStart(2,'0')}/${String(prevEndObj.getMonth()+1).padStart(2,'0')}/${prevEndObj.getFullYear()}`;

  const baseDax = mode === 'creative' ? client.creativeDax : client.performanceDax;

  // Substitui os placeholders de data na DAX (para dados atuais)
  const injectedDax = baseDax
    .replace(/{{START_DATE_FORMATTED}}/g, startDateFormatted)
    .replace(/{{END_DATE_FORMATTED}}/g, endDateFormatted)
    .replace(/{{START_DATE_DAX}}/g, `DATE(${start[0]}, ${start[1]}, ${start[2]})`)
    .replace(/{{END_DATE_DAX}}/g, `DATE(${end[0]}, ${end[1]}, ${end[2]})`)
    .replace(/{{PREV_START_DATE}}/g, `DATE(${prevStart[0]}, ${prevStart[1]}, ${prevStart[2]})`)
    .replace(/{{PREV_END_DATE}}/g, `DATE(${prevEnd[0]}, ${prevEnd[1]}, ${prevEnd[2]})`);

  // Query principal (período atual)
  const query = `
DEFINE
    MEASURE '${client.measuresTable}'[Wigoo_Live_Export] = 
        ${injectedDax}

EVALUATE
    CALCULATETABLE(
        ROW("Result", '${client.measuresTable}'[Wigoo_Live_Export]),
        'dCalendario'[Date] >= DATE(${start[0]}, ${start[1]}, ${start[2]}),
        'dCalendario'[Date] <= DATE(${end[0]}, ${end[1]}, ${end[2]})
    )
`;

  console.log('Power BI Query Mode:', mode);

  // ===== Executa query do período atual =====
  const response = await fetch('/api/pbi/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataset_id: client.datasetId,
      dax_query: query
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Erro HTTP ${response.status} ao consultar Power BI. ${errorText}`);
  }

  const result = await response.json();
  console.log('Power BI API Raw Result:', result);
  
  let exportString = extractExportString(result);
  if (!exportString) {
    throw new Error('Nenhum dado retornado do Power BI. Verifique o dataset_id e as permissões.');
  }

  // Detecta erros DAX
  const lowerText = exportString.toLowerCase();
  if ((lowerText.includes('error') || lowerText.includes('erro')) && !exportString.includes('EXPORT')) {
    console.error('Power BI DAX Error:', exportString);
    throw new Error(`Erro DAX do Power BI: ${exportString.substring(0, 300)}`);
  }

  // ===== Para Performance, executa M-1 como query separada =====
  if (mode === 'performance') {
    try {
      // Reutiliza a MESMA DAX mas com CALCULATETABLE filtrado pelo período M-1
      const m1Dax = baseDax
        .replace(/{{START_DATE_FORMATTED}}/g, prevStartFormatted)
        .replace(/{{END_DATE_FORMATTED}}/g, prevEndFormatted)
        .replace(/{{PREV_START_DATE}}/g, `DATE(${prevStart[0]}, ${prevStart[1]}, ${prevStart[2]})`)
        .replace(/{{PREV_END_DATE}}/g, `DATE(${prevEnd[0]}, ${prevEnd[1]}, ${prevEnd[2]})`);

      const m1Query = `
DEFINE
    MEASURE '${client.measuresTable}'[Wigoo_M1_Export] = 
        ${m1Dax}

EVALUATE
    CALCULATETABLE(
        ROW("Result", '${client.measuresTable}'[Wigoo_M1_Export]),
        'dCalendario'[Date] >= DATE(${prevStart[0]}, ${prevStart[1]}, ${prevStart[2]}),
        'dCalendario'[Date] <= DATE(${prevEnd[0]}, ${prevEnd[1]}, ${prevEnd[2]})
    )
`;

      console.log('Power BI M-1 Query - Executing...');
      const m1Response = await fetch('/api/pbi/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: client.datasetId,
          dax_query: m1Query
        })
      });

      if (m1Response.ok) {
        const m1Result = await m1Response.json();
        console.log('Power BI M-1 Raw Result:', m1Result);
        
        const m1String = extractExportString(m1Result);
        if (m1String && m1String.includes('EXPORT')) {
          // Extrai as métricas YoY e as injeta como _anterior no exportString atual
          exportString = mergeM1IntoExport(exportString, m1String);
          console.log('YoY data merged successfully');
        }
      }
    } catch (e) {
      console.warn('M-1 query failed (non-critical):', e);
    }
  }

  return exportString;
};

function extractExportString(result: any): string | null {
  // Formato: { rows: [{ "Result": "EXPORT_..." }], row_count: 1 }
  if (result.rows && Array.isArray(result.rows) && result.rows.length > 0) {
    const firstRow = result.rows[0];
    
    // Tenta "Result", "[Result]" ou pega o primeiro valor do objeto (caso o nome da coluna mude)
    if (firstRow.Result) return firstRow.Result;
    if (firstRow['[Result]']) return firstRow['[Result]'];
    
    const values = Object.values(firstRow);
    if (values.length > 0 && typeof values[0] === 'string') return values[0] as string;
  }

  // Fallbacks para outros formatos conhecidos da API
  if (result.result?.content?.[0]?.text) return result.result.content[0].text;
  if (result.executionResult?.Tables?.[0]?.Rows?.[0]?.[0]) return result.executionResult.Tables[0].Rows[0][0];
  if (Array.isArray(result) && result[0]?.Result) return result[0].Result;
  if (result.Result) return result.Result;
  return null;
}

function mergeM1IntoExport(currentExport: string, m1Export: string): string {
  // Parseia os key-values do export M-1
  const m1Parts = m1Export.split(';;');
  const m1KV: Record<string, string> = {};
  for (const part of m1Parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx > 0) {
      m1KV[part.substring(0, eqIdx).trim()] = part.substring(eqIdx + 1).trim();
    }
  }

  // Mapeamento: campo do M-1 → campo _anterior a injetar
  const metricsToMerge = [
    'investimento', 'impressoes', 'cliques', 'conversoes', 'cpa', 'receita', 'roas', 'ctr',
    'meta_investimento', 'meta_receita',
    'google_investimento', 'google_receita',
    'tiktok_investimento', 'tiktok_receita',
    'awin_investimento', 'awin_receita',
    'criteo_investimento', 'criteo_receita',
    'rtb_investimento', 'rtb_receita',
    'pinterest_investimento', 'pinterest_receita',
    'meliuz_investimento', 'meliuz_receita',
    'ga4_sessoes', 'ga4_usuarios', 'ga4_transacoes', 'ga4_receita', 'ga4_tx_conversao', 'ga4_ticket_medio',
    'vtex_receita', 'vtex_pedidos', 'vtex_ticket_medio'
  ];

  let enrichedExport = currentExport;
  
  for (const metric of metricsToMerge) {
    const anteriorKey = `${metric}_anterior`;
    const m1Value = m1KV[metric];
    
    if (m1Value !== undefined && m1Value !== '' && m1Value !== '0') {
      // Substitui o _anterior=0 existente com o valor real do M-1
      const regex = new RegExp(`;;${anteriorKey}=[^;]*`, 'g');
      if (enrichedExport.includes(`;;${anteriorKey}=`)) {
        enrichedExport = enrichedExport.replace(regex, `;;${anteriorKey}=${m1Value}`);
      } else {
        // Se não existe, insere após o campo atual
        const currentMetricRegex = new RegExp(`(;;${metric}=[^;]*)`, '');
        const match = enrichedExport.match(currentMetricRegex);
        if (match) {
          enrichedExport = enrichedExport.replace(match[0], `${match[0]};;${anteriorKey}=${m1Value}`);
        }
      }
    }
  }

  return enrichedExport;
}
