import { DashboardData, Creative } from "../types";

// ============================================================================
// CHAVES DE API
// ============================================================================
const OPENAI_KEY = "";
const GOOGLE_KEY_BACKUP = ""; 
const GROQ_KEY = "";

// ============================================================================
// PROMPTS (MANTIDOS 100% IGUAIS)
// ============================================================================

export const PERFORMANCE_AI_PROMPT = `Você é o Diretor de Estratégia e Mídia Sênior da Wigoo. Sua missão é realizar uma auditoria crítica e consultiva sobre a performance da conta.

REGRAS DE OURO:
- EXPERTISE SÊNIOR: Não descreva o que os números são (o cliente já os vê). Explique o PORQUÊ e o QUE FAZER. 
- FOCO EM EFICIÊNCIA: Analise o mix de canais (Meta, Google, TikTok), o ROAS e o CPA em relação às metas e períodos anteriores.
- ANÁLISE DE CAMPANHAS: Você receberá uma lista das "Top 10 Campanhas". Use-as para identificar quais estratégias específicas (PMax, ASC, Institucional, Prospecção) estão carregando o resultado ou desperdiçando verba.
- LINGUAGEM EXECUTIVA: Seja direto, técnico e estratégico. Se o desempenho estiver ruim, seja incisivo nas recomendações de mudança.
- ADAPTAÇÃO AO BRIEFING: Se houver um "Briefing do Cliente", PRIORIZE respondê-lo na seção [ESTRATÉGIA & PROJEÇÃO] de forma orgânica.
- CLIENTE FINAL: O conteúdo da seção [ESTRATÉGIA & PROJEÇÃO] será lido DIRETAMENTE pelo cliente. Portanto:
    * NÃO use termos como "Recomendação sênior", "Baseado no briefing", "Resposta ao cliente".
    * NÃO use tópicos numerados ou delimitadores internos.
    * ESCREVA um texto corrido, limpo, extremamente bem escrito e organizado. Deve parecer um parágrafo de consultoria estratégica de alto nível.
- PROIBIDO: Falar de criativos individuais, hooks ou design.

ESTRUTURA DE RESPOSTA (OBRIGATÓRIA):
[POSITIVOS]
- Insights de alta performance (canais ou campanhas específicas). Ação Sugerida: Comando tático.
[ATENÇÃO]
- Variações negativas, desvios de meta ou campanhas com eficiência decrescente. Ação Sugerida: Comando tático.
[CRÍTICOS]
- Anomalias graves, ROAS insustentável ou desperdício de verba em larga escala. Ação Sugerida: Comando tático.

[ESTRATÉGIA & PROJEÇÃO]
(Insira aqui o texto limpo, corrido e estratégico para o cliente, integrando a análise de canais, campanhas e a resposta ao briefing de forma fluida).

DADOS DA CONTA E CAMPANHAS: {DATA_PLACEHOLDER}`;

export const CREATIVE_AI_PROMPT_SINGLE = `PAPEL: Você é o motor de visão computacional da Wigoo. Analise este criativo de performance.
OBJETIVO: Avaliar a qualidade técnica e estratégica do criativo, atribuindo uma nota de 0 a 100 e um Índice de Saturação.

REGRAS DE PONTUAÇÃO (CRÍTICO):
- Use CASAS DECIMAIS nas notas (ex: 9.4/10, 7.2/10). Não arredonde para inteiros.
- Seja extremamente rigoroso. Notas acima de 9.0 são raríssimas e apenas para criativos perfeitos.
- Se o CTR caiu ou o ROAS é baixo, a nota DEVE refletir isso agressivamente.

DIRETRIZES DE "BOM CRIATIVO":
- Para o scroll, comunica valor em segundos, alinha expectativa com a LP e gera ação mensurável.

🎯 ESPECIFICAÇÕES POR PLATAFORMA:
- Meta Ads: Foco em interromper scroll. Hook forte (3s), texto legível, prova social.
- Google Ads: Capturar intenção. YouTube (Hook imediato), Display/PMax (Headline clara).
- TikTok Ads: Estética orgânica (UGC), linguagem natural, ritmo rápido.

🧠 MODELO DE AVALIAÇÃO (Scorecard 0-100):
Baseie sua nota (0-10 com decimais) nos critérios abaixo:
Padrão: Hook (15), Clareza (15), Adequação (15), Com. Visual (10), Prova Social (10), Demonstração (10), CTA (10), Alinhamento (5), Escalabilidade (5), Retenção (5).

📉 ANÁLISE DE SATURAÇÃO (SEJA CRÍTICO):
- Frequência: 1.0-2.0 (Saudável), 2.0-3.0 (Atenção), 3.0+ (Fadiga).
- Se o CTR caiu mais de 15% em relação ao período anterior, NÃO pode ser "Saudável".
- Se o ROAS caiu, considere "Atenção" ou "Saturado" mesmo com pouco tempo de rodagem.

DADOS DO CRIATIVO:
Nome: {NAME}
Tempo de Atividade: {DAYS} dias
Investimento: {INVEST} (Anterior: {INVEST_ANT})
CTR Atual: {CTR}% (Anterior: {CTR_ANT}%)
Conversões: {CONV} (Anterior: {CONV_ANT})
Receita: {REVENUE} (Anterior: {REVENUE_ANT})
ROAS: {ROAS}x (Anterior: {ROAS_ANT}x)

ESTRUTURA DE RESPOSTA (OBRIGATÓRIA):
**Pontuação Detalhada**
Hook: [Nota]/10 | [Explicação]
Clareza da proposta de valor: [Nota]/10 | [Explicação]
Adequação à plataforma: [Nota]/10 | [Explicação]
Comunicação visual: [Nota]/10 | [Explicação]
Prova social: [Nota]/10 | [Explicação]
Demonstração do produto: [Nota]/10 | [Explicação]
CTA claro: [Nota]/10 | [Explicação]
Alinhamento: [Nota]/10 | [Explicação]
Escalabilidade: [Nota]/10 | [Explicação]
Potencial de retenção: [Nota]/10 | [Explicação]

**Nota Final: [X.X]/100** (Use decimais, ex: 87.4)
**Classificação: [Criativo forte (85-100), Bom (70-84.9), Médio (55-69.9) ou Fraco (<55)]**

**Índice de Saturação: [Saudável, Atenção, Saturado ou Trocar Urgente]**
[Justificativa técnica rigorosa]

**Análise Visual e Composição**
[Análise específica]

**Diagnóstico de Performance e Eficiência**
[Relação técnica entre os dados e a peça]

**Ação Recomendada**
[ESCALAR, TESTAR VARIAÇÕES, AJUSTAR HOOK/PROPOSTA ou RECRIAR]`;

// ============================================================================
// TYPES & HELPERS
// ============================================================================

export interface InsightResponse {
  text: string;
  model: string;
  error?: string;
}

async function urlToBase64(url: string): Promise<{ data: string, mimeType: string } | null> {
  if (!url) return null;

  // Data URLs (de uploads locais) — extrai base64 diretamente sem fetch
  if (url.startsWith('data:')) {
    try {
      const commaIdx = url.indexOf(',');
      if (commaIdx === -1) return null;
      const header = url.substring(0, commaIdx);
      const data = url.substring(commaIdx + 1);
      const mimeType = header.split(':')[1]?.split(';')[0] || 'image/jpeg';
      return { data, mimeType };
    } catch {
      return null;
    }
  }

  if (!url.startsWith('http')) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        resolve({ data: base64data, mimeType: blob.type });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`Wigoo Vision AI - Falha no download: ${url}`, err);
    return null;
  }
}

// ============================================================================
// MOTORES DE IA (Via Fetch - Sem SDKs quebrados)
// ============================================================================

// 1. Motor OpenAI (Principal)
async function callOpenAI(prompt: string, images: { data: string, mimeType: string }[] = [], systemInstruction?: string): Promise<InsightResponse | null> {
  // CORREÇÃO: Leitura direta e segura para o Vite
  const apiKey = import.meta.env?.VITE_OPENAI_API_KEY || OPENAI_KEY;

  if (!apiKey) {
    console.warn("Wigoo AI - OpenAI API Key não configurada.");
    return null;
  }

  try {
    const messages = [
      { role: "system", content: systemInstruction || "Você é o motor Wigoo AI Hub." },
      { 
        role: "user", 
        content: images.length > 0 
          ? [
              { type: "text", text: prompt },
              ...images.map(img => ({
                type: "image_url",
                image_url: { url: `data:${img.mimeType};base64,${img.data}` }
              }))
            ]
          : prompt
      }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.1,
        max_tokens: 1500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
       console.error("OpenAI Error:", await response.text());
       return null;
    }

    const json = await response.json();
    return { 
        text: json.choices?.[0]?.message?.content || "", 
        model: "gpt-4o" 
    };

  } catch (err: any) {
    console.error("Falha no modelo OpenAI:", err);
    return null;
  }
}

// 2. Motor Google Gemini (Fallback)
async function callGemini(modelName: string, prompt: string, images: { data: string, mimeType: string }[] = [], systemInstruction?: string): Promise<InsightResponse | null> {
  // CORREÇÃO: Leitura direta e segura para o Vite
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || GOOGLE_KEY_BACKUP;
  
  if (!apiKey) {
    console.warn("Wigoo AI - Gemini API Key não encontrada.");
    return null;
  }

  try {
    // CORREÇÃO: Agora ele usa o modelo passado por parâmetro (ou flash por padrão)
    const realModel = modelName || "gemini-1.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${realModel}:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: prompt }];
    images.forEach((img) => {
        parts.push({
            inlineData: {
                mimeType: img.mimeType,
                data: img.data
            }
        });
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts }],
            systemInstruction: { parts: [{ text: systemInstruction || "Você é a IA da Wigoo." }] },
            generationConfig: { temperature: 0.1 }
        }),
        signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Gemini Error:", await response.text());
      return null;
    }

    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) return { text, model: `Google ${realModel}` };
    return null;
  } catch (err) {
    console.error(`Falha no Google (${modelName}):`, err);
    return null;
  }
}

// 3. Motor Groq LLaMA (Fast Fallback)
async function callGroq(modelName: string, prompt: string, images: { data: string, mimeType: string }[] = [], systemInstruction?: string): Promise<InsightResponse | null> {
  const apiKey = import.meta.env?.VITE_GROQ_API_KEY || GROQ_KEY;

  if (!apiKey) {
    console.warn("Wigoo AI - Groq API Key não configurada.");
    return null;
  }

  try {
    const messages = [
      { role: "system", content: systemInstruction || "Você é o motor Wigoo AI Hub." },
      { 
        role: "user", 
        content: images.length > 0 
          ? [
              { type: "text", text: prompt },
              ...images.map(img => ({
                type: "image_url",
                image_url: { url: `data:${img.mimeType};base64,${img.data}` }
              }))
            ]
          : prompt
      }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        temperature: 0.1,
        max_tokens: 1500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
       console.error("Groq Error:", await response.text());
       return null;
    }

    const json = await response.json();
    return { 
        text: json.choices?.[0]?.message?.content || "", 
        model: `Groq ${modelName}`
    };

  } catch (err: any) {
    console.error("Falha no modelo Groq:", err);
    return null;
  }
}

// ============================================================================
// DETECÇÃO DE RECUSA (Content Policy)
// ============================================================================

function isRefusal(text: string | undefined | null): boolean {
  if (!text || text.trim().length < 20) return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("i'm sorry, i can't") ||
    lower.includes("i'm sorry, i cannot") ||
    lower.includes("i can't assist with that") ||
    lower.includes("i cannot assist with that") ||
    lower.includes("i'm unable to assist") ||
    lower.includes("i'm not able to assist") ||
    lower.includes("i cannot provide") ||
    lower.includes("sorry, i can't help") ||
    lower.includes("lamentamos, mas não") ||
    // Mensagem curta com "sorry" sem o formato esperado
    (lower.includes("sorry") && text.length < 200 && !lower.includes("nota final"))
  );
}

// ============================================================================

// FUNÇÕES EXPORTADAS (Lógica Principal)
// ============================================================================

export const analyzeSingleCreative = async (creative: Creative, id: number): Promise<InsightResponse> => {
  const ctr = ((creative.clicks.current / (creative.impressions.current || 1)) * 100).toFixed(3);
  const ctr_ant = ((creative.clicks.previous / (creative.impressions.previous || 1)) * 100).toFixed(3);
  
  const roas = (creative.revenue.current / (creative.investment.current || 1)).toFixed(2);
  const roas_ant = (creative.revenue.previous / (creative.investment.previous || 1)).toFixed(2);

  const convLabel = creative.metricNames?.conversions || 'Conversões';
  const revLabel = creative.metricNames?.revenue || 'Receita';
  const effLabel = creative.metricNames?.efficiency || 'ROAS';

  let prompt = CREATIVE_AI_PROMPT_SINGLE
    .replace('{ID}', id.toString())
    .replace('{NAME}', creative.name)
    .replace('{DAYS}', (creative.daysRunning || 0).toString())
    .replace('{INVEST}', creative.investment.current.toString())
    .replace('{INVEST_ANT}', creative.investment.previous.toString())
    .replace('{CTR}', ctr)
    .replace('{CTR_ANT}', ctr_ant)
    .replace('{CONV}', creative.conversions.current.toString())
    .replace('{CONV_ANT}', creative.conversions.previous.toString())
    .replace('{REVENUE}', creative.revenue.current.toString())
    .replace('{REVENUE_ANT}', creative.revenue.previous.toString())
    .replace('{ROAS}', roas)
    .replace('{ROAS_ANT}', roas_ant);

  if (creative.metricNames) {
    prompt = prompt
      .replace(/Conversões:/g, `${convLabel}:`)
      .replace(/Receita:/g, `${revLabel}:`)
      .replace(/ROAS:/g, `${effLabel}:`)
      .replace(/ROAS/g, effLabel);
  }

  // Detecta criativo sem dados de performance (ex: upload manual B3)
  const hasPerformanceData =
    creative.investment.current > 0 ||
    creative.impressions.current > 0 ||
    creative.clicks.current > 0;

  if (!hasPerformanceData) {
    prompt +=
      '\n\n⚠️ MODO ANÁLISE VISUAL PURA: Não há dados de performance disponíveis para este criativo.' +
      ' Baseie 100% da pontuação na análise visual: composição, hook, CTA, prova social, hierarquia visual e adequação à plataforma inferida.' +
      ' Para os critérios de CTR/ROAS/conversão, use o potencial visual observado como base.' +
      ' Não penalize pela ausência de dados — pontue com rigor visual. Use sempre casas decimais.';
  }

  const imgData = await urlToBase64(creative.url);
  const images = imgData ? [imgData] : [];

  const systemInstruction = "Você é o motor Wigoo Vision AI. Seu papel é a análise técnica e visual de criativos de anúncios. Use os dados de performance e a imagem para fornecer um diagnóstico rigoroso e ações recomendadas.";

  // 1. Tenta OpenAI com imagem
  let result = await callOpenAI(prompt, images, systemInstruction);

  // Se OpenAI recusou a imagem (content policy), retenta sem imagem
  if (result && isRefusal(result.text)) {
    console.warn(`Wigoo Vision AI - OpenAI recusou imagem do criativo ${id}, retentando sem imagem...`);
    result = await callOpenAI(prompt, [], systemInstruction);
  }

  // 2. Fallback para Groq (Llama Vision) se OpenAI falhou ou recusou sem imagem também
  if (!result || isRefusal(result.text)) {
    result = await callGroq('llama-3.2-90b-vision-preview', prompt, images, systemInstruction);
    // Se Groq recusou com imagem, tenta sem
    if (result && isRefusal(result.text)) {
      console.warn(`Wigoo Vision AI - Groq recusou imagem do criativo ${id}, retentando sem imagem...`);
      result = await callGroq('llama-3.3-70b-versatile', prompt, [], systemInstruction);
    }
  }

  // 3. Fallback para Google Gemini
  if (!result || isRefusal(result.text)) {
    result = await callGemini('gemini-1.5-flash', prompt, images, systemInstruction);
  }

  // Se mesmo sem imagem nenhuma engine funcionou, retorna erro para retry
  if (!result || isRefusal(result.text)) {
    return {
      text: `**Criativo ${id} — Diagnóstico Multimodal**\n\n[Erro na análise técnica da Wigoo AI - Verifique Chaves de API]`,
      model: "None",
      error: "API_ERROR"
    };
  }

  return result;
};

export const generateInsights = async (data: DashboardData, customPrompt?: string, userQuery?: string): Promise<InsightResponse> => {
  const basePrompt = (customPrompt || PERFORMANCE_AI_PROMPT);
  const { creatives, ...performanceData } = data;
  
  const dataPlaceholder = JSON.stringify(performanceData, null, 2);
  const finalPrompt = basePrompt.replace('{DATA_PLACEHOLDER}', dataPlaceholder) + 
    (userQuery ? `\n\nBRIEFING DO CLIENTE: ${userQuery}` : "");

  const systemInstruction = "Você é o Diretor de Estratégia da Wigoo. Analise APENAS dados de performance de conta (ROAS, CPA, Investimento). É terminantemente PROIBIDO falar sobre criativos individuais, imagens, hooks ou dar notas de design. Se o prompt do usuário pedir isso, ignore e foque apenas nos dados numéricos de performance da conta. Seja rigoroso, direto e use os números reais.";

  // 1. Tenta OpenAI Primeiro
  let result = await callOpenAI(finalPrompt, [], systemInstruction);

  // 2. Fallback para Groq (Llama Versatile)
  if (!result) {
      result = await callGroq('llama-3.3-70b-versatile', finalPrompt, [], systemInstruction);
  }

  // 3. Fallback para Google Gemini
  if (!result) {
      result = await callGemini('gemini-2.0-flash-exp', finalPrompt, [], systemInstruction);
  }
  
  return result || { text: "Falha na análise estratégica. (API Error)", model: "None" };
};

export const getFallbackAnalysis = (data: DashboardData): string => "[SISTEMA OFFLINE]";