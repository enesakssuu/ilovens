import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Home as HomeIcon,
  ArrowLeft,
  Sparkles,
  Minimize2,
  RefreshCw,
  Maximize2,
  Wand2,
  Palette,
  Code2,
  Crop,
  Layers,
  Aperture,
  Compass
} from 'lucide-react';

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  // ── 3D Smooth Mouse Parallax Physics ──────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [18, -18]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-22, 22]);
  const lightX = useTransform(smoothMouseX, [-0.5, 0.5], [20, 80]);
  const lightY = useTransform(smoothMouseY, [-0.5, 0.5], [20, 80]);

  // Handle subtle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth) - 0.5);
      mouseY.set((e.clientY / innerHeight) - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // ── Starlight Particles ───────────────────────────────────────────
  const stars = [
    { top: '12%', left: '18%', size: 4, delay: 0, dur: 3 },
    { top: '22%', left: '82%', size: 6, delay: 1, dur: 4 },
    { top: '68%', left: '14%', size: 5, delay: 2, dur: 3.5 },
    { top: '75%', left: '88%', size: 3, delay: 0.5, dur: 2.8 },
    { top: '35%', left: '8%', size: 4, delay: 1.5, dur: 4.2 },
    { top: '80%', left: '42%', size: 5, delay: 2.2, dur: 3.2 },
    { top: '15%', left: '60%', size: 3, delay: 0.8, dur: 3.8 },
  ];

  const popularTools = [
    { label: isEnglish ? 'Compress' : 'Sıkıştır', path: `${basePath}/compress`, icon: <Minimize2 size={13} strokeWidth={2.2} />, color: 'hover:border-blue-300 hover:text-blue-600' },
    { label: isEnglish ? 'Convert' : 'Dönüştür', path: `${basePath}/convert`, icon: <RefreshCw size={13} strokeWidth={2.2} />, color: 'hover:border-cyan-300 hover:text-cyan-600' },
    { label: isEnglish ? 'Resize' : 'Boyutlandır', path: `${basePath}/resize`, icon: <Maximize2 size={13} strokeWidth={2.2} />, color: 'hover:border-violet-300 hover:text-violet-600' },
    { label: isEnglish ? 'Editor' : 'Editör', path: `${basePath}/photo-editor`, icon: <Wand2 size={13} strokeWidth={2.2} />, color: 'hover:border-fuchsia-300 hover:text-fuchsia-600' },
    { label: isEnglish ? 'Palette' : 'Palet', path: `${basePath}/color-palette`, icon: <Palette size={13} strokeWidth={2.2} />, color: 'hover:border-pink-300 hover:text-pink-600' },
    { label: 'SVG', path: `${basePath}/svg-optimize`, icon: <Code2 size={13} strokeWidth={2.2} />, color: 'hover:border-emerald-300 hover:text-emerald-600' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden select-none">

      {/* ── COSMIC AURORA AMBIENT GLOWS ────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-gradient-to-tr from-[#86B3F0]/30 via-[#B896DF]/30 to-[#FA7DA8]/35 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-cyan-400/15 rounded-full blur-[90px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Floating Starlight Particles */}
      {stars.map((s, idx) => (
        <motion.div
          key={idx}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.3, 0.9, 0.3],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: s.dur,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
          }}
          className="absolute rounded-full bg-gradient-to-tr from-white to-purple-200 shadow-[0_0_8px_rgba(184,150,223,0.8)] pointer-events-none"
        />
      ))}

      {/* ── MAIN CONTENT WRAPPER ──────────────────────────────────── */}
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">

        {/* Floating Futuristic Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-[12.5px] font-bold text-zinc-700 bg-white/85 border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl"
        >
          <Compass size={14} className="text-purple-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="tracking-wide uppercase text-[11px] bg-gradient-to-r from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] bg-clip-text text-transparent font-extrabold">
            {isEnglish ? 'Dimension Error · 404' : 'Boyut Sapması · 404'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </motion.div>

        {/* ── 3D HOLOGRAPHIC PARALLAX CENTERPIECE ─────────────────── */}
        <div style={{ perspective: 1100 }} className="relative py-2 sm:py-4">
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative cursor-grab active:cursor-grabbing"
          >
            {/* 1. Orbiting Cosmic Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-10 sm:-inset-14 rounded-full border border-dashed border-purple-300/40 pointer-events-none"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#86B3F0] to-[#B896DF] absolute -top-2 left-1/2 -translate-x-1/2 shadow-lg shadow-purple-500/50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#FA7DA8] to-purple-400 absolute -bottom-1.5 left-1/3 shadow-md shadow-pink-500/50" />
            </motion.div>

            {/* 2. Floating Satellite Polaroid / Layer Card */}
            <motion.div
              animate={{
                y: [0, -16, 0],
                rotate: [-6, 2, -6],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transform: 'translateZ(60px)' }}
              className="absolute -top-7 -left-6 sm:-left-12 z-30 w-24 sm:w-28 p-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] hidden sm:block"
            >
              <div className="w-full h-14 sm:h-16 rounded-xl bg-gradient-to-br from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] flex items-center justify-center relative overflow-hidden">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-2 border-white/60 border-t-white flex items-center justify-center"
                >
                  <Sparkles size={14} className="text-white" />
                </motion.div>
                <div className="absolute bottom-1 right-1.5 px-1 py-0.5 rounded bg-black/40 text-[8px] font-bold text-white tracking-widest">
                  8K RAW
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <span className="text-[9px] font-bold text-zinc-600">Lost.png</span>
                <span className="text-[8px] font-semibold text-purple-500">0 KB</span>
              </div>
            </motion.div>

            {/* 3. Floating 3D Animated Paper Airplane */}
            <motion.div
              animate={{
                x: [-15, 25, -15],
                y: [-12, -30, -12],
                rotate: [15, 28, 15],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transform: 'translateZ(90px)' }}
              className="absolute -top-6 -right-6 sm:-right-12 z-30"
            >
              <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-3xl bg-white/95 backdrop-blur-xl border border-white shadow-[0_16px_36px_rgba(184,150,223,0.35)] flex items-center justify-center p-3">
                <svg viewBox="0 0 24 24" className="w-full h-full transform -rotate-12 filter drop-shadow">
                  <path d="M22 2L11 13" stroke="url(#hero-plane-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="url(#hero-plane-grad)" stroke="url(#hero-plane-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="hero-plane-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#86B3F0"/>
                      <stop offset="0.5" stopColor="#B896DF"/>
                      <stop offset="1" stopColor="#FA7DA8"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>

            {/* 4. Centerpiece Glass Portal Card */}
            <motion.div
              style={{
                transform: 'translateZ(30px)',
              }}
              className="relative w-[300px] sm:w-[440px] h-[190px] sm:h-[240px] rounded-[38px] bg-white/80 backdrop-blur-2xl border-2 border-white/95 shadow-[0_24px_64px_rgba(134,179,240,0.22),0_12px_24px_rgba(250,125,168,0.15)] flex items-center justify-center overflow-hidden p-6"
            >
              {/* Dynamic Specular Sheen reacting to Mouse */}
              <motion.div
                style={{
                  left: lightX,
                  top: lightY,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-white/70 via-purple-300/20 to-transparent blur-2xl pointer-events-none"
              />

              {/* Viewfinder Animated Crop Frame / Marquee Lines */}
              <div className="absolute inset-4 sm:inset-5 rounded-2xl border border-dashed border-purple-300/50 pointer-events-none">
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-purple-500 rounded-sm shadow-sm" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-purple-500 rounded-sm shadow-sm" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-purple-500 rounded-sm shadow-sm" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-purple-500 rounded-sm shadow-sm" />
                <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] font-bold text-purple-400 tracking-wider">
                  <Crop size={10} strokeWidth={2.5} />
                  <span>FRAME 404</span>
                </div>
              </div>

              {/* 404 Hologram Numbers */}
              <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 select-none">
                
                {/* First '4' */}
                <span className="text-[88px] sm:text-[130px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#7B8BFF] via-[#B896DF] to-[#FA7DA8] filter drop-shadow-[0_8px_16px_rgba(184,150,223,0.3)]">
                  4
                </span>

                {/* Center Animated Aperture Hologram as '0' */}
                <div className="relative w-20 sm:w-30 h-20 sm:h-30 flex items-center justify-center">
                  {/* Outer Glowing Pulsing Disk */}
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] opacity-80 blur-[2px] p-1"
                  >
                    <div className="w-full h-full rounded-full bg-white/80 backdrop-blur-md" />
                  </motion.div>

                  {/* Inner Rotating Aperture Blade */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="relative z-10 w-14 sm:w-20 h-14 sm:h-20 rounded-full bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-white shadow-xl flex items-center justify-center"
                  >
                    <Aperture size={32} className="text-[#B896DF] animate-pulse sm:w-10 sm:h-10" strokeWidth={1.8} />
                  </motion.div>

                  {/* Central Cosmic Sparkle */}
                  <div className="absolute z-20 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#fff]" />
                </div>

                {/* Second '4' */}
                <span className="text-[88px] sm:text-[130px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#7B8BFF] via-[#B896DF] to-[#FA7DA8] filter drop-shadow-[0_8px_16px_rgba(184,150,223,0.3)]">
                  4
                </span>
              </div>

              {/* Subtle Bottom Glow Badge */}
              <div className="absolute bottom-2 inset-x-0 flex justify-center">
                <div className="px-3 py-0.5 rounded-full bg-purple-50/90 border border-purple-100/80 text-[10px] sm:text-[11px] font-bold text-purple-600 flex items-center gap-1.5 shadow-sm">
                  <Layers size={11} />
                  <span>{isEnglish ? 'Pixel Not Found in Buffer' : 'Piksel Havuzunda Bulunamadı'}</span>
                </div>
              </div>
            </motion.div>

            {/* 5. Floating Color Swatches Satellite */}
            <motion.div
              animate={{
                y: [0, 14, 0],
                rotate: [4, -4, 4],
              }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transform: 'translateZ(70px)' }}
              className="absolute -bottom-4 -left-4 sm:-left-8 z-30 hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-xl"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#86B3F0] shadow-sm" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#B896DF] shadow-sm" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#FA7DA8] shadow-sm" />
              <span className="text-[10px] font-bold text-zinc-600 ml-1">#404040</span>
            </motion.div>

          </motion.div>
        </div>

        {/* ── PUNCHY TYPOGRAPHY ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 max-w-lg"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-[#1D1D1F] tracking-tight mb-3">
            {isEnglish ? 'Lost in the Creative Cosmos?' : 'Evrende Kaybolan Pikseller...'}
          </h1>
          <p className="text-[15px] sm:text-[16.5px] text-[#6E6E73] font-medium leading-relaxed">
            {isEnglish
              ? 'This page got erased from the canvas. But the universe is full of tools ready to transform your images.'
              : 'Aradığınız sayfa kanvastan silinmiş veya yanlış boyuta ışınlanmış. Ama yaratıcı araçlarınız parmaklarınızın ucunda!'}
          </p>
        </motion.div>

        {/* ── BOMBATIC GLOWING ACTION BUTTONS ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-3.5 mt-8 mb-10"
        >
          <Link
            to={basePath || '/'}
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[14.5px] font-bold text-white bg-gradient-to-r from-[#1D1D1F] via-[#2A2B32] to-[#1D1D1F] hover:from-black hover:to-black shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:shadow-[0_16px_40px_rgba(184,150,223,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          >
            <HomeIcon size={16} strokeWidth={2.2} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>{isEnglish ? 'Return to Home Universe' : 'Ana Sayfaya Dön'}</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#86B3F0]/20 via-[#B896DF]/20 to-[#FA7DA8]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[14.5px] font-bold text-zinc-700 bg-white/90 hover:bg-white border border-gray-200/90 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 backdrop-blur-md"
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            <span>{isEnglish ? 'Go Back' : 'Geri Dön'}</span>
          </button>
        </motion.div>

        {/* ── QUICK TELEPORT TOOL PILLS ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="w-full max-w-xl pt-4 border-t border-gray-200/60"
        >
          <div className="flex items-center justify-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3.5">
            <Sparkles size={13} className="text-[#B896DF]" />
            <span>{isEnglish ? 'Quick Portals' : 'Hızlı Geçitler'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {popularTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-zinc-700 bg-white/80 hover:bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${tool.color}`}
              >
                <span>{tool.icon}</span>
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
