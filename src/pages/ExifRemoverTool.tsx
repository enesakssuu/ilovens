import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldOff, Download, CheckCircle2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { downloadFile } from '../utils/imageProcessor';

export default function ExifRemoverTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; beforeKB: number; afterKB: number } | null>(null);

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

      // Drawing to Canvas strips all EXIF metadata
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const ext = mime === 'image/png' ? 'png' : 'jpg';
      const dataUrl = canvas.toDataURL(mime, 0.95);

      // Calculate output size
      const base64Size = dataUrl.length * 0.75;
      const base = file.name.replace(/\.[^.]+$/, '');
      setResult({
        url: dataUrl,
        name: `${base}_clean.${ext}`,
        beforeKB: Math.round(file.size / 1024),
        afterKB: Math.round(base64Size / 1024),
      });
    } finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadFile(result.url, result.name);
  };

  const exifFields = [
    isEnglish ? 'GPS Location' : 'GPS Konumu',
    isEnglish ? 'Camera Model' : 'Kamera Modeli',
    isEnglish ? 'Date & Time' : 'Tarih & Saat',
    isEnglish ? 'Lens Info' : 'Lens Bilgisi',
    isEnglish ? 'Author / Copyright' : 'Yazar / Telif Hakkı',
    isEnglish ? 'Software' : 'Yazılım',
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />{isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <ShieldOff size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">EXIF Data Remover</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Strip all hidden metadata for 100% privacy.' : 'Gizli meta verileri silerek %100 gizlilik sağla.'}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.6)' }}>
        {/* What gets removed */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {exifFields.map((f) => (
            <div key={f} className="flex items-center gap-1.5 text-xs font-medium text-apple-secondary px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <ShieldOff size={11} className="text-emerald-500" strokeWidth={2} />{f}
            </div>
          ))}
        </div>

        <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

        {file && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleProcess} disabled={processing} className="btn-primary w-full py-3" style={{ background: '#059669' }}>
            {processing ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{isEnglish ? 'Removing EXIF...' : 'EXIF siliniyor...'}</> : <><ShieldOff size={16} strokeWidth={1.75} />{isEnglish ? 'Remove EXIF & Download' : 'EXIF Sil ve İndir'}</>}
          </motion.button>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 space-y-4" style={{ background: 'rgba(240,253,244,0.9)', border: '1px solid rgba(5,150,105,0.15)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" strokeWidth={1.75} /><span className="font-semibold text-sm text-emerald-800">{isEnglish ? 'EXIF data removed!' : 'EXIF verisi silindi!'}</span></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white/70 rounded-2xl">
                  <p className="text-[10px] text-apple-secondary mb-0.5">{isEnglish ? 'Before' : 'Önce'}</p>
                  <p className="text-base font-bold text-apple-text">{result.beforeKB} KB</p>
                </div>
                <div className="text-center p-3 bg-white/70 rounded-2xl">
                  <p className="text-[10px] text-apple-secondary mb-0.5">{isEnglish ? 'After' : 'Sonra'}</p>
                  <p className="text-base font-bold text-emerald-600">{result.afterKB} KB</p>
                </div>
                <div className="text-center p-3 bg-emerald-500 rounded-2xl">
                  <p className="text-[10px] text-emerald-100 mb-0.5">{isEnglish ? 'Privacy' : 'Gizlilik'}</p>
                  <p className="text-base font-bold text-white">100%</p>
                </div>
              </div>
              <button onClick={handleDownload} className="btn-primary w-full" style={{ background: '#059669' }}><Download size={16} strokeWidth={1.75} />{isEnglish ? 'Download Clean Image' : 'Temiz Görseli İndir'}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
