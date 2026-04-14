
import React, { useState, useEffect } from 'react';
import { parsePbiExport } from './utils/parser';
import { DashboardData } from './types';
import Header from './components/Header';
import InputSection from './components/InputSection';
import MetricCards from './components/MetricCards';
import PlatformPerformance from './components/PlatformPerformance';
import CampaignTable from './components/CampaignTable';
import AIInsights from './components/AIInsights';
import CreativeGallery from './components/CreativeGallery';
import CreativeUpload from './components/CreativeUpload';
import BackendComparison from './components/BackendComparison';
import Footer from './components/Footer';
import AdminModal from './components/AdminModal';
import LiveConnectionPanel from './components/LiveConnectionPanel';
import LandingPage from './components/LandingPage';
import { CLIENTS } from './config/clients';
import { Creative } from './types';
import { addTokens } from './utils/tokenStorage';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'performance' | 'creative'>('performance');
  
  // Roteamento Simples por Pathname
  const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase(); // Limpa barras
  const lockedClient = CLIENTS.find(c => c.slug.toLowerCase() === path);
  const isLanding = path === '' || (!lockedClient && path !== 'admin');
  const isCreativesOnly = !!lockedClient?.creativesOnly;
  
  const [selectedClientId, setSelectedClientId] = useState(lockedClient?.id || CLIENTS[0].id);
  const clientId = lockedClient?.id || selectedClientId;

  const [rawInput, setRawInput] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [inputMethod, setInputMethod] = useState<'paste' | 'live'>('live');
  const [customPrompt, setCustomPrompt] = useState<string | null>(localStorage.getItem('wigoo_custom_prompt'));
  
  // Estado SEPARADO para cada modo — resolve o problema de cache e mistura de insights
  const [perfData, setPerfData] = useState<DashboardData | null>(null);
  const [perfInsights, setPerfInsights] = useState('');
  const [perfModelUsed, setPerfModelUsed] = useState('');
  const [isPerfLoading, setIsPerfLoading] = useState(false);

  const [creativeData, setCreativeData] = useState<DashboardData | null>(null);
  const [creativeInsights, setCreativeInsights] = useState('');
  const [creativeModelUsed, setCreativeModelUsed] = useState('');
  const [isCreativeLoading, setIsCreativeLoading] = useState(false);
  const [creativeAnalyzedItems, setCreativeAnalyzedItems] = useState<Record<number, any>>({});
  const [printMode, setPrintMode] = useState(false);
  const [printExpandAll, setPrintExpandAll] = useState(false);

  // Getters do modo atual
  const data = viewMode === 'performance' ? perfData : creativeData;

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('wigoo_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = window.document.body;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('wigoo_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleProcessData = () => {
    const parsedData = parsePbiExport(rawInput);
    if (!parsedData) {
      alert("Formato de exportação não identificado ou inválido para a visão selecionada.");
      return;
    }
    
    if (parsedData.exportType === 'CREATIVE') {
      setViewMode('creative');
      setCreativeData(parsedData);
      setCreativeInsights('');
      setCreativeAnalyzedItems({});
    } else if (parsedData.exportType === 'PERFORMANCE') {
      setViewMode('performance');
      setPerfData(parsedData);
      setPerfInsights('');
    }
    
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleUploadedCreatives = (creatives: Creative[]) => {
    const zero = { current: 0, previous: 0 };
    const uploadData: DashboardData = {
      periodStart: '—',
      periodEnd: '—',
      investment: zero, impressions: zero, cliques: zero,
      conversions: zero, receita: zero, roas: zero, cpa: zero, ctr: zero,
      platforms: [], campaigns: [],
      creatives,
      exportType: 'CREATIVE',
    };
    setCreativeData(uploadData);
    setCreativeInsights('');
    setCreativeAnalyzedItems({});
    setViewMode('creative');
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleLiveDataLoaded = (parsedData: DashboardData) => {
    if (viewMode === 'performance') {
      setPerfData(parsedData);
      setPerfInsights('');
    } else {
      setCreativeData(parsedData);
      setCreativeInsights('');
      setCreativeAnalyzedItems({});
    }
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  if (isLanding) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-wigoo-dark theme-transition selection:bg-wigoo-primary selection:text-white">
      <Header 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        clientName={lockedClient?.name}
      />
        
        <main className="flex-grow container mx-auto px-4 py-12 space-y-12 flex flex-col items-center">
          {/* Tabs Performance / Creative — apenas para clientes com Power BI */}
          {!isCreativesOnly && (
            <div className="w-full max-w-[1200px] flex justify-center no-print">
              <div className="bg-white/50 dark:bg-wigoo-gray/50 backdrop-blur-xl p-2 rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl flex items-center">
                <button
                  onClick={() => setViewMode('performance')}
                  className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${viewMode === 'performance' ? 'bg-wigoo-primary text-white shadow-2xl shadow-wigoo-primary/30' : 'text-gray-500 hover:text-wigoo-primary'}`}
                >
                  <i className="fa-solid fa-chart-line mr-2"></i> Performance
                </button>
                <button
                  onClick={() => setViewMode('creative')}
                  className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${viewMode === 'creative' ? 'bg-wigoo-primary text-white shadow-2xl shadow-wigoo-primary/30' : 'text-gray-500 hover:text-wigoo-primary'}`}
                >
                  <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Analisar Criativo
                </button>
              </div>
            </div>
          )}

          {/* Painel de entrada: upload (creativesOnly) ou PBI/paste (outros) */}
          {isCreativesOnly ? (
            /* Modo upload — B3 e similares */
            !creativeData && (
              <div className="w-full max-w-[1200px] no-print flex flex-col items-center">
                <CreativeUpload onImagesLoaded={handleUploadedCreatives} />
              </div>
            )
          ) : (
            <div className="w-full max-w-[1200px] no-print space-y-8 flex flex-col items-center">
              {/* Seletor de Método de Entrada */}
              <div className="flex bg-gray-100 dark:bg-wigoo-dark/50 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner">
                 <button
                  onClick={() => setInputMethod('paste')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inputMethod === 'paste' ? 'bg-white dark:bg-wigoo-gray text-wigoo-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                  Export Manual
                 </button>
                 <button
                  onClick={() => setInputMethod('live')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inputMethod === 'live' ? 'bg-white dark:bg-wigoo-gray text-wigoo-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                  <i className="fa-solid fa-bolt mr-2 text-amber-500"></i> Conexão Live
                 </button>
              </div>

              {inputMethod === 'live' ? (
                <LiveConnectionPanel
                  onDataLoaded={handleLiveDataLoaded}
                  isLoading={isSyncing}
                  setIsLoading={setIsSyncing}
                  viewMode={viewMode}
                  lockedClient={lockedClient}
                  selectedClientId={selectedClientId}
                  onClientSelect={setSelectedClientId}
                />
              ) : (
                <InputSection
                  viewMode={viewMode}
                  input={rawInput}
                  setInput={setRawInput}
                  userQuery={userQuery}
                  setUserQuery={setUserQuery}
                  onProcess={handleProcessData}
                  isCollapsed={!!data}
                />
              )}
            </div>
          )}

          {perfData && perfData.exportType === 'PERFORMANCE' && viewMode === 'performance' && (
            <div className="animate-in space-y-16 w-full max-w-[1200px] flex flex-col items-center pb-20">
               <div className="bg-white dark:bg-wigoo-gray border-b-4 border-wigoo-primary p-12 print:p-8 print:rounded-3xl rounded-[3.5rem] flex flex-col md:flex-row md:items-end justify-between gap-8 shadow-2xl w-full theme-transition relative overflow-hidden print:shadow-none print:border-b-2">
                <div className="absolute top-0 left-0 w-full h-1 bg-wigoo-gradient"></div>
                <div className="space-y-3 relative z-10">
                  <h2 className="text-[12px] font-black text-wigoo-accent uppercase tracking-[0.6em] mb-2">Executive Summary</h2>
                  <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {perfData.periodStart} <span className="text-gray-300 mx-2 font-thin italic">vs</span> {perfData.periodEnd}
                  </div>
                </div>
                <div className="relative z-10 text-right">
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Status: Ativo</p>
                </div>
              </div>
              
              <MetricCards data={perfData} />
              <PlatformPerformance data={perfData} theme={theme} />
              <BackendComparison data={perfData} />
              {perfData.campaigns.length > 0 && <CampaignTable campaigns={perfData.campaigns} />}
              
              <AIInsights
                data={perfData}
                insights={perfInsights}
                modelName={perfModelUsed}
                setInsights={(txt, model, tokens) => { setPerfInsights(txt); if (model) setPerfModelUsed(model); if (tokens) addTokens(clientId, tokens); }}
                isLoading={isPerfLoading}
                setIsLoading={setIsPerfLoading}
                customPrompt={customPrompt || undefined}
                userQuery={userQuery}
                clientId={clientId}
              />
            </div>
          )}

          {/* Botão para reiniciar upload no modo creativesOnly */}
          {isCreativesOnly && creativeData && (
            <div className="no-print flex justify-center">
              <button
                onClick={() => { setCreativeData(null); setCreativeAnalyzedItems({}); setCreativeInsights(''); }}
                className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 dark:border-white/10 hover:text-wigoo-primary hover:border-wigoo-primary/40 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i> Analisar novos criativos
              </button>
            </div>
          )}

          {creativeData && creativeData.exportType === 'CREATIVE' && viewMode === 'creative' && (
            <div className="animate-in space-y-16 w-full max-w-[1200px] flex flex-col items-center">
              <CreativeGallery
                data={creativeData}
                insights={creativeInsights}
                setInsights={(txt, model) => { setCreativeInsights(txt); if (model) setCreativeModelUsed(model); }}
                isLoading={isCreativeLoading}
                setIsLoading={setIsCreativeLoading}
                analyzedItems={creativeAnalyzedItems}
                setAnalyzedItems={setCreativeAnalyzedItems}
                printMode={printMode}
                forceExpandAll={printExpandAll}
                clientId={clientId}
              />
            </div>
          )}
        </main>

        <Footer
          onExportPdf={() => {
            setPrintMode(true);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.print();
                setTimeout(() => setPrintMode(false), 500);
              });
            });
          }}
          onExportPdfExpanded={() => {
            // Expande todos os diagnósticos antes de imprimir
            setPrintExpandAll(true);
            setPrintMode(true);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.print();
                setTimeout(() => {
                  setPrintMode(false);
                  setPrintExpandAll(false);
                }, 500);
              });
            });
          }}
          hasData={!!data}
        />
        <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} customPrompt={customPrompt} setCustomPrompt={setCustomPrompt} />
      </div>
  );
};

export default App;
