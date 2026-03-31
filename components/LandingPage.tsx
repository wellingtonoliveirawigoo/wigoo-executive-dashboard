import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-wigoo-dark flex flex-col items-center justify-center px-6 py-20 theme-transition">
      
      {/* Background gradient orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-wigoo-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-wigoo-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center space-y-12">

        {/* Logo + Brand */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-wigoo-gradient rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700" />
            <img
              src="https://www.wigoo.com.br/icon.ico?118911a3cf296aa2"
              alt="Wigoo Logo"
              className="relative w-20 h-20 rounded-2xl shadow-2xl object-contain bg-white p-3 border border-gray-100"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <p className="text-[11px] font-black text-wigoo-primary uppercase tracking-[0.5em] mb-2">Wigoo Intelligence</p>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
              Executive<br />
              <span className="bg-clip-text text-transparent bg-wigoo-gradient">Dashboard</span>
            </h1>
          </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-1 bg-wigoo-gradient rounded-full" />

        {/* Description */}
        <div className="space-y-4 max-w-xl">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            Uma plataforma de inteligência de performance para agências e marcas que querem ver seus dados de mídia de forma clara, rápida e estratégica.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {[
              { icon: 'fa-chart-line', title: 'Performance', desc: 'KPIs, canais e comparativos de período em um único painel.' },
              { icon: 'fa-wand-magic-sparkles', title: 'Criativos', desc: 'Análise visual por IA de cada criativo com Wigoo Score.' },
              { icon: 'fa-bolt', title: 'Live Data', desc: 'Conexão em tempo real com datasets do Power BI.' },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-wigoo-gray border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-lg text-left space-y-3 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-wigoo-primary/10 flex items-center justify-center">
                  <i className={`fa-solid ${item.icon} text-wigoo-primary`} />
                </div>
                <p className="font-black text-gray-900 dark:text-white text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 dark:bg-white/5" />

        {/* CTA */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Este ambiente é exclusivo para clientes Wigoo.<br />
            Você foi direcionado aqui por engano ou quer saber mais?
          </p>
          <a
            href="https://www.wigoo.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-wigoo-gradient text-white font-black text-[11px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl shadow-lg shadow-wigoo-primary/30 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <i className="fa-solid fa-arrow-up-right-from-square" />
            Fale com a Wigoo
          </a>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest">
            contato@wigoo.com.br
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 mt-20 text-center">
        <p className="text-[10px] text-gray-300 dark:text-gray-700 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} Wigoo Intelligence · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
