import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { convertImage, type ImageFormat, downloadFile } from '../utils/imageProcessor';
import { trackEvent } from '../utils/analytics';
import ToolSEOContent from '../components/ToolSEOContent';

const FORMAT_OPTIONS: { value: ImageFormat; label: string; description: string; color: string }[] = [
  { value: 'jpeg', label: 'JPG', description: 'Best for photos', color: 'bg-orange-500' },
  { value: 'png', label: 'PNG', description: 'Supports transparency', color: 'bg-[#0071E3]' },
  { value: 'webp', label: 'WebP', description: 'Modern format, smaller size', color: 'bg-emerald-500' },
];

export default function ConvertTool() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  useEffect(() => {
    trackEvent({ type: 'pageview', toolId: 'convert', toolName: 'Format Dönüştür' });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
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

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const converted = await convertImage(file, targetFormat);
      const url = URL.createObjectURL(converted);
      setResult({ file: converted, url });
      trackEvent({
        type: 'tool_use',
        toolId: 'convert',
        toolName: 'Format Dönüştür',
        fileSizeBefore: file.size,
        fileSizeAfter: converted.size,
      });
    } catch (err) {
      setError(isEnglish ? 'Processing failed. Please try another image.' : 'İşlem başarısız. Lütfen başka bir görsel deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadFile(result.file, result.file.name);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-2 text-apple-secondary hover:text-apple-text text-sm font-semibold mb-8 transition-colors">
        <ArrowLeft size={16} />
        {t('common.back')}
      </Link>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-apple-sm">
          <RefreshCw size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-apple-text">{t('convert.title')}</h1>
          <p className="text-apple-secondary text-sm mt-0.5">{t('convert.subtitle')}</p>
        </div>
      </div>

      <div className="card p-6 sm:p-8 space-y-8">
        <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <label className="label-text">{t('convert.targetFormat')}</label>
              <div className="grid grid-cols-3 gap-3">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => {
                      setTargetFormat(fmt.value);
                      setResult(null);
                    }}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                      ${targetFormat === fmt.value
                        ? 'border-apple-blue bg-blue-50 shadow-blue-glow'
                        : 'border-apple-border bg-white hover:border-apple-blue/40 hover:bg-apple-bg'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 ${fmt.color} rounded-xl flex items-center justify-center`}>
                      <span className="text-white text-xs font-extrabold">{fmt.label}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-apple-text">{fmt.label}</p>
                      <p className="text-[10px] text-apple-secondary leading-tight mt-0.5">
                        {isEnglish
                          ? fmt.description
                          : fmt.value === 'jpeg' ? 'Fotoğraflar için ideal'
                          : fmt.value === 'png' ? 'Kayıpsız + şeffaflık'
                          : 'Modern, küçük boyut'}
                      </p>
                    </div>
                    {targetFormat === fmt.value && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-apple-blue rounded-full flex items-center justify-center">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Source format indicator */}
              {file && (
                <div className="flex items-center gap-3 text-sm text-apple-secondary">
                  <span className="font-medium">
                    {file.name.split('.').pop()?.toUpperCase() || 'IMG'}
                  </span>
                  <RefreshCw size={14} />
                  <span className="font-bold text-apple-blue">
                    {targetFormat.toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

        {file && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConvert}
            disabled={processing}
            className="btn-primary w-full text-base py-3.5"
          >
            {processing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('convert.processing')}
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                {t('convert.btn')}
              </>
            )}
          </motion.button>
        )}

        <AnimatePresence>
          {result && (
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
                  {isEnglish ? 'Conversion complete!' : 'Dönüştürme tamamlandı!'}
                </span>
              </div>

              <img
                src={result.url}
                alt="Converted preview"
                className="w-full max-h-56 object-contain rounded-2xl bg-white border border-emerald-100 mb-5"
              />

              <div className="flex items-center gap-2 mb-5">
                <div className="text-xs font-medium text-apple-secondary bg-white px-3 py-1.5 rounded-full border border-emerald-100">
                  {result.file.name}
                </div>
                <div className="text-xs font-medium text-apple-secondary bg-white px-3 py-1.5 rounded-full border border-emerald-100">
                  {(result.file.size / 1024).toFixed(1)} KB
                </div>
              </div>

              <button onClick={handleDownload} className="btn-primary w-full">
                <Download size={18} />
                {t('common.download')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToolSEOContent toolId="convert" />
    </div>
  );
}
