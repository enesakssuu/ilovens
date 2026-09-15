import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Download, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { downloadFile } from '../utils/imageProcessor';
import { trackEvent } from '../utils/analytics';

interface BlurRegion { x: number; y: number; w: number; h: number; }

export default function BlurFaceTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  useEffect(() => {
    trackEvent({ type: 'pageview', toolId: 'blur-face', toolName: 'Yüz Sansürle' });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [regions, setRegions] = useState<BlurRegion[]>([{ x: 30, y: 20, w: 40, h: 40 }]);
  const [blurRadius, setBlurRadius] = useState(18);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f); setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImgSrc(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleProcess = async () => {
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
      ctx.drawImage(img, 0, 0);

      for (const r of regions) {
        const rx = Math.round((r.x / 100) * img.naturalWidth);
        const ry = Math.round((r.y / 100) * img.naturalHeight);
        const rw = Math.round((r.w / 100) * img.naturalWidth);
        const rh = Math.round((r.h / 100) * img.naturalHeight);

        // Pixelate the region
        const blockSize = Math.max(4, Math.round(blurRadius * 0.8));
        const region = ctx.getImageData(rx, ry, rw, rh);
        for (let bx = 0; bx < rw; bx += blockSize) {
          for (let by = 0; by < rh; by += blockSize) {
            const idx = (by * rw + bx) * 4;
            const pr = region.data[idx], pg = region.data[idx + 1], pb = region.data[idx + 2];
            for (let px = bx; px < Math.min(bx + blockSize, rw); px++) {
              for (let py = by; py < Math.min(by + blockSize, rh); py++) {
                const pidx = (py * rw + px) * 4;
                region.data[pidx] = pr; region.data[pidx + 1] = pg; region.data[pidx + 2] = pb;
              }
            }
          }
        }
        ctx.putImageData(region, rx, ry);
      }

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const ext = mime === 'image/png' ? 'png' : 'jpg';
      const dataUrl = canvas.toDataURL(mime, 0.93);
      const base = file.name.replace(/\.[^.]+$/, '');
      setResult({ url: dataUrl, name: `${base}_blurred.${ext}` });
      trackEvent({
        type: 'tool_use',
        toolId: 'blur-face',
        toolName: 'Yüz Sansürle',
        fileSizeBefore: file.size,
        fileSizeAfter: file.size,
      });
    } finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    downloadFile(result.url, result.name);
    trackEvent({
      type: 'download',
      toolId: 'blur-face',
      toolName: 'Yüz Sansürle',
      fileSizeBefore: file.size,
      fileSizeAfter: file.size,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />{isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-red-500 rounded-2xl flex items-center justify-center text-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Eye size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">{isEnglish ? 'Blur Face / Censor' : 'Yüz Sansürle'}</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Pixelate regions to hide faces, plates, or sensitive data.' : 'Yüz, plaka veya hassas bilgileri pikselleştirerek gizle.'}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

        <AnimatePresence>
          {file && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label-text mb-0">{isEnglish ? 'Blur Intensity' : 'Bulanıklık Seviyesi'}</label>
                  <span className="text-xs font-bold text-apple-blue">{blurRadius}px</span>
                </div>
                <input type="range" min={4} max={40} value={blurRadius} onChange={e => setBlurRadius(Number(e.target.value))} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label-text mb-0">{isEnglish ? 'Blur Regions (%)' : 'Bulanık Bölgeler (%)'}</label>
                  <button onClick={() => setRegions(r => [...r, { x: 20, y: 20, w: 30, h: 30 }])}
                    className="flex items-center gap-1 text-xs font-semibold text-apple-blue hover:text-apple-blueHover px-2 py-1 rounded-lg hover:bg-blue-50 transition-all">
                    <Plus size={12} strokeWidth={2.5} />{isEnglish ? 'Add Region' : 'Bölge Ekle'}
                  </button>
                </div>
                {regions.map((r, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-black/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-apple-secondary">{isEnglish ? `Region ${i + 1}` : `Bölge ${i + 1}`}</span>
                      {regions.length > 1 && (
                        <button onClick={() => setRegions(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-1 rounded-lg hover:bg-red-50 text-apple-secondary hover:text-red-500 transition-all">
                          <Trash2 size={13} strokeWidth={1.75} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(['x', 'y', 'w', 'h'] as const).map((k) => (
                        <div key={k}>
                          <p className="text-[10px] text-apple-tertiary font-semibold uppercase mb-0.5">
                            {k === 'x' ? 'Left' : k === 'y' ? 'Top' : k === 'w' ? 'W' : 'H'}
                          </p>
                          <input type="number" min={0} max={99} value={r[k]}
                            onChange={e => setRegions(prev => prev.map((reg, idx) => idx === i ? { ...reg, [k]: Number(e.target.value) } : reg))}
                            className="input-field py-1.5 text-center text-xs" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {file && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleProcess} disabled={processing} className="btn-primary w-full py-3" style={{ background: '#ef4444' }}>
            {processing ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{isEnglish ? 'Processing...' : 'İşleniyor...'}</> : <><Eye size={16} strokeWidth={1.75} />{isEnglish ? 'Apply Blur & Download' : 'Bulanıklık Uygula'}</>}
          </motion.button>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 space-y-4" style={{ background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" strokeWidth={1.75} /><span className="font-semibold text-sm">{isEnglish ? 'Done!' : 'Tamamlandı!'}</span></div>
              <img src={result.url} className="w-full max-h-56 object-contain rounded-2xl bg-black/5" />
              <button onClick={handleDownload} className="btn-primary w-full" style={{ background: '#ef4444' }}><Download size={16} strokeWidth={1.75} />{isEnglish ? 'Download' : 'İndir'}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
