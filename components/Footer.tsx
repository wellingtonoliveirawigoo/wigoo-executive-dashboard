import React from 'react';

interface FooterProps {
  onExportPdf: () => void;
  onExportPdfExpanded?: () => void;
  hasData?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onExportPdf, onExportPdfExpanded, hasData = false }) => {
  return (
    <footer className="mt-16 mb-10 container mx-auto px-4">
      {/* Cabeçalho do relatório — visível SOMENTE no PDF */}
      <div className="pdf-report-header hidden print:flex">
        <div className="flex items-center gap-3">
          <img
            src="https://www.wigoo.com.br/icon.ico?118911a3cf296aa2"
            alt="Wigoo"
            className="w-8 h-8"
            referrerPolicy="no-referrer"
          />
          <div>
            <p style={{ fontSize: '14px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Wigoo Digital Intelligence Hub
            </p>
            <p style={{ fontSize: '9px', color: '#9ca3af', margin: 0, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Relatório Executivo · Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <p style={{ fontSize: '9px', color: '#9ca3af', alignSelf: 'flex-end', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Confidencial · Uso Exclusivo
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-gray-200 dark:border-wigoo-gray-light/20 pt-10">
        <div className="flex items-center gap-6 opacity-40 dark:opacity-30 hover:opacity-100 transition-all duration-500 cursor-default group">
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-100">
            <img 
              src="https://www.wigoo.com.br/icon.ico?118911a3cf296aa2" 
              alt="Wigoo Logo" 
              className="w-7 h-7 grayscale group-hover:grayscale-0 transition-all"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-wigoo-gray-light/50"></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">
              Wigoo Digital Intelligence Hub
            </p>
            <p className="text-[9px] text-gray-400 dark:text-wigoo-light/40 font-bold uppercase tracking-widest mt-0.5">Performance Driven Analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => {
              console.log("Botão PDF clicado. hasData:", hasData);
              onExportPdf();
            }}
            disabled={!hasData}
            className={`group relative transition-all font-black text-xs uppercase tracking-widest py-4.5 px-8 rounded-2xl flex items-center gap-3 shadow-xl overflow-hidden ${
              hasData
                ? 'bg-wigoo-gradient hover:scale-105 active:scale-95 text-white shadow-wigoo-primary/30'
                : 'bg-gray-200 dark:bg-wigoo-gray-light text-gray-400 dark:text-wigoo-light/20 cursor-not-allowed'
            }`}
          >
            {hasData && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
            <i className="fa-solid fa-file-pdf text-base"></i>
            <span>Exportar PDF</span>
          </button>

          {onExportPdfExpanded && (
            <button
              onClick={() => {
                console.log("Botão PDF Expandido clicado. hasData:", hasData);
                onExportPdfExpanded();
              }}
              disabled={!hasData}
              className={`group relative transition-all font-black text-xs uppercase tracking-widest py-4.5 px-8 rounded-2xl flex items-center gap-3 shadow-xl overflow-hidden ${
                hasData
                  ? 'bg-gray-900 dark:bg-white hover:scale-105 active:scale-95 text-white dark:text-gray-900 shadow-gray-900/20'
                  : 'bg-gray-200 dark:bg-wigoo-gray-light text-gray-400 dark:text-wigoo-light/20 cursor-not-allowed'
              }`}
            >
              {hasData && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
              <i className="fa-solid fa-file-pdf text-base"></i>
              <i className="fa-solid fa-expand text-xs -ml-1"></i>
              <span>Exportar PDF Expandido</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-12 text-center space-y-2">
        <p className="text-[10px] text-gray-400 dark:text-wigoo-light/10 uppercase tracking-[0.4em] font-black">
          © 2026 Wigoo Digital Marketing - Estratégia e Tecnologia
        </p>
        <p className="text-[8px] text-gray-300 dark:text-wigoo-light/5 uppercase tracking-widest">
          Documento Confidencial - Uso Exclusivo Wigoo & Parceiros
        </p>
      </div>
    </footer>
  );
};

export default Footer;