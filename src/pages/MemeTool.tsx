import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Laugh, Download, CheckCircle2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { downloadFile } from '../utils/imageProcessor';
import { trackEvent } from '../utils/analytics';

export default function MemeTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  useEffect(() => {
    trackEvent({ type: 'pageview', toolId: 'meme', toolName: 'Meme Generator' });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(48);
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

      const actualFontSize = Math.max(24, Math.round(img.naturalWidth * (fontSize / 800)));
      ctx.font = `900 ${actualFontSize}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = actualFontSize * 0.08;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#FFFFFF';

      const drawText = (text: string, y: number) => {
        if (!text.trim()) return;
        ctx.strokeText(text.toUpperCase(), img.naturalWidth / 2, y);
        ctx.fillText(text.toUpperCase(), img.naturalWidth / 2, y);
      };

      if (topText) drawText(topText, actualFontSize + 16);
      if (bottomText) drawText(bottomText, img.naturalHeight - 20);

      const base = file.name.replace(/\.[^.]+$/, '');
      const dataUrl = canvas.toDataURL('image/jpeg', 0.93);
      setResult({ url: dataUrl, name: `${base}_meme.jpg` });
      trackEvent({
        type: 'tool_use',
        toolId: 'meme',
        toolName: 'Meme Generator',
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
      toolId: 'meme',
      toolName: 'Meme Generator',
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
        <div className="w-11 h-11 bg-yellow-500 rounded-2xl flex items-center justify-center text-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Laugh size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">{isEnglish ? 'Meme Generator' : 'Meme Üretici'}</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Add Impact-style captions to any image.' : 'Herhangi bir görsele Impact stili başlık ekle.'}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

        <AnimatePresence>
          {file && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <label className="label-text">{isEnglish ? 'Top Text' : 'Üst Metin'}</label>
                <input type="text" value={topText} onChange={e => { setTopText(e.target.value); setResult(null); }}
                  placeholder={isEnglish ? 'e.g. WHEN YOU FINALLY...' : 'örn. SONUNDA...'}
                  className="input-field" maxLength={80} />
              </div>
              <div>
                <label className="label-text">{isEnglish ? 'Bottom Text' : 'Alt Metin'}</label>
                <input type="text" value={bottomText} onChange={e => { setBottomText(e.target.value); setResult(null); }}
                  placeholder={isEnglish ? 'e.g. BUT IT WAS NOT ENOUGH' : 'örn. AMA YETERLİ DEĞİLDİ'}
                  className="input-field" maxLength={80} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="label-text mb-0">{isEnglish ? 'Font Size' : 'Yazı Boyutu'}</label>
                  <span className="text-xs font-bold text-apple-blue tabular-nums">{fontSize}px</span>
                </div>
                <input type="range" min={24} max={96} value={fontSize} onChange={e => { setFontSize(Number(e.target.value)); setResult(null); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {file && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleProcess} disabled={processing || (!topText && !bottomText)} className="btn-primary w-full py-3">
            {processing ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{isEnglish ? 'Creating...' : 'Oluşturuluyor...'}</> : <><Laugh size={16} strokeWidth={1.75} />{isEnglish ? 'Create Meme' : 'Meme Oluştur'}</>}
          </motion.button>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 space-y-4" style={{ background: 'rgba(254,252,232,0.9)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-yellow-500" strokeWidth={1.75} /><span className="font-semibold text-sm">{isEnglish ? 'Meme ready!' : 'Meme hazır!'}</span></div>
              <img src={result.url} className="w-full max-h-64 object-contain rounded-2xl bg-black/5" />
              <button onClick={handleDownload} className="btn-primary w-full"><Download size={16} strokeWidth={1.75} />{isEnglish ? 'Download Meme' : 'Meme İndir'}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
