import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Home as HomeIcon,
  ArrowLeft,
  Minimize2,
  RefreshCw,
  Maximize2,
  Code2,
  Wand2,
  Crop,
  Sparkles,
  Compass
} from 'lucide-react';

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const quickTools = [
    {
      icon: <Minimize2 size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır',
      desc: isEnglish ? 'Reduce file size up to 90%' : '%90\'a varan dosya sıkıştırma',
      path: `${basePath}/compress`,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white',
    },
    {
      icon: <RefreshCw size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Format Convert' : 'Format Dönüştür',
      desc: isEnglish ? 'JPG, PNG, WebP & HEIC' : 'JPG, PNG, WebP ve HEIC',
      path: `${basePath}/convert`,
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white',
    },
    {
      icon: <Maximize2 size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Resize Image' : 'Yeniden Boyutlandır',
      desc: isEnglish ? 'Exact dimensions & aspect ratio' : 'Tam piksel boyutu & oran kilidi',
      path: `${basePath}/resize`,
      color: 'bg-violet-500/10 text-violet-600 border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white',
    },
    {
      icon: <Code2 size={20} strokeWidth={1.8} />,
      title: 'SVG Optimizer',
      desc: isEnglish ? 'Clean metadata & decrease size' : 'SVG kodlarını temizle ve küçült',
      path: `${basePath}/svg-optimize`,
      color: 'bg-lime-500/10 text-lime-600 border-lime-500/20 group-hover:bg-lime-500 group-hover:text-white',
    },
    {
      icon: <Wand2 size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü',
      desc: isEnglish ? 'Filters, brightness & effects' : 'Filtreler, parlaklık ve efektler',
      path: `${basePath}/photo-editor`,
      color: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20 group-hover:bg-fuchsia-500 group-hover:text-white',
    },
    {
      icon: <Crop size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Crop Image' : 'Görsel Kırp',
      desc: isEnglish ? 'Easy custom cropping' : 'Kolay ve hassas görsel kırpma',
      path: `${basePath}/crop`,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white',
    },
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28">
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto text-center">
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-[12.5px] font-semibold text-[#6E6E73] bg-white/90 border border-gray-200/80 shadow-sm backdrop-blur-md"
        >
          <Compass size={14} className="text-brand-purple animate-spin-slow" strokeWidth={2.2} />
          <span>{isEnglish ? '404 · Page Not Found' : '404 · Sayfa Bulunamadı'}</span>
        </motion.div>

        {/* Big Stylized 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative select-none my-2"
        >
          <div className="text-[100px] sm:text-[140px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] drop-shadow-sm">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-2xl -z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
        </motion.div>

        {/* Title & Description */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-2xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight mb-3"
        >
          {isEnglish ? 'Looks like you got lost in space' : 'Aradığınız sayfa kaybolmuş gibi görünüyor'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="text-[15px] sm:text-[16.5px] text-[#6E6E73] leading-relaxed max-w-lg mx-auto mb-8"
        >
          {isEnglish
            ? 'The page you are looking for might have been moved, deleted, or the URL might be mistyped.'
            : 'Ulaşmaya çalıştığınız sayfa taşınmış, silinmiş veya link yanlış yazılmış olabilir.'}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-16"
        >
          <Link
            to={basePath || '/'}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14.5px] font-semibold text-white bg-[#1D1D1F] hover:bg-black shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <HomeIcon size={16} strokeWidth={2} />
            <span>{isEnglish ? 'Back to Home' : 'Ana Sayfaya Dön'}</span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14.5px] font-semibold text-[#1D1D1F] bg-white hover:bg-gray-50 border border-gray-200/90 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>{isEnglish ? 'Go Back' : 'Geri Dön'}</span>
          </button>
        </motion.div>
      </div>

      {/* ── POPULAR TOOLS QUICK ACCESS ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="max-w-4xl mx-auto pt-6 border-t border-gray-200/60"
      >
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-purple" />
            <h2 className="text-[16px] sm:text-[18px] font-bold text-[#1D1D1F]">
              {isEnglish ? 'Popular Tools You Might Need' : 'Hızlıca Kullanabileceğiniz Popüler Araçlar'}
            </h2>
          </div>
          <Link
            to={basePath || '/'}
            className="text-[13px] font-semibold text-brand-purple hover:underline"
          >
            {isEnglish ? 'View all 14 tools →' : 'Tüm 14 aracı gör →'}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {quickTools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group relative flex items-start gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-gray-100/90 hover:border-gray-200/90 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${tool.color}`}
              >
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-[#1D1D1F] group-hover:text-brand-purple transition-colors truncate">
                  {tool.title}
                </div>
                <div className="text-[12px] text-[#6E6E73] truncate mt-0.5">
                  {tool.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
