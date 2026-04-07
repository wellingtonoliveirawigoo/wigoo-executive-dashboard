import React, { useCallback, useRef, useState } from 'react';
import { Creative } from '../types';

interface Props {
  onImagesLoaded: (creatives: Creative[]) => void;
}

const CreativeUpload: React.FC<Props> = ({ onImagesLoaded }) => {
  const [previews, setPreviews] = useState<{ name: string; dataUrl: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFilesAsDataUrls = useCallback((files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'));
    if (images.length === 0) return;

    const promises = images.map(file =>
      new Promise<{ name: string; dataUrl: string }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve({
            name: file.name.replace(/\.[^/.]+$/, ''),
            dataUrl: reader.result as string,
          });
        reader.readAsDataURL(file);
      })
    );

    Promise.all(promises).then(results =>
      setPreviews(prev => {
        // Evita duplicatas pelo nome
        const existing = new Set(prev.map(p => p.name));
        return [...prev, ...results.filter(r => !existing.has(r.name))];
      })
    );
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      readFilesAsDataUrls(Array.from(e.dataTransfer.files));
    },
    [readFilesAsDataUrls]
  );

  const handleAnalyze = () => {
    if (previews.length === 0) return;
    const zero = { current: 0, previous: 0 };
    const creatives: Creative[] = previews.map(p => ({
      name: p.name,
      url: p.dataUrl,   // data URL — urlToBase64 extrai diretamente
      investment: zero,
      impressions: zero,
      clicks: zero,
      conversions: zero,
      revenue: zero,
      daysRunning: 0,
      metricNames: { conversions: 'Conversões', revenue: 'Receita', efficiency: 'ROAS' },
    }));
    onImagesLoaded(creatives);
  };

  return (
    <div className="w-full max-w-[1200px] space-y-8">

      {/* Header */}
      <div className="bg-white dark:bg-wigoo-gray p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-wigoo-gradient"></div>
        <h2 className="text-[12px] font-black text-wigoo-accent uppercase tracking-[0.6em] mb-2">
          Creative Intelligence
        </h2>
        <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
          Upload{' '}
          <span className="text-gray-300 mx-2 font-thin italic">& Analyze</span>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Carregue os criativos para análise visual completa pela Wigoo AI
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-[3rem] border-2 border-dashed p-16 flex flex-col items-center justify-center gap-6 transition-all duration-300 ${
          isDragging
            ? 'border-wigoo-primary bg-wigoo-primary/5 scale-[1.01]'
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-wigoo-gray hover:border-wigoo-primary/50 hover:bg-wigoo-primary/[0.02]'
        } shadow-xl`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && readFilesAsDataUrls(Array.from(e.target.files))}
        />
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
            isDragging ? 'bg-wigoo-primary' : 'bg-wigoo-primary/10'
          }`}
        >
          <i
            className={`fa-solid fa-cloud-arrow-up text-3xl ${
              isDragging ? 'text-white' : 'text-wigoo-primary'
            }`}
          ></i>
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-gray-900 dark:text-white">
            Arraste os criativos aqui
          </p>
          <p className="text-sm text-gray-400 mt-2">ou clique para selecionar imagens</p>
          <p className="text-[10px] text-gray-300 dark:text-white/20 mt-1 uppercase tracking-widest">
            JPG · PNG · WEBP · GIF
          </p>
        </div>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-8 animate-in fade-in">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            {previews.length} criativo{previews.length !== 1 ? 's' : ''} carregado
            {previews.length !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {previews.map((p, idx) => (
              <div
                key={idx}
                className="relative group rounded-3xl overflow-hidden bg-gray-100 dark:bg-wigoo-dark aspect-square shadow-lg border border-gray-100 dark:border-white/5"
              >
                <img
                  src={p.dataUrl}
                  alt={p.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setPreviews(prev => prev.filter((_, i) => i !== idx));
                    }}
                    className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-rose-50"
                  >
                    <i className="fa-solid fa-xmark text-rose-500 text-sm"></i>
                  </button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-[9px] font-black truncate uppercase tracking-wide">
                    {p.name}
                  </p>
                </div>
              </div>
            ))}

            {/* Add More */}
            <div
              onClick={() => inputRef.current?.click()}
              className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-wigoo-primary/50 hover:bg-wigoo-primary/[0.02] transition-all"
            >
              <i className="fa-solid fa-plus text-2xl text-gray-300 dark:text-white/20"></i>
              <p className="text-[9px] font-black text-gray-300 dark:text-white/20 uppercase tracking-widest">
                Adicionar
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPreviews([])}
              className="px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 dark:border-white/10 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all"
            >
              <i className="fa-solid fa-trash mr-2"></i> Limpar
            </button>
            <button
              onClick={handleAnalyze}
              className="px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-wigoo-primary text-white shadow-2xl shadow-wigoo-primary/30 hover:shadow-wigoo-primary/50 hover:scale-105 transition-all"
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
              Analisar {previews.length} Criativo{previews.length !== 1 ? 's' : ''} com IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeUpload;
