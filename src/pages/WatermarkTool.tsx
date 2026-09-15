import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Stamp, CheckCircle2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import { watermarkImage, type WatermarkPosition, downloadFile } from '../utils/imageProcessor';

const POSITIONS: { value: WatermarkPosition; labelKey: string; icon: string }[] = [
  { value: 'topLeft', labelKey: 'watermark.positions.topLeft', icon: '↖' },
  { value: 'topRight', labelKey: 'watermark.positions.topRight', icon: '↗' },
  { value: 'bottomLeft', labelKey: 'watermark.positions.bottomLeft', icon: '↙' },
  { value: 'bottomRight', labelKey: 'watermark.positions.bottomRight', icon: '↘' },
  { value: 'center', labelKey: 'watermark.positions.center', icon: '•' },
];

export default function WatermarkTool() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('iLoveNS');
  const [position, setPosition] = useState<WatermarkPosition>('bottomRight');
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

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const watermarked = await watermarkImage(file, text, position);
      const url = URL.createObjectURL(watermarked);
      setResult({ file: watermarked, url });
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
        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-apple-sm">
          <Stamp size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-apple-text">{t('watermark.title')}</h1>
          <p className="text-apple-secondary text-sm mt-0.5">{t('watermark.subtitle')}</p>
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
              className="space-y-6"
            >
              {/* Text input */}
              <div>
                <label className="label-text">{t('watermark.textLabel')}</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setResult(null);
                  }}
                  placeholder={t('watermark.textPlaceholder')}
                  className="input-field"
                  maxLength={100}
                />
                <p className="text-xs text-apple-secondary mt-1.5 text-right">
                  {text.length}/100
                </p>
              </div>

              {/* Position selector */}
              <div>
                <label className="label-text">{t('watermark.positionLabel')}</label>

                {/* 3×2 position grid mirroring image corners */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {/* Row 1: top-left, (empty), top-right */}
                  {['topLeft', 'center_placeholder', 'topRight'].map((pos) => {
                    if (pos === 'center_placeholder') {
                      return (
                        <button
                          key="center"
                          onClick={() => { setPosition('center'); setResult(null); }}
                          className={`
                            flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 text-lg
                            ${position === 'center'
                              ? 'border-apple-blue bg-blue-50'
                              : 'border-apple-border bg-white hover:border-apple-blue/40'
                            }
                          `}
                        >
                          <span>⊕</span>
                          <span className="text-[10px] font-semibold text-apple-secondary">
                            {t('watermark.positions.center')}
                          </span>
                        </button>
                      );
                    }
                    const item = POSITIONS.find(p => p.value === pos)!;
                    return (
                      <button
                        key={pos}
                        onClick={() => { setPosition(pos as WatermarkPosition); setResult(null); }}
                        className={`
                          flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 text-lg
                          ${position === pos
                            ? 'border-apple-blue bg-blue-50'
                            : 'border-apple-border bg-white hover:border-apple-blue/40'
                          }
                        `}
                      >
                        <span>{item.icon}</span>
                        <span className="text-[10px] font-semibold text-apple-secondary">
                          {t(item.labelKey)}
                        </span>
                      </button>
                    );
                  })}

                  {/* Row 2: bottom-left, (spacer), bottom-right */}
                  {['bottomLeft', null, 'bottomRight'].map((pos, idx) => {
                    if (!pos) return <div key={idx} />;
                    const item = POSITIONS.find(p => p.value === pos)!;
                    return (
                      <button
                        key={pos}
                        onClick={() => { setPosition(pos as WatermarkPosition); setResult(null); }}
                        className={`
                          flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 text-lg
                          ${position === pos
                            ? 'border-apple-blue bg-blue-50'
                            : 'border-apple-border bg-white hover:border-apple-blue/40'
                          }
                        `}
                      >
                        <span>{item.icon}</span>
                        <span className="text-[10px] font-semibold text-apple-secondary">
                          {t(item.labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

        {file && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleWatermark}
            disabled={processing || !text.trim()}
            className="btn-primary w-full text-base py-3.5"
          >
            {processing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('watermark.processing')}
              </>
            ) : (
              <>
                <Stamp size={18} />
                {t('watermark.btn')}
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
              className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 size={20} className="text-orange-500" />
                <span className="font-bold text-orange-700 text-sm">
                  {isEnglish ? 'Watermark applied!' : 'Filigran eklendi!'}
                </span>
              </div>

              <img
                src={result.url}
                alt="Watermarked preview"
                className="w-full max-h-56 object-contain rounded-2xl bg-white border border-orange-100 mb-5"
              />

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
