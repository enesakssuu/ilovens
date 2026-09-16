import logoImg from '../assets/logo.png';
import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Menu, X, ChevronDown, ArrowRight,
  Minimize2, Maximize2, Crop, RotateCcw, Code2, ShieldOff,
  RefreshCw, ImageDown, Globe2, Stamp, Laugh, Eye,
  Palette, Wand2, Sparkles
} from 'lucide-react';

interface ToolLink {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
  badge?: string;
}

interface MenuGroup {
  key: string;
  label: string;
  tools: ToolLink[];
  featured: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    iconBg: string;
    path: string;
    cta: string;
  };
}

const useMenuGroups = (isEnglish: boolean, basePath: string): MenuGroup[] => [
  {
    key: 'optimize',
    label: isEnglish ? 'Optimize' : 'Optimizasyon',
    tools: [
      { icon: <Minimize2 size={15} strokeWidth={1.8} />, label: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır', path: `${basePath}/compress`, color: 'text-blue-600' },
      { icon: <Maximize2 size={15} strokeWidth={1.8} />, label: isEnglish ? 'Resize Image' : 'Yeniden Boyutlandır', path: `${basePath}/resize`, color: 'text-violet-600' },
      { icon: <Crop size={15} strokeWidth={1.8} />, label: isEnglish ? 'Crop Image' : 'Görsel Kırp', path: `${basePath}/crop`, color: 'text-amber-600' },
      { icon: <RotateCcw size={15} strokeWidth={1.8} />, label: isEnglish ? 'Rotate & Flip' : 'Döndür & Çevir', path: `${basePath}/rotate`, color: 'text-orange-600' },
      { icon: <Code2 size={15} strokeWidth={1.8} />, label: 'SVG Optimizer', path: `${basePath}/svg-optimize`, color: 'text-lime-600', badge: isEnglish ? 'New' : 'Yeni' },
      { icon: <ShieldOff size={15} strokeWidth={1.8} />, label: 'EXIF Remover', path: `${basePath}/exif-remover`, color: 'text-emerald-600', badge: isEnglish ? 'New' : 'Yeni' },
    ],
    featured: {
      title: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır',
      desc: isEnglish
        ? 'Reduce file size by up to 90% while keeping visual quality sharp. Works with JPG, PNG and WebP.'
        : 'Görsel kalitesini koruyarak dosya boyutunu %90\'a kadar küçült. JPG, PNG ve WebP desteklenir.',
      icon: <Minimize2 size={26} strokeWidth={1.8} />,
      iconBg: 'bg-blue-600',
      path: `${basePath}/compress`,
      cta: isEnglish ? 'Try Compress' : 'Sıkıştırmayı Dene',
    },
  },
  {
    key: 'convert',
    label: isEnglish ? 'Convert' : 'Dönüştür',
    tools: [
      { icon: <RefreshCw size={15} strokeWidth={1.8} />, label: isEnglish ? 'Format Convert' : 'Format Dönüştür', path: `${basePath}/convert`, color: 'text-cyan-600' },
      { icon: <ImageDown size={15} strokeWidth={1.8} />, label: 'HEIC → JPG', path: `${basePath}/heic-to-jpg`, color: 'text-slate-700', badge: isEnglish ? 'New' : 'Yeni' },
      { icon: <Globe2 size={15} strokeWidth={1.8} />, label: isEnglish ? 'HTML to Image' : 'HTML → Görsel', path: `${basePath}/html-to-image`, color: 'text-teal-600' },
    ],
    featured: {
      title: isEnglish ? 'Format Converter' : 'Format Dönüştürücü',
      desc: isEnglish
        ? 'Convert between JPG, PNG, and WebP in one click. Lossless PNG and transparent WebP supported.'
        : 'JPG, PNG ve WebP arasında tek tıkla dönüştür. Kayıpsız PNG ve şeffaf WebP desteklenir.',
      icon: <RefreshCw size={26} strokeWidth={1.8} />,
      iconBg: 'bg-cyan-600',
      path: `${basePath}/convert`,
      cta: isEnglish ? 'Try Convert' : 'Dönüştürmeyi Dene',
    },
  },
  {
    key: 'advanced',
    label: isEnglish ? 'Advanced' : 'İleri Seviye',
    tools: [
      { icon: <Stamp size={15} strokeWidth={1.8} />, label: isEnglish ? 'Add Watermark' : 'Filigran Ekle', path: `${basePath}/watermark`, color: 'text-indigo-600' },
      { icon: <Laugh size={15} strokeWidth={1.8} />, label: 'Meme Generator', path: `${basePath}/meme`, color: 'text-yellow-600' },
      { icon: <Eye size={15} strokeWidth={1.8} />, label: isEnglish ? 'Blur / Censor' : 'Yüz Sansürle', path: `${basePath}/blur-face`, color: 'text-red-500' },
      { icon: <Palette size={15} strokeWidth={1.8} />, label: isEnglish ? 'Color Palette' : 'Renk Paleti', path: `${basePath}/color-palette`, color: 'text-pink-600', badge: isEnglish ? 'New' : 'Yeni' },
      { icon: <Wand2 size={15} strokeWidth={1.8} />, label: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü', path: `${basePath}/photo-editor`, color: 'text-fuchsia-600' },
    ],
    featured: {
      title: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü',
      desc: isEnglish
        ? 'Adjust brightness, contrast, saturation and apply filters in real-time with a live preview.'
        : 'Parlaklık, kontrast, doygunluk ve filtreleri canlı önizleme ile gerçek zamanlı ayarla.',
      icon: <Wand2 size={26} strokeWidth={1.8} />,
      iconBg: 'bg-fuchsia-600',
      path: `${basePath}/photo-editor`,
      cta: isEnglish ? 'Open Editor' : 'Editörü Aç',
    },
  },
];

const megaVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } },
};

export default function Navbar() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';
  const menuGroups = useMenuGroups(isEnglish, basePath);

  const toggleLanguage = () => {
    if (isEnglish) navigate(location.pathname.replace(/^\/en/, '') || '/');
    else navigate('/en' + (location.pathname === '/' ? '' : location.pathname));
  };

  const openMenu = (key: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveMenu(key);
  };

  const scheduleClose = () => {
    leaveTimer.current = setTimeout(() => setActiveMenu(null), 140);
  };

  const activeGroup = menuGroups.find((g) => g.key === activeMenu);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6">
      {/* ── FLOATING PILL CONTAINER ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto relative">
        <div className="bg-white rounded-full px-5 sm:px-7 py-2.5 border border-gray-100 shadow-md flex items-center justify-between transition-all">
          
          {/* Logo & Brand */}
          <Link to={basePath || '/'} className="flex items-center flex-shrink-0 group py-0.5">
            <img src={logoImg} alt="iLoveNS" className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5" onMouseLeave={scheduleClose}>
            {menuGroups.map((group) => (
              <button
                key={group.key}
                onMouseEnter={() => openMenu(group.key)}
                onClick={() => setActiveMenu(activeMenu === group.key ? null : group.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] font-medium transition-all duration-150 whitespace-nowrap ${
                  activeMenu === group.key
                    ? 'bg-zinc-100 text-brand-text font-semibold'
                    : 'text-zinc-600 hover:text-brand-text hover:bg-zinc-50'
                }`}
              >
                {group.label}
                <ChevronDown
                  size={12}
                  strokeWidth={2.5}
                  className={`transition-transform duration-200 ${
                    activeMenu === group.key ? 'rotate-180 text-brand-purple' : 'text-zinc-400'
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-600 hover:text-brand-text px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-all flex-shrink-0"
            >
              <Globe size={13} strokeWidth={2} />
              {isEnglish ? 'TR' : 'EN'}
            </button>

            {/* Dark Anthracite bg-[#323642] Rounded Action Button */}
            <button
              onClick={() => openMenu(activeMenu === 'optimize' ? '' : 'optimize')}
              className="hidden sm:flex items-center gap-2 text-[13px] font-semibold text-white bg-[#323642] hover:bg-[#232630] px-5 py-2 rounded-full shadow-sm transition-all flex-shrink-0 whitespace-nowrap"
            >
              <Sparkles size={13} strokeWidth={2} className="text-brand-pink flex-shrink-0" />
              <span>{isEnglish ? 'Tools' : 'Hızlı Araçlar'}</span>
            </button>

            <button
              className="md:hidden p-2 rounded-full text-zinc-600 hover:bg-zinc-100 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* ── TAM OPAK MEGA MENU PANEL (NO TRANSPARENCY) ─────────────────── */}
        <AnimatePresence>
          {activeMenu && activeGroup && (
            <motion.div
              key={activeMenu}
              variants={megaVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 right-0 top-full pt-3 z-50"
              onMouseEnter={() => openMenu(activeMenu)}
              onMouseLeave={scheduleClose}
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-zinc-900/10 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  
                  {/* LEFT: Tool Links (60%) — 100% Solid White */}
                  <div className="flex-[3] p-6 bg-white">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4 px-1">
                      {activeGroup.label}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {activeGroup.tools.map((tool) => (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          onClick={() => setActiveMenu(null)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-zinc-50 transition-all group/tool border border-transparent hover:border-zinc-100"
                        >
                          <span className={`${tool.color} flex-shrink-0 p-1.5 rounded-xl bg-zinc-50 group-hover/tool:bg-white transition-colors`}>
                            {tool.icon}
                          </span>
                          <span className="text-[13.5px] font-medium text-brand-text group-hover/tool:text-brand-purple transition-colors flex-1 leading-none">
                            {tool.label}
                          </span>
                          {tool.badge && (
                            <span className="text-[9px] font-bold text-white bg-gradient-to-r from-brand-blue via-brand-pink to-brand-purple px-2 py-0.5 rounded-full shadow-sm">
                              {tool.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: Featured Tool Panel (40%) — 100% Solid Light Card */}
                  <div className="flex-[2] p-6 bg-zinc-50 border-t md:border-t-0 md:border-l border-zinc-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold text-brand-text bg-gradient-to-r from-brand-blue/15 to-brand-pink/15 px-2.5 py-1 rounded-full border border-brand-purple/20">
                          {isEnglish ? 'FEATURED TOOL' : 'ÖNE ÇIKAN ARAÇ'}
                        </span>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl ${activeGroup.featured.iconBg} flex items-center justify-center text-white mb-3 shadow-md`}>
                        {activeGroup.featured.icon}
                      </div>
                      <h4 className="text-[15px] font-bold text-brand-text tracking-tight mb-2">
                        {activeGroup.featured.title}
                      </h4>
                      <p className="text-[12.5px] text-zinc-500 leading-relaxed">
                        {activeGroup.featured.desc}
                      </p>
                    </div>

                    <Link
                      to={activeGroup.featured.path}
                      onClick={() => setActiveMenu(null)}
                      className="mt-5 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-[13px] font-semibold text-brand-text hover:border-brand-purple hover:text-brand-purple transition-all shadow-sm group/cta"
                    >
                      <span>{activeGroup.featured.cta}</span>
                      <ArrowRight size={14} strokeWidth={2.2} className="group-hover/cta:translate-x-1 transition-transform text-brand-purple" />
                    </Link>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MOBILE MENU ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute left-4 right-4 top-full pt-3 z-40"
          >
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xl space-y-4">
              {menuGroups.map((group) => (
                <div key={group.key}>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {group.tools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-zinc-800 hover:bg-zinc-50 transition-all"
                      >
                        <span className={tool.color}>{tool.icon}</span>
                        <span>{tool.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
