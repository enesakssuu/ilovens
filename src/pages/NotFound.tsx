import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Home as HomeIcon,
  ArrowLeft,
  Sparkles,
  Minimize2,
  RefreshCw,
  Maximize2,
  Wand2,
  Palette,
  Code2
} from 'lucide-react';

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const popularTools = [
    { label: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır', path: `${basePath}/compress`, icon: <Minimize2 size={14} /> },
    { label: isEnglish ? 'Format Convert' : 'Format Dönüştür', path: `${basePath}/convert`, icon: <RefreshCw size={14} /> },
    { label: isEnglish ? 'Resize Image' : 'Yeniden Boyutlandır', path: `${basePath}/resize`, icon: <Maximize2 size={14} /> },
    { label: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü', path: `${basePath}/photo-editor`, icon: <Wand2 size={14} /> },
    { label: isEnglish ? 'Color Palette' : 'Renk Paleti', path: `${basePath}/color-palette`, icon: <Palette size={14} /> },
    { label: 'SVG Optimizer', path: `${basePath}/svg-optimize`, icon: <Code2 size={14} /> },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative overflow-hidden select-none">

      {/* ── AMBIENT GLOW BACKDROPS ─────────────────────────────────── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] bg-gradient-to-tr from-[#86B3F0]/25 via-[#B896DF]/20 to-[#FA7DA8]/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── MAIN HERO CONTAINER ────────────────────────────────────── */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center my-auto">

        {/* ── HIGH-END ANIMATED 404 ILLUSTRATION ─────────────────── */}
        <div className="relative w-72 sm:w-88 h-64 sm:h-72 flex items-center justify-center my-2">
          
          {/* Layer 1: Floating Clouds / Soft Orbs in background */}
          <motion.div
            animate={{
              x: [-12, 12, -12],
              y: [0, -8, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-2 -left-6 w-24 h-14 bg-white/70 backdrop-blur-md rounded-full shadow-lg border border-white/80 -z-10 flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-white/90 absolute -top-3 left-4" />
            <div className="w-10 h-10 rounded-full bg-white/90 absolute -top-5 left-8" />
          </motion.div>

          <motion.div
            animate={{
              x: [10, -10, 10],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute top-6 -right-8 w-28 h-16 bg-white/70 backdrop-blur-md rounded-full shadow-lg border border-white/80 -z-10 flex items-center justify-center"
          >
            <div className="w-9 h-9 rounded-full bg-white/90 absolute -top-3 left-5" />
            <div className="w-11 h-11 rounded-full bg-white/90 absolute -top-5 left-10" />
          </motion.div>

          {/* Layer 2: Floating Paper Plane / Cursor Navigator */}
          <motion.div
            animate={{
              x: [-15, 20, -15],
              y: [-10, -25, -10],
              rotate: [12, 22, 12],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-2 right-4 z-20"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-xl flex items-center justify-center transform -rotate-12">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand-purple">
                <path d="M22 2L11 13" stroke="url(#plane-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="url(#plane-grad)" fillOpacity="0.85" stroke="url(#plane-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="plane-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#86B3F0"/>
                    <stop offset="0.5" stopColor="#B896DF"/>
                    <stop offset="1" stopColor="#FA7DA8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* Layer 3: Floating Camera / Frame Shutter Elements */}
          <motion.div
            animate={{
              y: [0, -14, 0],
              rotate: [-4, 4, -4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10 flex items-center justify-center"
          >
            {/* Glass Backdrop Card */}
            <div className="w-64 sm:w-76 h-36 sm:h-44 rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-2xl shadow-purple-500/10 flex items-center justify-center relative overflow-hidden">
              
              {/* Internal Grid Lines (Camera Viewfinder effect) */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              {/* Corner Framing Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-brand-purple/40 rounded-tl" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-brand-purple/40 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-brand-purple/40 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-brand-purple/40 rounded-br" />

              {/* Big Vibrant 404 Typography */}
              <div className="flex items-center justify-center gap-1 relative z-10 select-none">
                <span className="text-[72px] sm:text-[92px] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] filter drop-shadow-sm">
                  4
                </span>

                {/* Floating Animated Lens as the '0' */}
                <div className="relative w-16 sm:w-20 h-16 sm:h-20 mx-1 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-[#B896DF]/60"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-12 sm:w-15 h-12 sm:h-15 rounded-full bg-gradient-to-tr from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] p-0.5 shadow-lg flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center">
                      <Sparkles size={18} className="text-brand-purple animate-pulse" />
                    </div>
                  </motion.div>
                </div>

                <span className="text-[72px] sm:text-[92px] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] filter drop-shadow-sm">
                  4
                </span>
              </div>
            </div>
          </motion.div>



          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 8, 0],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute -bottom-2 right-4 z-20 w-8 h-8 rounded-xl bg-gradient-to-br from-[#86B3F0] to-[#B896DF] shadow-md flex items-center justify-center text-white"
          >
            <span className="text-xs font-black">PNG</span>
          </motion.div>
        </div>

        {/* ── HEADING & DESCRIPTION ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 max-w-lg"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-2.5">
            {isEnglish ? 'Ooops! Page not found' : 'Ooops! Sayfa bulunamadı'}
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#6E6E73] leading-relaxed">
            {isEnglish
              ? "Looks like this page got lost in space or doesn't exist anymore. Don't worry, your tools are just a click away."
              : 'Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. Ama merak etmeyin, tüm araçlarınız hemen elinizin altında.'}
          </p>
        </motion.div>

        {/* ── PRIMARY CALL TO ACTIONS ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-3.5 mt-8 mb-10"
        >
          <Link
            to={basePath || '/'}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[14.5px] font-semibold text-white bg-[#1D1D1F] hover:bg-black shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <HomeIcon size={16} strokeWidth={2} />
            <span>{isEnglish ? 'Back to Home' : 'Ana Sayfaya Dön'}</span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14.5px] font-semibold text-[#1D1D1F] bg-white/90 hover:bg-white border border-gray-200/90 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all backdrop-blur-md"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>{isEnglish ? 'Go Back' : 'Geri Dön'}</span>
          </button>
        </motion.div>

        {/* ── MINIMAL QUICK TOOLS PILLS ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-xl"
        >
          <div className="text-[12px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
            {isEnglish ? 'Popular Tools' : 'Popüler Araçlar'}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-zinc-700 bg-white/80 hover:bg-white hover:text-brand-purple border border-gray-200/70 hover:border-purple-200 shadow-sm hover:shadow transition-all"
              >
                <span className="text-zinc-400">{tool.icon}</span>
                <span>{tool.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default NotFound;
