import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Home as HomeIcon,
  ArrowLeft,
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

  const leftEyeRef = useRef<HTMLDivElement | null>(null);
  const rightEyeRef = useRef<HTMLDivElement | null>(null);

  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });
  const [eyebrowOffset, setEyebrowOffset] = useState({ y: 0, rotate: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Trigger brief blink
  const triggerBlink = useCallback(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 140);
  }, []);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      triggerBlink();
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, [triggerBlink]);

  // Track mouse coordinates and calculate pupil offset for each eye
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Max distance pupil can move inside eye socket (in pixels)
      const maxDistance = window.innerWidth < 640 ? 22 : 32;

      // ── Left Eye Pupil Tracking ──
      if (leftEyeRef.current) {
        const rect = leftEyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const angle = Math.atan2(dy, dx);
        const dist = Math.hypot(dx, dy);

        const clampedDist = Math.min(dist * 0.08, maxDistance);
        setLeftPupil({
          x: Math.cos(angle) * clampedDist,
          y: Math.sin(angle) * clampedDist,
        });
      }

      // ── Right Eye Pupil Tracking ──
      if (rightEyeRef.current) {
        const rect = rightEyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const angle = Math.atan2(dy, dx);
        const dist = Math.hypot(dx, dy);

        const clampedDist = Math.min(dist * 0.08, maxDistance);
        setRightPupil({
          x: Math.cos(angle) * clampedDist,
          y: Math.sin(angle) * clampedDist,
        });
      }

      // ── Eyebrow subtle response ──
      const screenYRatio = mouseY / window.innerHeight;
      const screenXRatio = (mouseX / window.innerWidth) - 0.5;
      setEyebrowOffset({
        y: (screenYRatio - 0.5) * 8,
        rotate: screenXRatio * 6,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const popularTools = [
    { label: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır', path: `${basePath}/compress`, icon: <Minimize2 size={13} strokeWidth={2.2} /> },
    { label: isEnglish ? 'Format Convert' : 'Format Dönüştür', path: `${basePath}/convert`, icon: <RefreshCw size={13} strokeWidth={2.2} /> },
    { label: isEnglish ? 'Resize Image' : 'Boyutlandır', path: `${basePath}/resize`, icon: <Maximize2 size={13} strokeWidth={2.2} /> },
    { label: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü', path: `${basePath}/photo-editor`, icon: <Wand2 size={13} strokeWidth={2.2} /> },
    { label: isEnglish ? 'Color Palette' : 'Renk Paleti', path: `${basePath}/color-palette`, icon: <Palette size={13} strokeWidth={2.2} /> },
    { label: 'SVG Optimizer', path: `${basePath}/svg-optimize`, icon: <Code2 size={13} strokeWidth={2.2} /> },
  ];

  return (
    <div
      onClick={triggerBlink}
      className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-6 pb-12 select-none overflow-hidden"
    >
      {/* ── TOP SECTION: EDITORIAL HEADER MESSAGE ──────────────────── */}
      <div className="w-full max-w-4xl mx-auto pt-4 sm:pt-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1D1D1F] leading-[1.12]">
            {isEnglish ? (
              <>
                Uh oh, the page you&apos;re looking for<br />
                can&apos;t be found.
              </>
            ) : (
              <>
                Uh oh, aradığınız sayfa<br />
                bulunamadı.
              </>
            )}
          </h1>
        </motion.div>
      </div>

      {/* ── CENTER SECTION: INTERACTIVE MOUSE-TRACKING EYES ────────── */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-8">
        <div className="flex items-center justify-center gap-4 sm:gap-7 relative cursor-pointer">

          {/* ── LEFT EYE ── */}
          <div className="flex flex-col items-center">
            {/* Left Eyebrow */}
            <motion.div
              animate={{
                y: eyebrowOffset.y,
                rotate: -eyebrowOffset.rotate - 3,
              }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
              className="w-20 sm:w-28 h-4 sm:h-5 bg-[#1D1D1F] rounded-full mb-3 sm:mb-4 transform -rotate-6"
            />

            {/* Left Eye Socket */}
            <motion.div
              ref={leftEyeRef}
              animate={{ scaleY: isBlinking ? 0.08 : 1 }}
              transition={{ duration: 0.12 }}
              className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full bg-white border-[7px] sm:border-[9px] border-[#1D1D1F] shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden"
            >
              {/* Pupil */}
              <motion.div
                style={{
                  transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)`,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 160 }}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#1D1D1F] relative flex items-center justify-center shadow-inner"
              >
                {/* Catchlight / Reflection */}
                <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-white absolute top-2 left-2.5 sm:top-3 sm:left-3.5 opacity-90" />
              </motion.div>
            </motion.div>
          </div>

          {/* ── RIGHT EYE ── */}
          <div className="flex flex-col items-center">
            {/* Right Eyebrow */}
            <motion.div
              animate={{
                y: eyebrowOffset.y,
                rotate: eyebrowOffset.rotate + 3,
              }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
              className="w-20 sm:w-28 h-4 sm:h-5 bg-[#1D1D1F] rounded-full mb-3 sm:mb-4 transform rotate-6"
            />

            {/* Right Eye Socket */}
            <motion.div
              ref={rightEyeRef}
              animate={{ scaleY: isBlinking ? 0.08 : 1 }}
              transition={{ duration: 0.12 }}
              className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full bg-white border-[7px] sm:border-[9px] border-[#1D1D1F] shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden"
            >
              {/* Pupil */}
              <motion.div
                style={{
                  transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)`,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 160 }}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#1D1D1F] relative flex items-center justify-center shadow-inner"
              >
                {/* Catchlight / Reflection */}
                <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-white absolute top-2 left-2.5 sm:top-3 sm:left-3.5 opacity-90" />
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM ACTIONS & QUICK TOOLS ───────────────────────────── */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 pt-4 border-t border-black/10">
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={basePath || '/'}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[14px] font-bold text-white bg-[#1D1D1F] hover:bg-black shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <HomeIcon size={15} strokeWidth={2.2} />
            <span>{isEnglish ? 'Back to Home' : 'Ana Sayfaya Dön'}</span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-bold text-[#1D1D1F] bg-white hover:bg-gray-50 border border-gray-200/90 shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowLeft size={15} strokeWidth={2.2} />
            <span>{isEnglish ? 'Go Back' : 'Geri Dön'}</span>
          </button>
        </div>

        {/* Popular Tools Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {popularTools.slice(0, 4).map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-zinc-700 bg-white/90 hover:bg-white hover:text-brand-purple border border-gray-200/80 shadow-sm hover:shadow transition-all"
            >
              <span className="text-zinc-400">{tool.icon}</span>
              <span>{tool.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
