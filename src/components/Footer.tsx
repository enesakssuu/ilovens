import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export default function Footer() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const groups = [
    {
      title: isEnglish ? 'Optimize' : 'Optimizasyon',
      links: [
        { label: isEnglish ? 'Compress' : 'Sıkıştır', path: `${basePath}/compress` },
        { label: isEnglish ? 'Resize' : 'Boyutlandır', path: `${basePath}/resize` },
        { label: isEnglish ? 'Crop' : 'Kırp', path: `${basePath}/crop` },
        { label: isEnglish ? 'Rotate & Flip' : 'Döndür & Çevir', path: `${basePath}/rotate` },
        { label: 'SVG Optimizer', path: `${basePath}/svg-optimize` },
        { label: 'EXIF Remover', path: `${basePath}/exif-remover` },
      ],
    },
    {
      title: isEnglish ? 'Convert' : 'Dönüştür',
      links: [
        { label: isEnglish ? 'Format Convert' : 'Format Dönüştür', path: `${basePath}/convert` },
        { label: 'HEIC → JPG', path: `${basePath}/heic-to-jpg` },
        { label: isEnglish ? 'HTML to Image' : 'HTML → Görsel', path: `${basePath}/html-to-image` },
      ],
    },
    {
      title: isEnglish ? 'Advanced' : 'İleri Seviye',
      links: [
        { label: isEnglish ? 'Watermark' : 'Filigran', path: `${basePath}/watermark` },
        { label: 'Meme Generator', path: `${basePath}/meme` },
        { label: isEnglish ? 'Blur Face' : 'Yüz Sansürle', path: `${basePath}/blur-face` },
        { label: isEnglish ? 'Color Palette' : 'Renk Paleti', path: `${basePath}/color-palette` },
        { label: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü', path: `${basePath}/photo-editor` },
      ],
    },
  ];

  return (
    <footer className="border-t border-black/5 mt-auto" style={{ background: 'rgba(250,250,250,0.8)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to={basePath || '/'} className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="iLoveNS" className="h-7 w-auto object-contain" />
            </Link>
            <p className="text-xs text-apple-secondary leading-relaxed max-w-[180px]">
              {isEnglish
                ? 'Professional image tools. Free, fast, 100% in your browser.'
                : 'Profesyonel görsel araçları. Ücretsiz, hızlı, %100 tarayıcınızda.'}
            </p>
            <div className="flex items-center gap-1 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-apple-secondary font-medium">
                {isEnglish ? 'No server uploads' : 'Sunucuya gönderilmez'}
              </span>
            </div>
          </div>

          {/* Tool groups */}
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[11px] font-semibold text-apple-tertiary uppercase tracking-widest mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-[13px] text-apple-secondary hover:text-apple-text transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-black/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-apple-tertiary">
            © {new Date().getFullYear()} iLoveNS ·{' '}
            {isEnglish ? 'Made with love in Turkey' : 'Türkiye\'den sevgiyle'}
          </p>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-emerald-500" />
            <span className="text-[12px] text-apple-secondary">
              {isEnglish ? 'Privacy-first · Open source' : 'Gizlilik öncelikli'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
