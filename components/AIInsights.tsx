import React, { useEffect, useState, useMemo } from 'react';
import { generateInsights, getFallbackAnalysis } from '../services/gemini';
import { DashboardData } from '../types';
import { formatTokenCount } from '../utils/tokenStorage';

interface AIInsightsProps {
  data: DashboardData;
  insights: string;
  modelName?: string;
  setInsights: (val: string, model?: string, tokens?: number) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  customPrompt?: string;
  userQuery?: string;
  clientId?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  data,
  insights,
  modelName,
  setInsights,
  isLoading,
  setIsLoading,
  customPrompt,
  userQuery,
  clientId
}) => {
  const [isFallback, setIsFallback] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastTokensUsed, setLastTokensUsed] = useState<number | undefined>(undefined);

  const fetchInsights = async () => {
    setIsLoading(true);
    setIsFallback(false);
    try {
      const result = await generateInsights(data, customPrompt, userQuery);
      setInsights(result.text, result.model, result.tokensUsed);
      setLastTokensUsed(result.tokensUsed);
    } catch (error) {
      setInsights(getFallbackAnalysis(data), "Error Fallback");
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data && !insights) {
      fetchInsights();
    }
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(insights);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const parseInsightsText = (text: string) => {
    const sections = {
      positivos: '',
      atencao: '',
      criticos: '',
      estratégico: '',
      diretriz: ''
    };

    if (!text) return sections;

    let cleanedText = text
      .replace(/^(?:Como Diretor|Apresento a análise|Prezados|Olá).*/gim, '')
      .replace(/^[0-9]+\.\s*(?:Análise|Ações|Conclusão|Diretriz|Estratégica|Dashboard).*/gim, '')
      .replace(/^(?:Para|De|Assunto|Resumo Executivo|Análise Estratégica|Ações de Curto Prazo|Conclusão|Dashboard Kanban|Diretriz Final):.*/gim, '')
      .replace(/^(?:#|-|=|\*){3,}.*/gm, '')
      .replace(/^>\s*/gm, '')
      .trim();

    const patterns = [
      { id: 'positivos', regex: /(?:\[POSITIVOS\]|###\s*Positivos|\*\*Positivos\*\*|Positivos:)/i },
      { id: 'atencao', regex: /(?:\[ATENÇÃO\]|###\s*Atenção|\*\*Atenção\*\*|Atenção:)/i },
      { id: 'criticos', regex: /(?:\[CRÍTICOS\]|###\s*Críticos|\*\*Críticos\*\*|Críticos:)/i },
      { id: 'estratégico', regex: /(?:\[ESTRATÉGIA & PROJEÇÃO\]|###\s*Estratégia & Projeção|\*\*Estratégia & Projeção\*\*|Estratégia & Projeção:)/i },
      { id: 'diretriz', regex: /(?:DIRETRIZ FINAL|\[DIRETRIZ FINAL\]|###\s*Diretriz Final):?/i }
    ];

    const markers = patterns
      .map(p => ({ id: p.id, index: cleanedText.search(p.regex), length: (cleanedText.match(p.regex)?.[0].length || 0) }))
      .filter(m => m.index !== -1)
      .sort((a, b) => a.index - b.index);

    if (markers.length > 0 && markers[0].index > 0) {
      const initialText = cleanedText.slice(0, markers[0].index).trim();
      if (initialText.length > 10) {
        sections.estratégico = initialText;
      }
    } else if (markers.length === 0) {
      sections.estratégico = cleanedText;
    }

    markers.forEach((m, idx) => {
      const start = m.index + m.length;
      const nextMarker = markers[idx + 1];
      const end = nextMarker ? nextMarker.index : cleanedText.length;
      let content = cleanedText.slice(start, end).trim();
      
      content = content.replace(/^[0-9]+\.\s*(?:Conclusão|Diretriz|Ações|Dash).*/gim, '').trim();

      if (m.id === 'positivos') sections.positivos = content;
      else if (m.id === 'atencao') sections.atencao = content;
      else if (m.id === 'criticos') sections.criticos = content;
      else if (m.id === 'estratégico') {
        sections.estratégico = sections.estratégico ? `${sections.estratégico}\n\n${content}` : content;
      }
      else if (m.id === 'diretriz') sections.diretriz = content;
    });

    return sections;
  };

  const processBold = (txt: string) => {
    if (!txt) return null;
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pi) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pi} className="text-gray-900 dark:text-white font-black">{part.replace(/\*\*/g, '')}</strong>;
      }
      return part;
    });
  };

  const renderStrategicItems = (text: string, type: 'positivos' | 'atencao' | 'criticos') => {
    if (!text || text.length < 5) return <p className="text-[11px] text-gray-400 dark:text-white/20 italic">Aguardando análise detalhada...</p>;
    
    const typeStyles = {
      positivos: { action: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300', icon: 'text-emerald-500' },
      atencao: { action: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-900 dark:text-amber-300', icon: 'text-amber-500' },
      criticos: { action: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-900 dark:text-rose-300', icon: 'text-rose-500' }
    };

    return text.split('\n')
      .filter(line => line.trim().length > 1 && !line.match(/^(?:#|-|=|\*){3,}/) && !line.match(/^[0-9]+\.\s*(?:Conclusão|Dashboard)/i))
      .map((line, i) => {
        let cleanLine = line.replace(/^-\s*/, '').replace(/^\*\s*/, '').replace(/^\/\s*/, '').replace(/^[0-9]+\.\s*/, '').trim();
        
        if (cleanLine.startsWith('*') && !cleanLine.includes('**')) {
          cleanLine = cleanLine.substring(1).trim();
        }

        const actionKeywords = ["Ação Sugerida:", "Ação Sugerida**:", "**Ação Sugerida**:", "Ação:", "Ação**:", "**Ação**:"];
        let mainText = cleanLine;
        let actionText = "";
        
        for (const kw of actionKeywords) {
          if (cleanLine.includes(kw)) {
            const split = cleanLine.split(kw);
            mainText = split[0].trim();
            actionText = split[1].trim();
            break;
          }
        }

        if (!mainText && !actionText) return null;

        return (
          <div key={i} className="mb-6 last:mb-0 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex gap-3 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-wigoo-primary/30 mt-2 flex-shrink-0"></div>
              <p className="text-[13px] leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                {processBold(mainText)}
              </p>
            </div>
            {actionText && (
              <div className={`ml-5 p-4 rounded-2xl border ${typeStyles[type].action} shadow-sm backdrop-blur-md`}>
                <div className="flex items-center gap-2 mb-1.5 opacity-80">
                  <i className={`fa-solid fa-bolt-lightning text-[9px] ${typeStyles[type].icon}`}></i>
                  <span className="text-[8px] font-black uppercase tracking-[0.1em]">Execução Tática</span>
                </div>
                <p className="text-[12px] font-bold leading-tight">{processBold(actionText)}</p>
              </div>
            )}
          </div>
        );
      });
  };

  const sections = useMemo(() => parseInsightsText(insights), [insights]);
  const hasNarrative = !!(sections.estratégico || sections.diretriz || userQuery);

  if (isLoading) {
    return (
      <section className="bg-white dark:bg-wigoo-gray rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 card w-full max-w-[1200px] mx-auto shadow-2xl">
        <div className="py-40 flex flex-col items-center justify-center space-y-8">
          <div className="relative">
            <div className="w-20 h-20 border-[5px] border-wigoo-primary/10 border-t-wigoo-primary rounded-full animate-spin"></div>
            <i className="fa-solid fa-brain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-wigoo-primary text-xl"></i>
          </div>
          <div className="text-center">
            <p className="text-gray-900 dark:text-white text-2xl font-black tracking-tight">Wigoo AI Engine</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-bold mt-3">Synthesizing executive reporting and strategic vectors</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-16 animate-in">
      {/* Kanban Dashboard */}
      <section className="bg-white dark:bg-wigoo-gray rounded-[3.5rem] border border-gray-100 dark:border-white/5 p-12 md:p-16 print:p-8 print:rounded-3xl relative overflow-hidden shadow-2xl card group">
        <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-[2000ms]">
          <i className="fa-solid fa-wand-magic-sparkles text-[22rem] text-wigoo-primary"></i>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-wigoo-gradient flex items-center justify-center shadow-2xl shadow-wigoo-primary/30">
              <i className="fa-solid fa-microchip text-white text-4xl"></i>
            </div>
            <div>
              <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Wigoo Strategic AI</h2>
              <div className="flex items-center gap-4 mt-2.5">
                  <p className="text-[12px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-[0.5em]">Strategic Analysis</p>
                  {isFallback && <span className="bg-rose-500/10 text-rose-500 text-[9px] px-3 py-1 rounded-full font-black border border-rose-500/20">RECOVERY_MODE</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 no-print">
            <button 
              onClick={handleCopy}
              className={`px-8 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${copySuccess ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-gray-500 dark:text-white/40 hover:text-wigoo-primary'}`}
            >
              <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
              {copySuccess ? 'Copiado!' : 'Copiar Report'}
            </button>
            <button onClick={fetchInsights} className="px-8 py-4 bg-wigoo-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-wigoo-primary/20 hover:scale-105 transition-all flex items-center gap-3">
              <i className="fa-solid fa-rotate"></i> Recalcular
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-12 print:gap-4">
          <div className="space-y-8">
            <h4 className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.4em] text-emerald-600">
               <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Positivos
            </h4>
            <div className="bg-emerald-50/20 dark:bg-emerald-500/[0.02] border border-emerald-100 dark:border-emerald-500/10 rounded-[3rem] p-10 min-h-[450px] shadow-inner">
              {renderStrategicItems(sections.positivos, 'positivos')}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.4em] text-amber-600">
               <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div> Atenção
            </h4>
            <div className="bg-amber-50/20 dark:bg-amber-500/[0.02] border border-amber-100 dark:border-amber-500/10 rounded-[3rem] p-10 min-h-[450px] shadow-inner">
              {renderStrategicItems(sections.atencao, 'atencao')}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.4em] text-rose-600">
               <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div> Críticos
            </h4>
            <div className="bg-rose-50/20 dark:bg-rose-500/[0.02] border border-rose-100 dark:border-rose-500/10 rounded-[3rem] p-10 min-h-[450px] shadow-inner">
              {renderStrategicItems(sections.criticos, 'criticos')}
            </div>
          </div>
        </div>

        <div className="mt-14 flex justify-end items-center gap-6 relative z-10">
          {lastTokensUsed && (
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-wigoo-primary/50 dark:text-wigoo-accent/50">
              <i className="fa-solid fa-microchip text-[8px]"></i>
              {formatTokenCount(lastTokensUsed)} tokens
            </div>
          )}
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white opacity-20 dark:opacity-10">
            Engine: {modelName || 'Neural Wigoo-V4'} • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </section>

      {/* Strategic Narrative Section */}
      {hasNarrative && (
        <section className="bg-white dark:bg-wigoo-gray border border-gray-100 dark:border-white/5 rounded-[4rem] print:rounded-3xl p-16 md:p-20 print:p-10 relative overflow-hidden shadow-2xl card group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-[3000ms]">
            <i className="fa-solid fa-layer-group text-[24rem] text-wigoo-primary"></i>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 mb-16 pb-16 border-b border-gray-100 dark:border-white/5 relative z-10">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-[2.5rem] bg-wigoo-gradient flex items-center justify-center shadow-2xl">
                <i className="fa-solid fa-brain text-white text-4xl"></i>
              </div>
              <div>
                <h4 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Estratégia & Projeção</h4>
              </div>
            </div>
            {userQuery && (
              <div className="bg-gray-50 dark:bg-wigoo-dark/50 px-10 py-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 max-w-md shadow-lg backdrop-blur-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-comment-dots text-wigoo-primary"></i> Focus Briefing
                </p>
                <p className="text-[15px] font-bold italic text-gray-600 dark:text-gray-200 leading-relaxed">"{userQuery}"</p>
              </div>
            )}
          </div>

          <div className="relative z-10 space-y-12">
            {sections.estratégico && (
              <div className="text-gray-700 dark:text-gray-300 font-medium leading-[1.8] whitespace-pre-wrap text-[16px] max-w-[1100px] animate-in fade-in duration-1000">
                {processBold(sections.estratégico.replace(/^\n+/, ''))}
              </div>
            )}

            {sections.diretriz && (
              <div className="bg-wigoo-primary/5 dark:bg-white/[0.02] border-l-[8px] border-wigoo-primary p-16 rounded-r-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                  <i className="fa-solid fa-shield-halved text-8xl"></i>
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <i className="fa-solid fa-shield-halved text-wigoo-primary text-xl"></i>
                  <h5 className="text-[13px] font-black uppercase tracking-[0.5em] text-wigoo-primary">Comando Tático Final</h5>
                </div>
                <div className="text-gray-900 dark:text-gray-100 font-black leading-relaxed text-[22px] tracking-tight">
                  {processBold(sections.diretriz)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-24 pt-12 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-12 relative z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <i className="fa-solid fa-check text-emerald-500"></i>
              </div>
            
            <div className="text-right">
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AIInsights;