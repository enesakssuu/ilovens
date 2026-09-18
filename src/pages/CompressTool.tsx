import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Minimize2, CheckCircle2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { compressImage, formatBytes, savingsPercent, downloadFile } from '../utils/imageProcessor';
import { trackEvent } from '../utils/analytics';
import ToolSEOContent from '../components/ToolSEOContent';

export default function CompressTool() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  useEffect(() => {
    trackEvent({ type: 'pageview', toolId: 'compress', toolName: 'Görsel Sıkıştır' });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const compressed = await compressImage(file, quality / 100);
      const url = URL.createObjectURL(compressed);
      setResult({ file: compressed, url });
      trackEvent({
        type: 'tool_use',
        toolId: 'compress',
        toolName: 'Görsel Sıkıştır',
        fileSizeBefore: file.size,
        fileSizeAfter: compressed.size,
      });
    } catch (err) {
      setError(isEnglish ? 'Processing failed. Please try another image.' : 'İşlem başarısız. Lütfen başka bir görsel deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    downloadFile(result.file, result.file.name);
    trackEvent({
      type: 'download',
      toolId: 'compress',
      toolName: 'Görsel Sıkıştır',
      fileSizeBefore: file.size,
      fileSizeAfter: result.file.size,
    });
  };

  const savings = result && file
    ? savingsPercent(file.size, result.file.size)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Back button */}
      <Link
        to={basePath || '/'}
        className="inline-flex items-center gap-2 text-apple-secondary hover:text-apple-text text-sm font-semibold mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('common.back')}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-apple-sm">
          <Minimize2 size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-apple-text">
            {t('compress.title')}
          </h1>
          <p className="text-apple-secondary text-sm mt-0.5">{t('compress.subtitle')}</p>
        </div>
      </div>

      {/* Card */}
      <div className="card p-6 sm:p-8 space-y-8">
        {/* Dropzone */}
        <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

        {/* Quality slider */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="label-text">{t('compress.qualityLabel')}</label>
                <span className="text-2xl font-extrabold tracking-tighter text-apple-blue tabular-nums">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={quality}
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setResult(null);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-apple-secondary">
                <span>{isEnglish ? 'Smaller file' : 'Küçük dosya'}</span>
                <span>{isEnglish ? 'Better quality' : 'Yüksek kalite'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm font-medium text-center">{error}</p>
        )}

        {/* Compress button */}
        {file && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCompress}
            disabled={processing}
            className="btn-primary w-full text-base py-3.5"
          >
            {processing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('compress.processing')}
              </>
            ) : (
              <>
                <Minimize2 size={18} />
                {t('compress.btn')}
              </>
            )}
          </motion.button>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <span className="font-bold text-emerald-700 text-sm">
                  {isEnglish ? 'Compression complete!' : 'Sıkıştırma tamamlandı!'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-white/80 rounded-2xl p-4 text-center border border-emerald-100">
                  <p className="text-xs text-apple-secondary mb-1">{t('compress.before')}</p>
                  <p className="text-lg font-extrabold tracking-tight text-apple-text">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <div className="bg-white/80 rounded-2xl p-4 text-center border border-emerald-100">
                  <p className="text-xs text-apple-secondary mb-1">{t('compress.after')}</p>
                  <p className="text-lg font-extrabold tracking-tight text-emerald-600">
                    {formatBytes(result.file.size)}
                  </p>
                </div>
                <div className="bg-emerald-500 rounded-2xl p-4 text-center">
                  <p className="text-xs text-emerald-100 mb-1">{t('compress.saving')}</p>
                  <p className="text-lg font-extrabold tracking-tight text-white">
                    {savings}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="btn-primary w-full"
              >
                <Download size={18} />
                {t('common.download')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToolSEOContent toolId="compress" />
    </div>
  );
}
