import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wand2, Download } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { downloadFile } from '../utils/imageProcessor';

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
}

const DEFAULT: Filters = { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0 };

export default function PhotoEditorTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f); setResult(null); setFilters({ ...DEFAULT });
    const reader = new FileReader();
    reader.onload = (e) => setImgSrc(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const cssFilter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`;

  const handleApply = async () => {
    if (!file || !imgSrc) return;
    setProcessing(true);
    try {
      const img = new Image();
      img.src = imgSrc;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = cssFilter;
      ctx.drawImage(img, 0, 0);

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const ext = mime === 'image/png' ? 'png' : 'jpg';
      const dataUrl = canvas.toDataURL(mime, 0.93);
      const base = file.name.replace(/\.[^.]+$/, '');
      setResult({ url: dataUrl, name: `${base}_edited.${ext}` });
    } finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadFile(result.url, result.name);
  };

  const sliders: { key: keyof Filters; label: string; min: number; max: number; unit: string }[] = [
    { key: 'brightness', label: isEnglish ? 'Brightness' : 'Parlaklık', min: 0, max: 200, unit: '%' },
    { key: 'contrast', label: isEnglish ? 'Contrast' : 'Kontrast', min: 0, max: 200, unit: '%' },
    { key: 'saturation', label: isEnglish ? 'Saturation' : 'Doygunluk', min: 0, max: 300, unit: '%' },
    { key: 'blur', label: isEnglish ? 'Blur' : 'Bulanıklık', min: 0, max: 20, unit: 'px' },
    { key: 'grayscale', label: isEnglish ? 'Grayscale' : 'Gri Ton', min: 0, max: 100, unit: '%' },
    { key: 'sepia', label: isEnglish ? 'Sepia' : 'Sepya', min: 0, max: 100, unit: '%' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />{isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#c026d3,#7c3aed)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Wand2 size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">{isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü'}</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Adjust brightness, contrast, saturation, filters and more.' : 'Parlaklık, kontrast, doygunluk ve filtreleri ayarla.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="glass-card p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

          <AnimatePresence>
            {file && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {sliders.map((s) => (
                  <div key={s.key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider">{s.label}</label>
                      <span className="text-xs font-bold text-apple-blue tabular-nums">{filters[s.key]}{s.unit}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} value={filters[s.key]}
                      onChange={e => { setFilters(prev => ({ ...prev, [s.key]: Number(e.target.value) })); setResult(null); }} />
                  </div>
                ))}
                <button onClick={() => { setFilters({ ...DEFAULT }); setResult(null); }}
                  className="w-full text-sm font-medium text-apple-secondary hover:text-apple-text py-2 rounded-xl hover:bg-black/5 transition-all">
                  {isEnglish ? 'Reset All' : 'Sıfırla'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {file && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleApply} disabled={processing} className="btn-primary w-full py-3" style={{ background: '#9333ea' }}>
              {processing ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{isEnglish ? 'Applying...' : 'Uygulanıyor...'}</> : <><Wand2 size={16} strokeWidth={1.75} />{isEnglish ? 'Apply & Download' : 'Uygula ve İndir'}</>}
            </motion.button>
          )}
        </div>

        {/* Preview */}
        <div className="glass-card p-6 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <p className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider">{isEnglish ? 'Live Preview' : 'Canlı Önizleme'}</p>
          {imgSrc ? (
            <div className="flex-1 flex items-center justify-center rounded-2xl overflow-hidden bg-black/5 min-h-[200px]">
              <img src={imgSrc} alt="Preview" className="max-w-full max-h-[350px] object-contain" style={{ filter: cssFilter }} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-2xl bg-black/5 min-h-[200px]">
              <p className="text-apple-tertiary text-sm">{isEnglish ? 'Upload an image to preview' : 'Önizleme için görsel yükleyin'}</p>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button onClick={handleDownload} className="btn-primary w-full" style={{ background: '#9333ea' }}>
                  <Download size={16} strokeWidth={1.75} />{isEnglish ? 'Download Edited Image' : 'Düzenlenen Görseli İndir'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
