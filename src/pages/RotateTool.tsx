import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Download, CheckCircle2, FlipHorizontal, FlipVertical } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { downloadFile } from '../utils/imageProcessor';

type Mode = 'cw' | 'ccw' | 'flipH' | 'flipV';

export default function RotateTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode>('cw');

  const handleFileSelect = useCallback((f: File) => { setFile(f); setResult(null); }, []);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const reader = new FileReader();
      const imgSrc: string = await new Promise((res) => {
        reader.onload = (e) => res(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      const img = new Image();
      img.src = imgSrc;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const iw = img.naturalWidth, ih = img.naturalHeight;

      if (selectedMode === 'flipH' || selectedMode === 'flipV') {
        canvas.width = iw; canvas.height = ih;
        ctx.save();
        if (selectedMode === 'flipH') { ctx.scale(-1, 1); ctx.drawImage(img, -iw, 0); }
        else { ctx.scale(1, -1); ctx.drawImage(img, 0, -ih); }
        ctx.restore();
      } else {
        canvas.width = ih; canvas.height = iw;
        ctx.save();
        if (selectedMode === 'cw') { ctx.translate(ih, 0); ctx.rotate(Math.PI / 2); }
        else { ctx.translate(0, iw); ctx.rotate(-Math.PI / 2); }
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      }

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const ext = mime === 'image/png' ? 'png' : 'jpg';
      const dataUrl = canvas.toDataURL(mime, 0.93);
      const base = file.name.replace(/\.[^.]+$/, '');
      setResult({ url: dataUrl, name: `${base}_rotated.${ext}` });
    } finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadFile(result.url, result.name);
  };

  const modes = [
    { key: 'cw' as Mode, label: isEnglish ? '90° Clockwise' : '90° Saat Yönünde', icon: <RotateCcw size={18} strokeWidth={1.75} className="scale-x-[-1]" /> },
    { key: 'ccw' as Mode, label: isEnglish ? '90° Counter-CW' : '90° Ters Saat', icon: <RotateCcw size={18} strokeWidth={1.75} /> },
    { key: 'flipH' as Mode, label: isEnglish ? 'Flip Horizontal' : 'Yatay Çevir', icon: <FlipHorizontal size={18} strokeWidth={1.75} /> },
    { key: 'flipV' as Mode, label: isEnglish ? 'Flip Vertical' : 'Dikey Çevir', icon: <FlipVertical size={18} strokeWidth={1.75} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />{isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <RotateCcw size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">{isEnglish ? 'Rotate & Flip' : 'Döndür & Çevir'}</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Rotate any direction or flip your image.' : 'Her yönde döndür veya yatay/dikey çevir.'}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

        <AnimatePresence>
          {file && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2">
              {modes.map((m) => (
                <button key={m.key} onClick={() => { setSelectedMode(m.key); setResult(null); }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${selectedMode === m.key ? 'border-apple-blue bg-blue-50/60 text-apple-blue' : 'border-transparent bg-black/5 text-apple-secondary hover:bg-black/8'}`}>
                  {m.icon}{m.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {file && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleProcess} disabled={processing} className="btn-primary w-full py-3">
            {processing ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{isEnglish ? 'Processing...' : 'İşleniyor...'}</> : <><RotateCcw size={16} strokeWidth={1.75} />{isEnglish ? 'Apply & Download' : 'Uygula ve İndir'}</>}
          </motion.button>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 space-y-4" style={{ background: 'rgba(245,250,255,0.8)', border: '1px solid rgba(0,113,227,0.1)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" strokeWidth={1.75} /><span className="font-semibold text-sm">{isEnglish ? 'Done!' : 'Tamamlandı!'}</span></div>
              <img src={result.url} className="w-full max-h-48 object-contain rounded-2xl bg-black/5" />
              <button onClick={handleDownload} className="btn-primary w-full"><Download size={16} strokeWidth={1.75} />{isEnglish ? 'Download' : 'İndir'}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
