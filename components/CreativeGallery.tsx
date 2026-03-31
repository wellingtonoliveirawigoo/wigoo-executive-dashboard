import React, { useEffect, useState } from 'react';
import { DashboardData, Creative } from '../types';
import { analyzeSingleCreative } from '../services/gemini';
import { formatCurrency, formatNumber } from '../utils/parser';

interface Props {
  data: DashboardData;
  insights: string;
  setInsights: (val: string, model?: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  analyzedItems: Record<number, { text: string; hasError: boolean }>;
  setAnalyzedItems: React.Dispatch<React.SetStateAction<Record<number, { text: string; hasError: boolean }>>>;
}

const CreativeImage: React.FC<{ url: string; name: string; onValidated?: (isValid: boolean) => void }> = ({ url, name, onValidated }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (retryCount < 3) {
      setTimeout(() => setRetryCount(prev => prev + 1), 1500);
    } else {
      setIsError(true);
      setIsLoading(false);
      onValidated?.(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    onValidated?.(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isLoading && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-wigoo-dark/40 z-10">
           <div className="w-8 h-8 border-2 border-wigoo-primary/20 border-t-wigoo-primary rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        key={`${url}-${retryCount}`}
        src={isError ? `https://picsum.photos/seed/${encodeURIComponent(name)}/400/500?blur=5` : url} 
        alt={name} 
        className={`w-full h-full object-contain bg-gray-100 dark:bg-wigoo-dark/20 transition-all duration-700 group-hover:scale-105 ${isError ? 'opacity-40 grayscale' : (isLoading ? 'opacity-0' : 'opacity-100')}`} 
        referrerPolicy="no-referrer"
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

const CreativeGallery: React.FC<Props> = ({ data, insights, setInsights, isLoading, setIsLoading, analyzedItems, setAnalyzedItems }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingIndex, setProcessingIndex] = useState<number>(-1);
  const [validIndices, setValidIndices] = useState<Set<number>>(new Set());
  const [invalidIndices, setInvalidIndices] = useState<Set<number>>(new Set());

  const validateImages = async () => {
    const valid = new Set<number>();
    const invalid = new Set<number>();

    const checkImage = (url: string, index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        let resolved = false;
        
        img.referrerPolicy = "no-referrer";
        img.onload = () => {
          if (resolved) return;
          if (img.width < 100 || img.height < 100) {
            invalid.add(index);
          } else {
            valid.add(index);
          }
          resolved = true;
          resolve();
        };
        img.onerror = () => {
          if (resolved) return;
          invalid.add(index);
          resolved = true;
          resolve();
        };
        img.src = url;
        
        setTimeout(() => {
          if (!resolved) {
            invalid.add(index);
            resolved = true;
            resolve();
          }
        }, 3500);
      });
    };

    await Promise.all((data.creatives || []).map((c, i) => checkImage(c.url, i)));
    setValidIndices(valid);
    setInvalidIndices(invalid);
    return valid;
  };

  const fetchInsightsSequential = async () => {
    if (!data.creatives || data.creatives.length === 0) return;
    
    setIsLoading(true);
    setAnalyzedItems({});
    setInsights('');
    setProcessingIndex(-1);
    
    // Pequeno delay para garantir que o estado de loading foi processado pela UI
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Process ALL indices
    const indicesToProcess = data.creatives.map((_, i) => i);
    
    let accumulatedInsights = "";
    const failedIndices: number[] = [];

    // First Pass
    for (const i of indicesToProcess) {
      setProcessingIndex(i);
      try {
        const result = await analyzeSingleCreative(data.creatives[i], i + 1);
        
        if (result.error && result.error !== "QUOTA_EXCEEDED") {
          failedIndices.push(i);
          continue;
        }
        
        setAnalyzedItems(prev => ({
          ...prev,
          [i]: { text: result.text, hasError: !!result.error }
        }));
        
        accumulatedInsights += result.text + "\n\n";
        setInsights(accumulatedInsights, result.model);
      } catch (err) {
        failedIndices.push(i);
      }
    }

    // Retry once
    if (failedIndices.length > 0) {
      for (const i of failedIndices) {
        setProcessingIndex(i);
        try {
          const result = await analyzeSingleCreative(data.creatives[i], i + 1);
          setAnalyzedItems(prev => ({
            ...prev,
            [i]: { text: result.text, hasError: !!result.error }
          }));
          accumulatedInsights += result.text + "\n\n";
          setInsights(accumulatedInsights, result.model);
        } catch (err) {
          setAnalyzedItems(prev => ({
            ...prev,
            [i]: { text: `**Erro de Processamento**\nNão foi possível analisar este criativo.`, hasError: true }
          }));
        }
      }
    }
    
    setProcessingIndex(-1);
    setIsLoading(false);
  };

  useEffect(() => {
    if (data && data.creatives && data.creatives.length > 0 && !isLoading && Object.keys(analyzedItems).length === 0) {
      fetchInsightsSequential();
    }
  }, [data, isLoading, analyzedItems]);

  const parseAnalysisText = (raw: string | undefined, id: number) => {
    if (!raw) return null;
    
    const scoreMatch = raw.match(/Nota Final:\s*(\d+(?:\.\d+)?)\/100/i);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

    const classMatch = raw.match(/Classificação:\s*\[?(Criativo forte|Bom|Médio|Fraco)\]?/i);
    const classification = classMatch ? classMatch[1] : "Médio";

    const breakdownMatch = raw.match(/\*\*Pontuação Detalhada\*\*([\s\S]*?)(?:\n\n\*\*Nota Final|$)/i);
    const breakdownRaw = breakdownMatch ? breakdownMatch[1].trim() : "";
    const breakdownItems: { label: string; score: number; explanation?: string }[] = [];
    
    if (breakdownRaw) {
      breakdownRaw.split('\n').forEach(line => {
        const match = line.match(/(.*?):\s*(\d+(?:\.\d+)?)\/10(?:\s*\|\s*(.*))?/);
        if (match) {
          breakdownItems.push({
            label: match[1].trim(),
            score: parseFloat(match[2]) * 10,
            explanation: match[3]?.trim()
          });
        }
      });
    }

    const saturationMatch = raw.match(/\*\*Índice de Saturação:\s*\[?(Saudável|Atenção|Saturado|Trocar Urgente)\]?/i);
    const saturation = saturationMatch ? saturationMatch[1] : "Saudável";

    const cleanText = raw
      .replace(/VEREDITO FINAL:.*$/gim, '')
      .replace(/\*\*Pontuação Detalhada\*\*[\s\S]*?\*\*Classificação:.*?\*\*/gi, '')
      .replace(/\*\*Criativo \d+ — Diagnóstico Multimodal\*\*/gi, '')
      .trim();

    const actionMatch = cleanText.match(/(?:\*\*Ação Recomendada\*\*|Ação Recomendada:?)\s*([\s\S]*?)(?:\n\n|$)/i);
    let summaryAction = actionMatch ? actionMatch[1].trim() : "Monitorar performance.";
    
    if (summaryAction.length < 5 || summaryAction === '**') {
        summaryAction = "Análise em andamento.";
    }

    return { fullText: cleanText, summaryAction, score, classification, breakdown: breakdownItems, saturation };
  };

  if (!data.creatives || data.creatives.length === 0) return null;

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white dark:bg-wigoo-gray p-12 rounded-[3.5rem] shadow-2xl theme-transition relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-wigoo-gradient"></div>
        <div className="space-y-3 relative z-10">
          <h2 className="text-[12px] font-black text-wigoo-accent uppercase tracking-[0.6em] mb-2">Creative Intelligence</h2>
          <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
            Vision <span className="text-gray-300 mx-2 font-thin italic">Analytics</span>
          </div>
        </div>
        <div className="relative z-10 text-right">
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Status: {isLoading ? 'Analisando Pixels...' : 'Análise Concluída'}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Wigoo AI Vision Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10 w-full">
        {data.creatives.map((creative, idx) => {
          const itemData = analyzedItems[idx];
          const parsed = parseAnalysisText(itemData?.text, idx + 1);
          const isProcessing = processingIndex === idx;
          const isPending = !itemData && !isProcessing;
          const isExpanded = expandedId === idx;
          const currentCTR = (creative.clicks.current / (creative.impressions.current || 1) * 100);
          const formattedCTR = currentCTR.toFixed(2).replace('.', ',') + '%';

          return (
            <div 
              key={idx} 
              className={`creative-item bg-white dark:bg-wigoo-gray rounded-[3rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl flex flex-col ${isExpanded ? 'ring-2 ring-wigoo-primary' : ''}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-wigoo-dark">
                <CreativeImage url={creative.url} name={creative.name} />
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 animate-pulse">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Wigoo Vision AI</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-70 mt-1">Decodificando Pixels...</p>
                  </div>
                )}

                {isPending && (
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10">
                    <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20 shadow-sm">
                       <p className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-[0.2em]">Aguardando Análise AI</p>
                    </div>
                  </div>
                )}

                <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                  <div className="bg-wigoo-primary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-lg">
                    {creative.daysRunning} dias
                  </div>
                  {parsed && (
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${
                      parsed.saturation === 'Saudável' ? 'bg-emerald-500 text-white border-emerald-400' :
                      parsed.saturation === 'Atenção' ? 'bg-amber-500 text-white border-amber-400' :
                      'bg-rose-500 text-white border-rose-400 animate-pulse'
                    }`}>
                      {parsed.saturation}
                    </div>
                  )}
                  {parsed && parsed.score >= 90 && (creative.revenue.current / (creative.investment.current || 1)) > 8 && (
                    <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-400 shadow-lg animate-pulse">
                      <i className="fa-solid fa-crown mr-1"></i> Super Winner
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1" title={creative.name}>
                    {creative.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Performance Data</span>
                    <span className="text-[11px] font-black text-wigoo-primary">CTR: {formattedCTR}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-wigoo-dark/40 p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-colors group-hover:bg-gray-100 dark:group-hover:bg-wigoo-dark/60">
                    <p className="text-[8px] text-gray-400 font-black uppercase mb-1">
                      {creative.metricNames?.conversions || 'Conversões'}
                    </p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{formatNumber(creative.conversions.current)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-wigoo-dark/40 p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-colors group-hover:bg-gray-100 dark:group-hover:bg-wigoo-dark/60">
                    <p className="text-[8px] text-gray-400 font-black uppercase mb-1">
                      {creative.metricNames?.efficiency || 'ROAS'}
                    </p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {creative.metricNames?.efficiency === 'CPS' 
                        ? formatCurrency(creative.revenue.current)
                        : `${(creative.revenue.current / (creative.investment.current || 1)).toFixed(2)}x`
                      }
                    </p>
                  </div>
                </div>

                {parsed && (
                  <div className="bg-wigoo-gradient p-[1px] rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white dark:bg-wigoo-gray rounded-[0.9rem] p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">Wigoo Score</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{parsed.score.toFixed(1)}/100</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">Classificação</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${
                          parsed.score >= 85 ? 'text-emerald-500' :
                          parsed.score >= 70 ? 'text-blue-500' :
                          parsed.score >= 55 ? 'text-amber-500' : 'text-rose-500'
                        }`}>{parsed.classification}</p>
                      </div>
                    </div>
                  </div>
                )}

                {parsed ? (
                  <div className="flex-grow space-y-5 animate-in fade-in">
                    <div className="bg-wigoo-primary/5 dark:bg-white/[0.02] border-l-4 border-wigoo-primary p-5 rounded-r-2xl">
                      <p className="text-[9px] font-black text-wigoo-primary uppercase tracking-widest mb-1.5">Diagnóstico Wigoo AI</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-relaxed italic">
                        "{parsed.summaryAction}"
                      </p>
                    </div>

                    {isExpanded && (
                      <div className="space-y-6 animate-in fade-in">
                        {parsed.breakdown && parsed.breakdown.length > 0 && (
                          <div className="bg-gray-50 dark:bg-wigoo-dark/40 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-5">Análise Técnica Detalhada</p>
                            <div className="space-y-5">
                              {parsed.breakdown.map((item, bi) => (
                                <div key={bi} className="space-y-2">
                                  <div className="flex items-center gap-4">
                                    <div className="w-32 flex-shrink-0">
                                      <p className="text-[9px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter leading-tight" title={item.label}>
                                        {item.label}
                                      </p>
                                    </div>
                                    <div className="flex-grow h-5 bg-gray-200 dark:bg-white/5 rounded-sm relative overflow-hidden group/bar">
                                      <div 
                                        className="h-full bg-[#3AB09E] transition-all duration-1000 flex items-center justify-center relative" 
                                        style={{ width: `${item.score}%` }}
                                      >
                                        <span className="text-[9px] font-black text-white drop-shadow-sm">
                                          {item.score.toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {item.explanation && (
                                    <div className="ml-32 pl-4 border-l-2 border-wigoo-primary/20 py-1">
                                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                        {item.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap pt-6 border-t border-gray-100 dark:border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar pr-3">
                          {parsed.fullText.split('\n').map((line, li) => {
                            if (line.trim().startsWith('**')) {
                              return <p key={li} className="font-black text-gray-900 dark:text-white mt-5 mb-2 uppercase tracking-wide text-[10px] border-b border-gray-100 dark:border-white/5 pb-1">{line.replace(/\*\*/g, '')}</p>
                            }
                            return <p key={li} className="mb-2 last:mb-0 leading-relaxed">{line}</p>
                          })}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : idx)}
                      className="w-full py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-wigoo-primary hover:border-wigoo-primary hover:bg-wigoo-primary/5 transition-all flex items-center justify-center gap-2"
                    >
                      {isExpanded ? 'Recolher Relatório' : 'Ver Diagnóstico Completo'}
                      <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-pulse py-6">
                    <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-full w-full"></div>
                    <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-full w-5/6"></div>
                    <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-full w-4/6"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreativeGallery;