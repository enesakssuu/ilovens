import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe2, AlertCircle } from 'lucide-react';

export default function HtmlToImageTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';
  const [url, setUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    if (!url.trim()) return;
    setProcessing(true);
    setError(null);
    try {
      // Since this requires an API key in real usage, show a demo message
      throw new Error('demo');
    } catch {
      setError(
        isEnglish
          ? 'HTML-to-image requires server-side rendering or a screenshot API. This feature needs an external service (e.g., ScreenshotMachine, Puppeteer). Coming soon!'
          : 'HTML → Görsel özelliği sunucu taraflı render veya bir ekran görüntüsü API\'si gerektirir. Bu özellik yakında eklenecek!'
      );
    } finally { setProcessing(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />{isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-teal-500 rounded-2xl flex items-center justify-center text-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Globe2 size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">{isEnglish ? 'HTML to Image' : 'HTML → Görsel'}</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Capture a screenshot of any webpage URL.' : 'Herhangi bir web sayfasının ekran görüntüsünü al.'}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <div>
          <label className="label-text">{isEnglish ? 'Webpage URL' : 'Web Sayfası URL\'si'}</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="input-field"
          />
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleCapture} disabled={processing || !url.trim()} className="btn-primary w-full py-3" style={{ background: '#14b8a6' }}>
          {processing
            ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{isEnglish ? 'Capturing...' : 'Yakalanıyor...'}</>
            : <><Globe2 size={16} strokeWidth={1.75} />{isEnglish ? 'Capture Screenshot' : 'Ekran Görüntüsü Al'}</>}
        </motion.button>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(240,253,250,0.9)', border: '1px solid rgba(20,184,166,0.15)' }}>
            <AlertCircle size={18} className="text-teal-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-sm text-apple-secondary leading-relaxed">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
