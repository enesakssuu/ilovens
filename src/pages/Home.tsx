import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Minimize2, Maximize2, Crop, RotateCcw, Code2, ShieldOff,
  RefreshCw, ImageDown, Globe2, Stamp, Laugh, Eye,
  Palette, Wand2, ArrowRight, Lock, Zap, Sparkles,
} from 'lucide-react';

interface ToolCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  extra?: string[];   // extra feature bullets → makes card taller
  iconBg: string;
  badge?: string;
}

const useTools = (isEnglish: boolean): ToolCard[] => [
  {
    id: 'compress',
    icon: <Minimize2 size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır',
    desc: isEnglish
      ? 'Reduce file size up to 90% while preserving visual quality. Perfect for web, email, and social media.'
      : 'Görsel kalitesini koruyarak dosya boyutunu %90\'a kadar küçült. Web, e-posta ve sosyal medya için ideal.',
    extra: isEnglish
      ? ['Supports JPG, PNG, WebP', 'Adjustable quality slider', 'Instant size preview']
      : ['JPG, PNG, WebP destekler', 'Ayarlanabilir kalite kaydırıcı', 'Anlık boyut önizleme'],
    iconBg: 'bg-blue-500',
    badge: undefined,
  },
  {
    id: 'resize',
    icon: <Maximize2 size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Resize Image' : 'Yeniden Boyutlandır',
    desc: isEnglish
      ? 'Set exact pixel dimensions with a smart aspect-ratio lock.'
      : 'Piksel bazında tam boyut kontrolü ve akıllı oran kilitleme.',
    extra: isEnglish
      ? ['Lock aspect ratio', 'Custom width & height', 'High-quality resampling']
      : ['Oran kilitleme', 'Özel genişlik & yükseklik', 'Yüksek kalite örnekleme'],
    iconBg: 'bg-violet-500',
  },
  {
    id: 'color-palette',
    icon: <Palette size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Color Palette' : 'Renk Paleti Çıkarıcı',
    desc: isEnglish
      ? 'Extract the dominant HEX & RGB colors from any image. Click to copy.'
      : 'Görseldeki baskın HEX & RGB renk kodlarını çıkar. Tıkla, kopyala.',
    iconBg: 'bg-pink-500',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'convert',
    icon: <RefreshCw size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Format Convert' : 'Format Dönüştür',
    desc: isEnglish
      ? 'Instantly convert between JPG, PNG, and WebP. Lossless PNG and transparent WebP supported.'
      : 'JPG, PNG ve WebP arasında anında dönüştür. Kayıpsız PNG ve şeffaf WebP destekli.',
    iconBg: 'bg-cyan-500',
  },
  {
    id: 'crop',
    icon: <Crop size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Crop Image' : 'Görsel Kırp',
    desc: isEnglish ? 'Select any crop region with precision sliders.' : 'Hassas kaydırıcılarla istediğin alanı seç ve kırp.',
    iconBg: 'bg-amber-500',
  },
  {
    id: 'rotate',
    icon: <RotateCcw size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Rotate & Flip' : 'Döndür & Çevir',
    desc: isEnglish
      ? 'Rotate 90° clockwise or counter-clockwise. Flip horizontally or vertically.'
      : 'Saat yönünde veya tersine 90° döndür. Yatay veya dikey çevir.',
    iconBg: 'bg-orange-500',
  },
  {
    id: 'photo-editor',
    icon: <Wand2 size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü',
    desc: isEnglish
      ? 'Adjust brightness, contrast, saturation, blur, grayscale and sepia with a live preview panel.'
      : 'Parlaklık, kontrast, doygunluk, bulanıklık, gri ton ve sepya — canlı önizleme ile.',
    extra: isEnglish
      ? ['6 adjustment sliders', 'Live before/after preview', 'Canvas-quality output']
      : ['6 ayar kaydırıcısı', 'Canlı önizleme paneli', 'Canvas kalitesinde çıktı'],
    iconBg: 'bg-fuchsia-600',
  },
  {
    id: 'watermark',
    icon: <Stamp size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Add Watermark' : 'Filigran Ekle',
    desc: isEnglish
      ? 'Brand your images with custom text. Choose from 5 placement positions.'
      : 'Görsellerinize özel metin filigranı ekle. 5 konum seçeneği.',
    iconBg: 'bg-indigo-500',
  },
  {
    id: 'exif-remover',
    icon: <ShieldOff size={20} strokeWidth={1.5} />,
    title: 'EXIF Remover',
    desc: isEnglish
      ? 'Strip hidden metadata — GPS location, camera model, author, timestamps — for complete privacy.'
      : 'GPS konumu, kamera modeli, yazar ve zaman damgaları dahil tüm gizli meta verileri sil.',
    extra: isEnglish
      ? ['Removes GPS & location data', 'Strips device fingerprinting', '100% privacy guaranteed']
      : ['GPS ve konum verisi silinir', 'Cihaz parmak izi temizlenir', '%100 gizlilik'],
    iconBg: 'bg-emerald-600',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'meme',
    icon: <Laugh size={20} strokeWidth={1.5} />,
    title: 'Meme Generator',
    desc: isEnglish
      ? 'Add Impact-style top and bottom captions to any image.'
      : 'Herhangi bir görsele Impact stili üst ve alt başlık ekle.',
    iconBg: 'bg-yellow-500',
  },
  {
    id: 'blur-face',
    icon: <Eye size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'Blur / Censor' : 'Yüz Sansürle',
    desc: isEnglish
      ? 'Pixelate faces, license plates, or any sensitive region. Add multiple blur zones.'
      : 'Yüz, plaka veya hassas bölgeleri pikselleştir. Çoklu bulanık alan desteği.',
    iconBg: 'bg-red-500',
  },
  {
    id: 'svg-optimize',
    icon: <Code2 size={20} strokeWidth={1.5} />,
    title: 'SVG Optimizer',
    desc: isEnglish
      ? 'Remove unnecessary metadata, editor comments, and Inkscape/Illustrator artifacts to shrink file size.'
      : 'Gereksiz metadata, editör yorumları ve Inkscape kalıntılarını temizleyerek dosya boyutunu küçült.',
    iconBg: 'bg-lime-600',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'heic-to-jpg',
    icon: <ImageDown size={20} strokeWidth={1.5} />,
    title: 'HEIC → JPG',
    desc: isEnglish
      ? 'Guide for converting Apple iPhone HEIC photos to universal JPG format.'
      : 'Apple iPhone HEIC fotoğraflarını evrensel JPG formatına dönüştürme rehberi.',
    iconBg: 'bg-slate-600',
    badge: isEnglish ? 'New' : 'Yeni',
  },
  {
    id: 'html-to-image',
    icon: <Globe2 size={20} strokeWidth={1.5} />,
    title: isEnglish ? 'HTML to Image' : 'HTML → Görsel',
    desc: isEnglish
      ? 'Capture a screenshot of any webpage by entering its URL.'
      : 'Herhangi bir web sayfasının URL\'sini girerek ekran görüntüsü al.',
    iconBg: 'bg-teal-500',
  },
];

// Per-card stagger animation with whileInView
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: (i % 4) * 0.07, // column-based stagger
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function Home() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';
  const tools = useTools(isEnglish);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">

      {/* ── HERO ────────────────────────────────────────────── */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-[12px] font-semibold text-[#6E6E73]"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.07)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <Sparkles size={11} className="text-brand-purple" strokeWidth={2} />
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
              <span
                className="inline-block bg-gradient-to-r from-[#5087F8] via-[#F45187] to-[#A05CE5] bg-clip-text text-transparent pb-1"
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Free, fast, private.
              </span>
            </>
          ) : (
            <>
              Profesyonel görsel araçları.<br />
              <span
                className="inline-block bg-gradient-to-r from-[#5087F8] via-[#F45187] to-[#A05CE5] bg-clip-text text-transparent pb-1"
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
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
            ? 'Compress, resize, convert, watermark and more — everything runs in your browser.'
            : 'Sıkıştır, boyutlandır, dönüştür, filigran ekle — her şey tarayıcınızda çalışır.'}
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

      {/* ── MASONRY GRID ────────────────────────────────────── */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="break-inside-avoid mb-3"
          >
            <Link to={`${basePath}/${tool.id}`} className="block group">
              <div
                className="glass-card p-5 relative overflow-hidden"
                style={{ borderRadius: '1.25rem' }}
              >
                {/* Badge */}
                {tool.badge && (
                  <span className="absolute top-4 right-4 text-[9px] font-bold text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-blue via-brand-pink to-brand-purple shadow-sm">
                    {tool.badge}
                  </span>
                )}

                {/* Header row */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-white ${tool.iconBg}`}
                    style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }}
                  >
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-[13.5px] font-semibold tracking-tight text-brand-text leading-snug flex items-center gap-1">
                      {tool.title}
                      <ArrowRight
                        size={11}
                        strokeWidth={2.5}
                        className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 text-brand-purple flex-shrink-0"
                      />
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[12.5px] text-[#6E6E73] leading-relaxed mb-0">
                  {tool.desc}
                </p>

                {/* Feature bullets (makes card taller = masonry variation) */}
                {tool.extra && (
                  <ul className="mt-3 space-y-1.5 border-t border-black/[0.05] pt-3">
                    {tool.extra.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[11.5px] text-[#6E6E73]">
                        <div className="w-1 h-1 rounded-full bg-brand-purple flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Hover glow */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 20% 20%, rgba(184,150,223,0.08) 0%, transparent 70%)',
                    borderRadius: '1.25rem',
                  }}
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
