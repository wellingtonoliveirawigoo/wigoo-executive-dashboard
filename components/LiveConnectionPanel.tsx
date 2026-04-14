
import React, { useState } from 'react';
import { CLIENTS, ClientConfig } from '../config/clients';
import { executePowerBiQuery } from '../services/powerbi';
import { executeBigQueryQuery } from '../services/bigquery';
import { parsePbiExport } from '../utils/parser';
import { DashboardData } from '../types';
import { getMonthlyTokens, formatTokenCount } from '../utils/tokenStorage';

interface Props {
  onDataLoaded: (data: DashboardData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  viewMode: 'performance' | 'creative';
  lockedClient?: ClientConfig;
  selectedClientId: string;
  onClientSelect: (id: string) => void;
}

const LiveConnectionPanel: React.FC<Props> = ({ onDataLoaded, isLoading, setIsLoading, viewMode, lockedClient, selectedClientId, onClientSelect }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSync = async () => {
    const client = CLIENTS.find(c => c.id === selectedClientId);
    if (!client) return;

    setIsLoading(true);
    try {
      let exportString: string | null = null;

      // Tenta BigQuery primeiro (se cliente tem bqDataset configurado)
      if (client.bqDataset) {
        try {
          exportString = await executeBigQueryQuery(client.id, startDate, endDate, viewMode);
          console.log('BigQuery sync success');
        } catch (bqErr) {
          console.warn('BigQuery falhou, usando Power BI como fallback:', bqErr);
        }
      }

      // Fallback para Power BI
      if (!exportString) {
        exportString = await executePowerBiQuery(client, startDate, endDate, viewMode);
      }

      if (!exportString) {
        throw new Error('Nenhum dado retornado');
      }

      const parsedData = parsePbiExport(exportString);
      if (parsedData) {
        onDataLoaded(parsedData);
      } else {
        throw new Error('Erro ao processar os dados retornados');
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erro na conexão com a fonte de dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-wigoo-gray/70 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 shadow-2xl relative overflow-hidden group theme-transition">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <i className="fa-solid fa-tower-broadcast text-7xl text-wigoo-primary"></i>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-end gap-6">
        <div className="flex-grow space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-wigoo-primary/10 flex items-center justify-center text-wigoo-primary ${isLoading ? 'animate-pulse' : ''}`}>
              <i className="fa-solid fa-database"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">Conexão Live</h3>
              <p className="text-[10px] text-gray-400 dark:text-wigoo-light/30 uppercase tracking-widest mt-0.5">BigQuery + Power BI • Sincronização em Tempo Real</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest ml-1">Cliente</label>
              {lockedClient ? (
                <div className="w-full bg-gray-100/50 dark:bg-wigoo-dark/50 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-black text-wigoo-primary transition-all">
                  <i className="fa-solid fa-lock mr-2 text-[10px] opacity-50"></i>
                  {lockedClient.name}
                </div>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={(e) => onClientSelect(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-wigoo-dark border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-wigoo-primary/50 transition-all appearance-none cursor-pointer"
                >
                  {CLIENTS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest ml-1">Data Início</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-wigoo-dark border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-wigoo-primary/50 transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest ml-1">Data Fim</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-wigoo-dark border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-wigoo-primary/50 transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleSync}
            disabled={isLoading}
            className={`h-[52px] px-8 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 whitespace-nowrap shadow-xl ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Sincronizando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-sync"></i>
                Sincronizar Dados
              </>
            )}
          </button>
          {(() => {
            const monthly = getMonthlyTokens(selectedClientId);
            return monthly > 0 ? (
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30">
                <i className="fa-solid fa-microchip text-[8px] text-wigoo-primary/50"></i>
                {formatTokenCount(monthly)} tokens este mês
              </div>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default LiveConnectionPanel;
