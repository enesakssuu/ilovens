import logoImg from '../assets/logo.png';
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
        { label: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır', path: `${basePath}/compress` },
        { label: isEnglish ? 'Resize Image' : 'Boyutlandır', path: `${basePath}/resize` },
        { label: isEnglish ? 'Crop Image' : 'Kırp', path: `${basePath}/crop` },
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
        { label: isEnglish ? 'PDF Editor' : 'PDF Düzenleyici', path: `${basePath}/pdf-editor` },
        { label: isEnglish ? 'Watermark' : 'Filigran Ekle', path: `${basePath}/watermark` },
        { label: 'Meme Generator', path: `${basePath}/meme` },
        { label: isEnglish ? 'Blur Face' : 'Yüz Sansürle', path: `${basePath}/blur-face` },
        { label: isEnglish ? 'Color Palette' : 'Renk Paleti', path: `${basePath}/color-palette` },
        { label: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü', path: `${basePath}/photo-editor` },
      ],
    },
    {
      title: isEnglish ? 'Legal & Company' : 'Kurumsal & Yasal',
      links: [
        { label: isEnglish ? 'About Us' : 'Hakkımızda', path: `${basePath}/about` },
        { label: isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası', path: `${basePath}/privacy-policy` },
        { label: isEnglish ? 'Terms of Service' : 'Kullanım Şartları', path: `${basePath}/terms` },
        { label: isEnglish ? 'Cookie Policy' : 'Çerez Politikası', path: `${basePath}/cookies` },
        { label: isEnglish ? 'Contact & Support' : 'İletişim & Destek', path: `${basePath}/contact` },
      ],
    },
  ];

  return (
    <footer className="border-t border-black/5 mt-auto" style={{ background: 'rgba(250,250,250,0.8)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to={basePath || '/'} className="flex items-center gap-2 mb-3">
              <img src={logoImg} alt="iLoveNS" className="h-7 w-auto object-contain" />
            </Link>
            <p className="text-xs text-apple-secondary leading-relaxed max-w-[200px]">
              {isEnglish
                ? 'Professional online PDF and image tools. Free, ultra-fast, 100% in your browser.'
                : 'Profesyonel online PDF ve görsel araçları. Ücretsiz, ultra hızlı, %100 tarayıcınızda.'}
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-emerald-700 font-semibold">
                {isEnglish ? 'Zero server uploads' : 'Sıfır sunucu yükleme'}
              </span>
            </div>
          </div>

          {/* Tool groups */}
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[11px] font-bold text-apple-tertiary uppercase tracking-widest mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-[13px] text-apple-secondary hover:text-apple-text transition-colors duration-150 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-black/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-apple-tertiary">
            © {new Date().getFullYear()} iLoveNS ·{' '}
            {isEnglish ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-apple-secondary">
            <Link to={`${basePath}/privacy-policy`} className="hover:underline">
              {isEnglish ? 'Privacy' : 'Gizlilik'}
            </Link>
            <span>·</span>
            <Link to={`${basePath}/terms`} className="hover:underline">
              {isEnglish ? 'Terms' : 'Şartlar'}
            </Link>
            <span>·</span>
            <Link to={`${basePath}/cookies`} className="hover:underline">
              {isEnglish ? 'Cookies' : 'Çerezler'}
            </Link>
            <span>·</span>
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <Shield size={12} />
              <span>{isEnglish ? 'Client-Side Secure' : 'İstemci Taraflı Güvenli'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
