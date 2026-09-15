import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ImageDown, Download, CheckCircle2, Loader2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { downloadFile, formatBytes } from '../utils/imageProcessor';
import { trackEvent } from '../utils/analytics';
import heic2any from 'heic2any';

export default function HeicToJpgTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  useEffect(() => {
    trackEvent({ type: 'pageview', toolId: 'heic-to-jpg', toolName: 'HEIC to JPG' });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{ url: string; blob: Blob; fileName: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setConverting(true);
    setError(null);
    setResult(null);

    try {
      let outputBlob: Blob;

      // Check if file is HEIC/HEIF or convert via heic2any / canvas fallback
      const isHeic = /\.(heic|heif)$/i.test(selectedFile.name) || selectedFile.type.includes('heic') || selectedFile.type.includes('heif');

      if (isHeic) {
        const converted = await heic2any({
          blob: selectedFile,
          toType: 'image/jpeg',
          quality: 0.92,
        });
        outputBlob = Array.isArray(converted) ? converted[0] : converted;
      } else {
        // Fallback for normal images dropped into HEIC converter
        const img = new Image();
        const url = URL.createObjectURL(selectedFile);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        outputBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
        );
      }

      const outUrl = URL.createObjectURL(outputBlob);
      const outName = selectedFile.name.replace(/\.[^.]+$/, '') + '.jpg';
      setResult({
        url: outUrl,
        blob: outputBlob,
        fileName: outName,
        size: outputBlob.size,
      });
      trackEvent({
        type: 'tool_use',
        toolId: 'heic-to-jpg',
        toolName: 'HEIC to JPG',
        fileSizeBefore: selectedFile.size,
        fileSizeAfter: outputBlob.size,
      });
    } catch (err: any) {
      console.error('HEIC conversion failed:', err);
      setError(
        isEnglish
          ? 'Unable to decode this file. Please make sure it is a valid HEIC or image file.'
          : 'Bu dosya dönüştürülemedi. Lütfen geçerli bir HEIC veya görsel dosyası seçtiğinizden emin olun.'
      );
    } finally {
      setConverting(false);
    }
  }, [isEnglish]);

  const handleDownload = () => {
    if (!result || !file) return;
    downloadFile(result.blob, result.fileName);
    trackEvent({
      type: 'download',
      toolId: 'heic-to-jpg',
      toolName: 'HEIC to JPG',
      fileSizeBefore: file.size,
      fileSizeAfter: result.size,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        to={basePath || '/'}
        className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        {isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-11 h-11 bg-slate-700 rounded-2xl flex items-center justify-center text-white"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <ImageDown size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">HEIC → JPG</h1>
          <p className="text-apple-secondary text-sm">
            {isEnglish
              ? 'Convert Apple iPhone HEIC photos to universal JPG instantly in browser.'
              : 'Apple iPhone HEIC fotoğraflarını anında evrensel JPG formatına dönüştür.'}
          </p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 space-y-6">
        <Dropzone
          onFileSelect={handleConvert}
          selectedFile={file}
          accept=".heic,.heif,image/heic,image/heif,image/*"
        />

        {converting && (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-brand-purple">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-sm font-semibold">
              {isEnglish ? 'Converting HEIC to JPG...' : 'HEIC dosyası JPG\'ye dönüştürülüyor...'}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <AnimatePresence>
          {result && !converting && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4 border-t border-zinc-100"
            >
              <div className="flex items-center justify-between p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle2 size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      {isEnglish ? 'Conversion Complete!' : 'Dönüştürme Başarılı!'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {result.fileName} • {formatBytes(result.size)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-900/5 max-h-[360px] flex items-center justify-center p-4">
                <img
                  src={result.url}
                  alt="Converted Result"
                  className="max-h-[320px] w-auto object-contain rounded-xl shadow-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleDownload}
                  className="btn-primary px-7 py-3 text-sm font-semibold flex items-center gap-2"
                >
                  <Download size={16} strokeWidth={2} />
                  {isEnglish ? 'Download JPG' : 'JPG Olarak İndir'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
