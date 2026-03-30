
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onOpenAdmin: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAdmin, theme, toggleTheme }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-wigoo-dark/95 backdrop-blur-xl border-b border-gray-200 dark:border-wigoo-gray-light/30 p-4 flex items-center justify-between no-print theme-transition shadow-sm dark:shadow-none">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="absolute -inset-1 bg-wigoo-gradient rounded-xl blur opacity-10 dark:opacity-25 group-hover:opacity-30 dark:group-hover:opacity-50 transition duration-1000"></div>
          <img 
            src="https://www.wigoo.com.br/icon.ico?118911a3cf296aa2" 
            alt="Wigoo Logo" 
            className="relative w-11 h-11 rounded-xl shadow-lg dark:shadow-2xl object-contain bg-white p-1.5 border border-gray-100 dark:border-transparent"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="h-8 w-px bg-gray-200 dark:bg-wigoo-gray-light/30 hidden sm:block"></div>
        <div className="hidden sm:flex flex-col">
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Executive Dashboard</h1>
          <p className="text-[10px] text-wigoo-primary dark:text-wigoo-accent font-bold uppercase tracking-widest mt-1">Inteligência de Performance</p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8">
        {/* Theme Toggle Switch */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-wigoo-gray-light/20 p-1 rounded-full border border-gray-200 dark:border-white/5">
          <button 
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${theme === 'light' ? 'bg-white text-wigoo-primary shadow-sm' : 'text-gray-400'}`}
          >
            <i className="fa-solid fa-sun text-sm"></i>
          </button>
          <button 
            onClick={() => theme === 'light' && toggleTheme()}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${theme === 'dark' ? 'bg-wigoo-primary text-white shadow-sm' : 'text-gray-500'}`}
          >
            <i className="fa-solid fa-moon text-sm"></i>
          </button>
        </div>

        <div className="text-right hidden md:block">
          <p className="text-[9px] text-gray-400 dark:text-wigoo-light/30 font-black uppercase tracking-[0.2em]">Sessão de Insights</p>
          <p className="text-sm font-mono text-wigoo-primary dark:text-wigoo-accent font-bold">{time.toLocaleTimeString('pt-BR')}</p>
        </div>
        
        <button 
          onClick={onOpenAdmin}
          className="p-3 text-gray-400 dark:text-wigoo-light/40 hover:text-gray-900 dark:hover:text-white transition-all bg-gray-100 dark:bg-wigoo-gray-light/20 hover:bg-gray-200 dark:hover:bg-wigoo-gray-light/40 rounded-2xl border border-gray-200 dark:border-white/5"
          title="Configurações Admin"
        >
          <i className="fa-solid fa-sliders text-lg"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
