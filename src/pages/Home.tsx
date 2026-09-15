import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Sparkles, Lock, Zap, ArrowRight,
  Minimize2, Maximize2, Crop, RotateCcw, RefreshCw, Stamp, Laugh, Eye,
  Palette, Wand2, Code2, ShieldOff, ImageDown, Globe2
} from 'lucide-react';

interface ToolItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  iconBg: string;
  badge?: string;
}

const useTools = (isEnglish: boolean): ToolItem[] => [
  {
    id: 'compress',
    icon: <Minimize2 size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır',
    desc: isEnglish
      ? 'Reduce file size by up to 90% while keeping visual quality sharp. Web & e-mail ready.'
      : 'Görsel kalitesini koruyarak dosya boyutunu %90\'a kadar küçült. Web ve e-posta için ideal.',
    iconBg: 'bg-blue-600',
  },
  {
    id: 'convert',
    icon: <RefreshCw size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Format Convert' : 'Format Dönüştür',
    desc: isEnglish
      ? 'Convert between JPG, PNG and WebP in one click. Lossless PNG and transparent WebP supported.'
      : 'JPG, PNG ve WebP arasında anında dönüştür. Kayıpsız PNG ve şeffaf WebP destekli.',
    iconBg: 'bg-cyan-600',
  },
  {
    id: 'watermark',
    icon: <Stamp size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Add Watermark' : 'Filigran Ekle',
    desc: isEnglish
      ? 'Add custom text watermark to protect your photos. 5 position options.'
      : 'Görsellerinize özel metin filigranı ekle. 5 konum seçeneği.',
    iconBg: 'bg-indigo-600',
  },
  {
    id: 'svg-optimize',
    icon: <Code2 size={20} strokeWidth={1.5} />,
    title: 'SVG Optimizer',
    desc: isEnglish
      ? 'Clean SVG files, remove editor garbage & decrease file sizes up to 70%.'
      : 'Gereksiz metadata, editör yorumları ve Inkscape kalıntılarını temizleyerek dosya boyutunu küçült.',
    iconBg: 'bg-lime-600',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'resize',
    icon: <Maximize2 size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Resize Image' : 'Yeniden Boyutlandır',
    desc: isEnglish
      ? 'Exact pixel-level dimension control with smart aspect ratio lock.'
      : 'Piksel bazında tam boyut kontrolü ve akıllı oran kilitleme.',
    iconBg: 'bg-violet-600',
  },
  {
    id: 'crop',
    icon: <Crop size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Crop Image' : 'Görsel Kırp',
    desc: isEnglish
      ? 'Select any region with precise sliders and crop instantly.'
      : 'Hassas kaydırıcılarla istediğin alanı seç ve kırp.',
    iconBg: 'bg-amber-600',
  },
  {
    id: 'exif-remover',
    icon: <ShieldOff size={20} strokeWidth={1.5} />,
    title: 'EXIF Remover',
    desc: isEnglish
      ? 'Strip hidden privacy metadata including GPS location, camera model, author and timestamps.'
      : 'GPS konumu, kamera modeli, yazar ve zaman damgaları dahil tüm gizli meta verileri sil.',
    iconBg: 'bg-emerald-600',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'heic-to-jpg',
    icon: <ImageDown size={20} strokeWidth={1.5} />,
    title: 'HEIC to JPG',
    desc: isEnglish
      ? 'Convert Apple iPhone HEIC photos to universal JPG format directly in browser.'
      : 'Apple iPhone HEIC fotoğraflarını evrensel JPG formatına dönüştür.',
    iconBg: 'bg-slate-700',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'rotate',
    icon: <RotateCcw size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Rotate & Flip' : 'Döndür & Çevir',
    desc: isEnglish
      ? 'Rotate clockwise or counter-clockwise by 90°. Flip horizontally or vertically.'
      : 'Saat yönünde veya tersine 90° döndür. Yatay veya dikey çevir.',
    iconBg: 'bg-orange-600',
  },
  {
    id: 'meme',
    icon: <Laugh size={20} strokeWidth={1.5} />,
    title: 'Meme Generator',
    desc: isEnglish
      ? 'Add top & bottom text overlay in classic Impact font.'
      : 'Klasik Impact yazı tipiyle üst ve alt metin ekle.',
    iconBg: 'bg-yellow-500',
  },
  {
    id: 'blur-face',
    icon: <Eye size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Blur / Censor' : 'Yüz Sansürle',
    desc: isEnglish
      ? 'Blur or pixelate sensitive regions before sharing.'
      : 'Paylaşmadan önce hassas alanları bulanıklaştır veya pikselle.',
    iconBg: 'bg-red-500',
  },
  {
    id: 'color-palette',
    icon: <Palette size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Color Palette' : 'Renk Paleti',
    desc: isEnglish
      ? 'Extract dominant color palette and HEX/RGB codes from any image.'
      : 'Herhangi bir görselden baskın renk paletini ve HEX/RGB kodlarını çıkar.',
    iconBg: 'bg-pink-600',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'photo-editor',
    icon: <Wand2 size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü',
    desc: isEnglish
      ? 'Adjust brightness, contrast, saturation, grayscale, blur & sepia with live preview.'
      : 'Parlaklık, kontrast, doygunluk ve filtreleri canlı önizlemeyle ayarla.',
    iconBg: 'bg-fuchsia-600',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'html-to-image',
    icon: <Globe2 size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'HTML to Image' : 'HTML to Görsel',
    desc: isEnglish
      ? 'Render custom HTML/CSS code or template cards into crisp PNG images.'
      : 'Özel HTML/CSS kodlarını veya şablon kartlarını yüksek kaliteli PNG görsele dönüştür.',
    iconBg: 'bg-teal-600',
  },
];

// Desktop organic shapes & scatter props (kept strictly inside canvas margins)
const organicScatterProps = [
  { borderRadius: '2.4rem 1.2rem 2.2rem 1.4rem', baseRotate: -4.0, offsetY: 0, offsetX: 0 },
  { borderRadius: '1.4rem 2.8rem 1.5rem 2.4rem', baseRotate: 3.5, offsetY: 16, offsetX: 0 },
  { borderRadius: '2.5rem 1.4rem 2.4rem 1.3rem', baseRotate: -3.0, offsetY: 4, offsetX: 0 },
  { borderRadius: '1.4rem 2.6rem 1.3rem 2.8rem', baseRotate: 4.5, offsetY: 24, offsetX: 0 },
  { borderRadius: '2.8rem 1.3rem 2.4rem 1.5rem', baseRotate: -3.8, offsetY: -4, offsetX: 0 },
  { borderRadius: '1.5rem 2.6rem 1.6rem 2.4rem', baseRotate: 3.0, offsetY: 14, offsetX: 0 },
  { borderRadius: '2.6rem 1.5rem 2.8rem 1.3rem', baseRotate: -4.5, offsetY: 2, offsetX: 0 },
  { borderRadius: '1.5rem 2.6rem 1.3rem 2.8rem', baseRotate: 4.0, offsetY: 20, offsetX: 0 },
  { borderRadius: '2.8rem 1.4rem 2.5rem 1.5rem', baseRotate: -3.5, offsetY: 8, offsetX: 0 },
  { borderRadius: '1.4rem 2.8rem 1.5rem 2.6rem', baseRotate: 4.2, offsetY: 26, offsetX: 0 },
  { borderRadius: '2.5rem 1.5rem 2.6rem 1.3rem', baseRotate: -3.2, offsetY: 4, offsetX: 0 },
  { borderRadius: '1.5rem 2.7rem 1.3rem 2.5rem', baseRotate: 3.0, offsetY: 18, offsetX: 0 },
  { borderRadius: '2.6rem 1.3rem 2.5rem 1.5rem', baseRotate: -3.0, offsetY: 6, offsetX: 0 },
  { borderRadius: '1.4rem 2.8rem 1.6rem 2.5rem', baseRotate: 4.5, offsetY: 22, offsetX: 0 },
];

import { trackEvent } from '../utils/analytics';

export default function Home() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';
  const tools = useTools(isEnglish);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    trackEvent({ type: 'pageview', toolName: 'Ana Sayfa' });

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 pt-10 pb-36">

      {/* ── HERO HEADER ────────────────────────────────────── */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-[12.5px] font-semibold text-[#6E6E73]"
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(0,0,0,0.08)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          <Sparkles size={13} className="text-brand-purple" strokeWidth={2} />
          {isEnglish ? '14 tools · 100% free · No server uploads' : '14 araç · %100 ücretsiz · Sunucuya gönderilmez'}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="text-[42px] sm:text-[64px] font-black tracking-[-0.04em] leading-[1.08] text-brand-text mb-4"
        >
          {isEnglish ? (
            <>
              Professional image tools.<br />
              <span className="animated-gradient-text pb-1">
                Free, fast, private.
              </span>
            </>
          ) : (
            <>
              Profesyonel görsel araçları.<br />
              <span className="animated-gradient-text pb-1">
                Ücretsiz, hızlı, özel.
              </span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.13 }}
          className="text-[17px] text-[#6E6E73] leading-relaxed max-w-lg mx-auto"
        >
          {isEnglish
            ? 'Compress, resize, convert, watermark and more. Everything runs in your browser.'
            : 'Sıkıştır, boyutlandır, dönüştür, filigran ekle. Tüm işlemler tarayıcınızda gerçekleşir.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="flex items-center justify-center gap-6 mt-6"
        >
          {[
            { icon: <Lock size={12} strokeWidth={2} />, label: isEnglish ? 'No server uploads' : 'Sunucu yok' },
            { icon: <Zap size={12} strokeWidth={2} />, label: isEnglish ? 'Instant results' : 'Anında sonuç' },
            { icon: <Sparkles size={12} strokeWidth={2} />, label: isEnglish ? 'Free forever' : 'Daima ücretsiz' },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#6E6E73]">
              <span className="text-brand-text">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── CANVAS GRID (FULL WIDTH, CLEAN MOBILE SINGLE-COLUMN, DESKTOP SURROUNDING REPULSION) ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
        {tools.map((tool, i) => {
          const scatProps = organicScatterProps[i % organicScatterProps.length];

          // MOBILE LAYOUT: Clean, aligned, 0 rotation, 0 displacement!
          // DESKTOP LAYOUT: Organic scatter angles & dynamic repulsion push!
          let scale = 1;
          let rotate = isMobile ? 0 : scatProps.baseRotate;
          let x = 0;
          let y = isMobile ? 0 : scatProps.offsetY;
          let zIndex = 1;
          let opacity = 1;
          const borderRadius = isMobile ? '1.25rem' : scatProps.borderRadius;

          if (!isMobile) {
            if (hoveredIdx === i) {
              scale = 1.18;
              rotate = 0;
              x = 0;
              y = 0;
              zIndex = 100;
              opacity = 1;
            } else if (hoveredIdx !== null) {
              const cols = 4;
              const hCol = hoveredIdx % cols;
              const hRow = Math.floor(hoveredIdx / cols);
              const iCol = i % cols;
              const iRow = Math.floor(i / cols);

              const dx = iCol - hCol;
              const dy = iRow - hRow;
              const dist = Math.hypot(dx, dy);

              // 60px Repulsion Push on desktop
              const pushMag = Math.min(70, 60 / Math.max(1, dist));
              const pushX = dx !== 0 ? Math.sign(dx) * pushMag : (i % 2 === 0 ? -24 : 24);
              const pushY = dy !== 0 ? Math.sign(dy) * pushMag : (i % 3 === 0 ? -20 : 20);

              x = pushX;
              y = scatProps.offsetY + pushY;
              scale = dist <= 2 ? 0.92 : 0.96;
              opacity = dist <= 2 ? 0.75 : 0.88;
            }
          } else {
            // Mobile hover subtle scale
            if (hoveredIdx === i) {
              scale = 1.02;
              zIndex = 10;
            }
          }

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{
                scale,
                rotate,
                x,
                y,
                opacity,
                zIndex,
              }}
              transition={{
                type: 'spring',
                stiffness: 250,
                damping: 22,
                mass: 0.8,
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative"
            >
              <Link to={`${basePath}/${tool.id}`} className="block group">
                <div
                  className="p-6 relative transition-colors duration-200"
                  style={{
                    borderRadius,
                    backgroundColor: '#ffffff',
                    border: hoveredIdx === i ? '1.5px solid rgba(184, 150, 223, 0.65)' : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow:
                      hoveredIdx === i
                        ? '0 30px 80px -15px rgba(50, 54, 66, 0.25), 0 15px 35px -8px rgba(184, 150, 223, 0.35)'
                        : '0 4px 20px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* Badge */}
                  {tool.badge && (
                    <span className="absolute top-4 right-4 text-[9.5px] font-bold text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-blue via-brand-pink to-brand-purple shadow-sm z-10">
                      {tool.badge}
                    </span>
                  )}

                  {/* Header row */}
                  <div className="flex items-start gap-3 mb-3 relative z-10">
                    <div
                      className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 text-white ${tool.iconBg} transition-transform duration-300 ${
                        hoveredIdx === i ? 'scale-110 rotate-[-4deg]' : ''
                      }`}
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.16)' }}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-[15px] font-bold tracking-tight text-brand-text leading-snug flex items-center gap-1">
                        {tool.title}
                        <ArrowRight
                          size={13}
                          strokeWidth={2.5}
                          className={`transition-all duration-200 text-brand-purple flex-shrink-0 ${
                            hoveredIdx === i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1.5'
                          }`}
                        />
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-[#6E6E73] leading-relaxed mb-0 relative z-10">
                    {tool.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
