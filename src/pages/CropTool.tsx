import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Crop, Download, CheckCircle2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { downloadFile } from '../utils/imageProcessor';
import { trackEvent } from '../utils/analytics';

export default function CropTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  useEffect(() => {
    trackEvent({ type: 'pageview', toolId: 'crop', toolName: 'Görsel Kırp' });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  // Crop region state (percentage-based)
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImgSrc(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleCrop = async () => {
    if (!file || !imgSrc) return;
    setProcessing(true);
    try {
      const img = new Image();
      img.src = imgSrc;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const canvas = document.createElement('canvas');
      const cropX = (crop.x / 100) * img.naturalWidth;
      const cropY = (crop.y / 100) * img.naturalHeight;
      const cropW = (crop.w / 100) * img.naturalWidth;
      const cropH = (crop.h / 100) * img.naturalHeight;

      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const ext = mime === 'image/png' ? 'png' : 'jpg';
      const dataUrl = canvas.toDataURL(mime, 0.93);
      const base = file.name.replace(/\.[^.]+$/, '');
      setResult({ url: dataUrl, name: `${base}_cropped.${ext}` });
      trackEvent({
        type: 'tool_use',
        toolId: 'crop',
        toolName: 'Görsel Kırp',
        fileSizeBefore: file.size,
        fileSizeAfter: file.size,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    downloadFile(result.url, result.name);
    trackEvent({
      type: 'download',
      toolId: 'crop',
      toolName: 'Görsel Kırp',
      fileSizeBefore: file.size,
      fileSizeAfter: file.size,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />
        {isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center text-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Crop size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">{isEnglish ? 'Crop Image' : 'Görsel Kırp'}</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Drag the region to select the crop area.' : 'Kırpma alanını sürükleyerek seç.'}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

        <AnimatePresence>
          {imgSrc && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-xs text-apple-secondary mb-3 font-medium">
                {isEnglish ? 'Adjust crop sliders:' : 'Kırpma aralığını ayarla:'}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {(['x', 'y', 'w', 'h'] as const).map((key) => (
                  <div key={key}>
                    <label className="text-[11px] font-semibold text-apple-tertiary uppercase tracking-wider mb-1 block">
                      {key === 'x' ? 'Left %' : key === 'y' ? 'Top %' : key === 'w' ? 'Width %' : 'Height %'}
                    </label>
                    <input
                      type="range" min={0} max={99} value={crop[key]}
                      onChange={(e) => setCrop(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-xs text-apple-secondary tabular-nums">{crop[key]}%</span>
                  </div>
                ))}
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black/5 border border-black/5" style={{ aspectRatio: '16/9' }}>
                <img src={imgSrc} alt="" className="w-full h-full object-contain" />
                <div
                  className="absolute border-2 border-apple-blue"
                  style={{
                    left: `${crop.x}%`, top: `${crop.y}%`,
                    width: `${crop.w}%`, height: `${crop.h}%`,
                    background: 'rgba(0,113,227,0.08)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-apple-blue rounded-sm" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-apple-blue rounded-sm" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-apple-blue rounded-sm" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-apple-blue rounded-sm" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {file && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCrop} disabled={processing} className="btn-primary w-full py-3">
            {processing ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{isEnglish ? 'Processing...' : 'İşleniyor...'}</> : <><Crop size={16} strokeWidth={1.75} />{isEnglish ? 'Crop & Download' : 'Kırp ve İndir'}</>}
          </motion.button>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 space-y-4" style={{ background: 'rgba(245,250,255,0.8)', border: '1px solid rgba(0,113,227,0.1)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={1.75} />
                <span className="font-semibold text-apple-text text-sm">{isEnglish ? 'Done!' : 'Tamamlandı!'}</span>
              </div>
              <img src={result.url} className="w-full max-h-48 object-contain rounded-2xl bg-black/5" />
              <button onClick={handleDownload} className="btn-primary w-full"><Download size={16} strokeWidth={1.75} />{isEnglish ? 'Download' : 'İndir'}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
