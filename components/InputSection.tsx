
import React, { useState, useEffect } from 'react';

interface InputSectionProps {
  viewMode: 'performance' | 'creative';
  input: string;
  setInput: (val: string) => void;
  userQuery: string;
  setUserQuery: (val: string) => void;
  onProcess: () => void;
  isCollapsed: boolean;
}

const PLACEHOLDERS = [
  "Ex: Projete os resultados com 15% a mais de investimento no Meta Ads...",
  "Ex: Analise por que o CPA do Google Ads subiu tanto neste período...",
  "Ex: Como podemos melhorar o ROAS geral mantendo o faturamento atual?"
];

const InputSection: React.FC<InputSectionProps> = ({ 
  viewMode,
  input, 
  setInput, 
  userQuery, 
  setUserQuery, 
  onProcess, 
  isCollapsed 
}) => {
  const [show, setShow] = useState(!isCollapsed);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="no-print space-y-4 w-full max-w-[1200px] mx-auto">
      <div className="bg-white dark:bg-wigoo-gray rounded-3xl border border-gray-200 dark:border-wigoo-gray-light overflow-hidden shadow-xl transition-all duration-300">
        <div className="p-8 space-y-6">
          
          {viewMode === 'performance' && (
            <div className="space-y-3 animate-in">
              <label className="flex items-center gap-3 text-xs font-black text-wigoo-primary uppercase tracking-[0.2em]">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Briefing Estratégico (Opcional)
              </label>
              <input 
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                className="w-full bg-gray-50 dark:bg-wigoo-dark border border-gray-200 dark:border-wigoo-gray-light rounded-2xl p-5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-wigoo-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-inner"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setShow(!show)} className="flex items-center gap-3 group">
              <i className="fa-solid fa-database text-gray-400 group-hover:text-wigoo-primary transition-colors"></i>
              <span className="font-black text-xs uppercase tracking-widest text-gray-600 dark:text-wigoo-light/60">Importação de Dados Power BI</span>
              <i className={`fa-solid fa-chevron-${show ? 'up' : 'down'} text-gray-300 ml-1`}></i>
            </button>
          </div>

          {show && (
            <div className="animate-in space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={viewMode === 'creative' ? "Cole aqui o EXPORT_CREATIVOS_FULL_MOM..." : "Cole aqui o conteúdo exportado do Power BI..."}
                className="w-full h-40 bg-gray-50 dark:bg-wigoo-dark border border-gray-200 dark:border-wigoo-gray-light rounded-2xl p-5 text-xs font-mono text-gray-900 dark:text-wigoo-light focus:ring-2 focus:ring-wigoo-primary outline-none transition-all shadow-inner"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onProcess}
              className="bg-wigoo-gradient hover:scale-[1.02] active:scale-95 transition-all text-white font-black text-xs uppercase tracking-[0.2em] py-5 px-10 rounded-2xl shadow-2xl shadow-wigoo-primary/30 flex items-center gap-3"
            >
              <i className="fa-solid fa-bolt-lightning text-lg"></i>
              {viewMode === 'creative' ? 'Gerar Análise Inteligente' : 'Gerar Dashboard Inteligente'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InputSection;
