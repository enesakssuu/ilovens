import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Maximize2, CheckCircle2, Lock, Unlock } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { resizeImage, getImageDimensions, downloadFile } from '../utils/imageProcessor';

export default function ResizeTool() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [origW, setOrigW] = useState<number>(0);
  const [origH, setOrigH] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    try {
      const dims = await getImageDimensions(f);
      setOrigW(dims.width);
      setOrigH(dims.height);
      setWidth(dims.width);
      setHeight(dims.height);
    } catch {
      // ignore
    }
  }, []);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && origW > 0 && origH > 0) {
      setHeight(Math.round((val / origW) * origH));
    }
    setResult(null);
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && origW > 0 && origH > 0) {
      setWidth(Math.round((val / origH) * origW));
    }
    setResult(null);
  };

  const handleResize = async () => {
    if (!file || !width || !height) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const resized = await resizeImage(file, width, height);
      const url = URL.createObjectURL(resized);
      setResult({ file: resized, url });
    } catch {
      setError(isEnglish ? 'Processing failed.' : 'İşlem başarısız oldu.');
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
        <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center text-white shadow-apple-sm">
          <Maximize2 size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-apple-text">{t('resize.title')}</h1>
          <p className="text-apple-secondary text-sm mt-0.5">{t('resize.subtitle')}</p>
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
              className="space-y-5"
            >
              {origW > 0 && (
                <p className="text-xs text-apple-secondary font-medium">
                  {isEnglish ? 'Original:' : 'Orijinal:'}{' '}
                  <span className="text-apple-text font-bold">{origW} × {origH}px</span>
                </p>
              )}

              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div>
                  <label className="label-text">{t('resize.widthLabel')}</label>
                  <input
                    type="number"
                    min={1}
                    max={8000}
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                {/* Lock ratio button */}
                <button
                  onClick={() => setLockRatio(!lockRatio)}
                  className={`mb-0.5 w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                    lockRatio
                      ? 'bg-apple-blue border-apple-blue text-white shadow-apple-sm'
                      : 'bg-white border-apple-border text-apple-secondary hover:border-apple-blue'
                  }`}
                  title={t('resize.lockRatio')}
                >
                  {lockRatio ? <Lock size={15} /> : <Unlock size={15} />}
                </button>

                <div>
                  <label className="label-text">{t('resize.heightLabel')}</label>
                  <input
                    type="number"
                    min={1}
                    max={8000}
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              {lockRatio && (
                <p className="text-xs text-apple-secondary flex items-center gap-1.5">
                  <Lock size={11} />
                  {isEnglish ? 'Aspect ratio locked' : 'En-boy oranı kilitli'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

        {file && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleResize}
            disabled={processing || !width || !height}
            className="btn-primary w-full text-base py-3.5"
          >
            {processing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('resize.processing')}
              </>
            ) : (
              <>
                <Maximize2 size={18} />
                {t('resize.btn')}
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
              className="rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 size={20} className="text-violet-500" />
                <span className="font-bold text-violet-700 text-sm">
                  {isEnglish ? 'Resize complete!' : 'Yeniden boyutlandırma tamamlandı!'}
                </span>
              </div>

              {/* Preview */}
              <img
                src={result.url}
                alt="Resized preview"
                className="w-full max-h-56 object-contain rounded-2xl bg-white border border-violet-100 mb-5"
              />

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/80 rounded-2xl p-4 text-center border border-violet-100">
                  <p className="text-xs text-apple-secondary mb-1">{isEnglish ? 'Dimensions' : 'Boyutlar'}</p>
                  <p className="text-base font-extrabold tracking-tight text-violet-600">
                    {width} × {height}
                  </p>
                </div>
                <div className="bg-white/80 rounded-2xl p-4 text-center border border-violet-100">
                  <p className="text-xs text-apple-secondary mb-1">{isEnglish ? 'File size' : 'Dosya boyutu'}</p>
                  <p className="text-base font-extrabold tracking-tight text-apple-text">
                    {(result.file.size / 1024).toFixed(1)} KB
                  </p>
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
    </div>
  );
}
