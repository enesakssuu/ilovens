import { useState } from 'react';
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
  extra?: string[];
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
    extra: isEnglish
      ? ['JPG, PNG, WebP supported', 'Adjustable quality slider', 'Instant size preview']
      : ['JPG, PNG, WebP destekler', 'Ayarlanabilir kalite kaydırıcı', 'Anlık boyut önizleme'],
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
    extra: isEnglish
      ? ['Aspect ratio lock', 'Custom width & height', 'High quality sampling']
      : ['Oran kilitleme', 'Özel genişlik & yükseklik', 'Yüksek kalite örnekleme'],
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
    extra: isEnglish
      ? ['Strips GPS & location data', 'Cleans device fingerprint', '100% private & client-side']
      : ['GPS ve konum verisi silinir', 'Cihaz parmak izi temizlenir', '%100 gizlilik'],
  },
  {
    id: 'heic-to-jpg',
    icon: <ImageDown size={20} strokeWidth={1.5} />,
    title: 'HEIC → JPG',
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
    title: isEnglish ? 'HTML to Image' : 'HTML → Görsel',
    desc: isEnglish
      ? 'Render custom HTML/CSS code or template cards into crisp PNG images.'
      : 'Özel HTML/CSS kodlarını veya şablon kartlarını yüksek kaliteli PNG görsele dönüştür.',
    iconBg: 'bg-teal-600',
  },
];

// Organic non-uniform shapes & playful initial tilt rotations
const organicCardStyles = [
  { borderRadius: '2.2rem 1.3rem 2rem 1.4rem', baseRotate: -1.8 },
  { borderRadius: '1.4rem 2.2rem 1.3rem 2rem', baseRotate: 1.6 },
  { borderRadius: '2rem 1.5rem 2.3rem 1.3rem', baseRotate: -1.2 },
  { borderRadius: '1.3rem 2rem 1.4rem 2.2rem', baseRotate: 2.1 },
  { borderRadius: '2rem 1.4rem 2.2rem 1.25rem', baseRotate: -1.5 },
  { borderRadius: '1.25rem 2.2rem 1.5rem 2.1rem', baseRotate: 1.8 },
  { borderRadius: '2.1rem 1.3rem 2rem 1.5rem', baseRotate: -2.0 },
  { borderRadius: '1.5rem 2.1rem 1.25rem 2.2rem', baseRotate: 1.4 },
  { borderRadius: '2.2rem 1.4rem 2.1rem 1.3rem', baseRotate: -1.6 },
  { borderRadius: '1.3rem 2rem 1.5rem 2.1rem', baseRotate: 1.7 },
  { borderRadius: '2.1rem 1.5rem 2.2rem 1.25rem', baseRotate: -1.3 },
  { borderRadius: '1.25rem 2.1rem 1.3rem 2rem', baseRotate: 2.2 },
  { borderRadius: '2rem 1.3rem 2.1rem 1.4rem', baseRotate: -1.1 },
  { borderRadius: '1.4rem 2.2rem 1.25rem 2.1rem', baseRotate: 1.9 },
];

export default function Home() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';
  const tools = useTools(isEnglish);

  // Track hovered card for proximity repulsion physics
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">

      {/* ── HERO ────────────────────────────────────────────── */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-[#6E6E73]"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.07)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <Sparkles size={12} className="text-brand-purple" strokeWidth={2} />
          {isEnglish ? '14 tools · 100% free · No server uploads' : '14 araç · %100 ücretsiz · Sunucuya gönderilmez'}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="text-[42px] sm:text-[60px] font-black tracking-[-0.04em] leading-[1.1] text-brand-text mb-4"
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
          className="text-[16px] text-[#6E6E73] leading-relaxed max-w-md mx-auto"
        >
          {isEnglish
            ? 'Compress, resize, convert, watermark and more. Everything runs in your browser.'
            : 'Sıkıştır, boyutlandır, dönüştür, filigran ekle. Tüm işlemler tarayıcınızda gerçekleşir.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="flex items-center justify-center gap-5 mt-5"
        >
          {[
            { icon: <Lock size={11} strokeWidth={2} />, label: isEnglish ? 'No server uploads' : 'Sunucu yok' },
            { icon: <Zap size={11} strokeWidth={2} />, label: isEnglish ? 'Instant results' : 'Anında sonuç' },
            { icon: <Sparkles size={11} strokeWidth={2} />, label: isEnglish ? 'Free forever' : 'Daima ücretsiz' },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-1.5 text-[12px] font-medium text-[#6E6E73]">
              <span className="text-brand-text">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── ORGANIC SCATTER GRID WITH PROXIMITY REPULSION HOVER ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {tools.map((tool, i) => {
          const orgStyle = organicCardStyles[i % organicCardStyles.length];

          // Determine card animation parameters based on proximity to hovered card
          let scale = 1;
          let rotate = orgStyle.baseRotate;
          let x = 0;
          let y = 0;
          let zIndex = 1;
          let opacity = 1;
          let shadow = '0 4px 20px rgba(0, 0, 0, 0.04)';

          if (hoveredIdx === i) {
            // Hovered Card Expands & Rotates straight
            scale = 1.1;
            rotate = 0;
            zIndex = 40;
            shadow = '0 25px 60px -10px rgba(50, 54, 66, 0.22), 0 15px 30px -8px rgba(184, 150, 223, 0.35)';
          } else if (hoveredIdx !== null) {
            // Calculate relative grid position to push surrounding cards away!
            const cols = 4; // grid columns
            const hCol = hoveredIdx % cols;
            const hRow = Math.floor(hoveredIdx / cols);
            const iCol = i % cols;
            const iRow = Math.floor(i / cols);

            const dx = iCol - hCol;
            const dy = iRow - hRow;
            const dist = Math.hypot(dx, dy);

            if (dist <= 2.2) {
              // Nearby surrounding cards part away dynamically
              const pushMag = 24 / Math.max(1, dist);
              x = dx !== 0 ? Math.sign(dx) * pushMag : (i % 2 === 0 ? -12 : 12);
              y = dy !== 0 ? Math.sign(dy) * pushMag : (i % 3 === 0 ? -10 : 10);
              scale = 0.95;
              opacity = 0.8;
            } else {
              scale = 0.98;
              opacity = 0.9;
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
                stiffness: 260,
                damping: 24,
                mass: 0.8,
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative"
            >
              <Link to={`${basePath}/${tool.id}`} className="block group">
                <div
                  className="glass-card p-5.5 relative transition-all duration-300"
                  style={{
                    borderRadius: orgStyle.borderRadius,
                    boxShadow: shadow,
                    borderColor: hoveredIdx === i ? 'rgba(184, 150, 223, 0.45)' : 'rgba(0, 0, 0, 0.07)',
                    backgroundColor: hoveredIdx === i ? '#ffffff' : undefined,
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
                      className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 text-white ${tool.iconBg} transition-transform duration-300 ${
                        hoveredIdx === i ? 'scale-110 rotate-[-4deg]' : ''
                      }`}
                      style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-[14px] font-bold tracking-tight text-brand-text leading-snug flex items-center gap-1">
                        {tool.title}
                        <ArrowRight
                          size={12}
                          strokeWidth={2.5}
                          className={`transition-all duration-200 text-brand-purple flex-shrink-0 ${
                            hoveredIdx === i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1.5'
                          }`}
                        />
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[12.5px] text-[#6E6E73] leading-relaxed mb-0 relative z-10">
                    {tool.desc}
                  </p>

                  {/* Feature bullets */}
                  {tool.extra && (
                    <ul className="mt-3.5 space-y-1.5 border-t border-black/[0.06] pt-3 relative z-10">
                      {tool.extra.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[11.5px] text-[#6E6E73]">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-purple flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
