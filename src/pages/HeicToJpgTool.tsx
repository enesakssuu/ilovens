import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ImageDown, AlertCircle } from 'lucide-react';

export default function HeicToJpgTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />{isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-slate-700 rounded-2xl flex items-center justify-center text-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <ImageDown size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">HEIC → JPG</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Convert Apple iPhone HEIC photos to universal JPG.' : 'Apple iPhone HEIC fotoğraflarını evrensel JPG formatına dönüştür.'}</p>
        </div>
      </div>

      <div className="glass-card p-8 space-y-6 text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto">
          <AlertCircle size={28} className="text-slate-400" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-apple-text">
            {isEnglish ? 'Native Browser Limitation' : 'Tarayıcı Kısıtlaması'}
          </h2>
          <p className="text-apple-secondary text-sm leading-relaxed max-w-md mx-auto">
            {isEnglish
              ? 'HEIC is Apple\'s proprietary format. Modern browsers cannot natively decode HEIC files without a native codec or server-side library. As this app is 100% serverless, we recommend using the Convert tool for JPG/PNG/WebP which fully works in-browser.'
              : 'HEIC, Apple\'ın tescilli formatıdır. Modern tarayıcılar, yerli bir codec veya sunucu taraflı kütüphane olmadan HEIC dosyalarını çözemez. Bu uygulama %100 sunucusuz olduğundan, tam tarayıcıda çalışan JPG/PNG/WebP için Dönüştür aracını kullanmanızı öneririz.'}
          </p>
        </div>
        <div className="inline-flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`${basePath}/convert`} className="btn-primary px-6 py-2.5">
            <ImageDown size={15} strokeWidth={1.75} />
            {isEnglish ? 'Use Convert Tool' : 'Dönüştür Aracını Kullan'}
          </Link>
        </div>
        <p className="text-[11px] text-apple-tertiary">
          {isEnglish
            ? 'Tip: AirDrop your HEIC photo to a Mac and export as JPG from Preview.'
            : 'İpucu: HEIC fotoğrafınızı Mac\'e AirDrop ile gönderin ve Preview\'dan JPG olarak dışa aktarın.'}
        </p>
      </div>
    </div>
  );
}
