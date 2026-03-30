import React, { useState, useEffect } from 'react';
import { PERFORMANCE_AI_PROMPT } from '../services/gemini';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  customPrompt: string | null;
  setCustomPrompt: (val: string | null) => void;
}

const ADMIN_CREDENTIALS = {
  email: "wellington.oliveira@wigoo.com.br",
  password: "We1471995*"
};

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, customPrompt, setCustomPrompt }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promptValue, setPromptValue] = useState(customPrompt || PERFORMANCE_AI_PROMPT);

  useEffect(() => {
    if (isOpen) {
      setPromptValue(customPrompt || PERFORMANCE_AI_PROMPT);
    }
  }, [isOpen, customPrompt]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAuth(true);
    } else {
      alert("Credenciais inválidas.");
    }
  };

  const handleSave = () => {
    localStorage.setItem('wigoo_custom_prompt', promptValue);
    setCustomPrompt(promptValue);
    alert("Configurações salvas com sucesso!");
    onClose();
  };

  const handleRestore = () => {
    if (confirm("Deseja restaurar as diretrizes padrão da Wigoo AI?")) {
      localStorage.removeItem('wigoo_custom_prompt');
      setCustomPrompt(null);
      setPromptValue(PERFORMANCE_AI_PROMPT);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-wigoo-gray border border-gray-200 dark:border-wigoo-gray-light w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 theme-transition">
        <div className="p-6 bg-gray-50 dark:bg-wigoo-dark border-b border-gray-100 dark:border-wigoo-gray-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wigoo-primary/10 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-wigoo-primary"></i>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Painel de Controle</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-8">
          {!isAuth ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest">Acesso Corporativo</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-wigoo-dark border border-gray-200 dark:border-wigoo-gray-light rounded-xl p-4 outline-none focus:ring-2 focus:ring-wigoo-primary transition-all text-gray-900 dark:text-white"
                  placeholder="exemplo@wigoo.com.br"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest">Senha Master</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-wigoo-dark border border-gray-200 dark:border-wigoo-gray-light rounded-xl p-4 outline-none focus:ring-2 focus:ring-wigoo-primary transition-all text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-wigoo-gradient py-4 rounded-xl font-black text-white shadow-lg shadow-wigoo-primary/20 hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Autenticar Gestor
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-wigoo-light/40 uppercase tracking-widest">Prompt Estratégico da IA</label>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[8px] font-black border border-emerald-100 dark:border-emerald-500/20">CONFIGURAÇÃO ATIVA</span>
                </div>
                <textarea 
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  className="w-full h-80 bg-gray-50 dark:bg-wigoo-dark border border-gray-200 dark:border-wigoo-gray-light rounded-2xl p-6 text-xs font-mono text-gray-800 dark:text-wigoo-light outline-none focus:ring-2 focus:ring-wigoo-primary transition-all resize-none shadow-inner"
                  placeholder="Defina as regras da IA..."
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleSave}
                  className="flex-grow bg-wigoo-gradient py-4 rounded-2xl font-black text-white hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-wigoo-primary/20 uppercase tracking-widest text-xs"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  Salvar Alterações
                </button>
                <button 
                  onClick={handleRestore}
                  className="px-6 bg-gray-100 dark:bg-wigoo-gray-light py-4 rounded-2xl font-bold text-gray-500 dark:text-white hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                  title="Restaurar Padrão"
                >
                  <i className="fa-solid fa-rotate-left"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;