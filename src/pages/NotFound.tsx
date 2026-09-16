import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home as HomeIcon, Sparkles } from 'lucide-react';

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
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
    setTimeout(() => setIsBlinking(false), 130);
  }, []);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      triggerBlink();
    }, 4500);

    return () => clearInterval(blinkInterval);
  }, [triggerBlink]);

  // Track mouse coordinates and calculate pupil offset for each eye
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Max distance pupil can move inside eye socket (in pixels)
      const maxDistance = window.innerWidth < 640 ? 20 : 28;

      // ── Left Eye Pupil Tracking ──
      if (leftEyeRef.current) {
        const rect = leftEyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const angle = Math.atan2(dy, dx);
        const dist = Math.hypot(dx, dy);

        const clampedDist = Math.min(dist * 0.075, maxDistance);
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

        const clampedDist = Math.min(dist * 0.075, maxDistance);
        setRightPupil({
          x: Math.cos(angle) * clampedDist,
          y: Math.sin(angle) * clampedDist,
        });
      }

      // ── Eyebrow subtle response ──
      const screenYRatio = mouseY / window.innerHeight;
      const screenXRatio = (mouseX / window.innerWidth) - 0.5;
      setEyebrowOffset({
        y: (screenYRatio - 0.5) * 6,
        rotate: screenXRatio * 5,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      onClick={triggerBlink}
      className="w-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 select-none"
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center my-auto">

        {/* ── TOP BADGE ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-[12px] font-bold text-zinc-700 bg-white/90 border border-gray-200/90 shadow-sm backdrop-blur-md"
        >
          <Sparkles size={13} className="text-[#FA7DA8]" />
          <span className="bg-gradient-to-r from-[#FA7DA8] via-[#B896DF] to-[#86B3F0] bg-clip-text text-transparent font-black tracking-wider uppercase">
            {isEnglish ? '404 · Error' : '404 · Sayfa Bulunamadı'}
          </span>
        </motion.div>

        {/* ── BEAUTIFULLY PROPORTIONED HEADLINE & SUBTEXT ───────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mb-8 sm:mb-10 max-w-xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.035em] text-[#1D1D1F] leading-[1.12] mb-3 font-sans">
            {isEnglish ? (
              <>
                Uh oh! The page you&apos;re looking for<br className="hidden sm:inline" /> can&apos;t be found.
              </>
            ) : (
              <>
                Uh oh! Aradığınız sayfa<br className="hidden sm:inline" /> bulunamadı.
              </>
            )}
          </h1>
          <p className="text-[15px] sm:text-[16.5px] text-[#6E6E73] font-medium leading-relaxed max-w-md mx-auto">
            {isEnglish
              ? "Looks like this page got cropped out of frame or doesn't exist."
              : 'Görünüşe göre bu sayfa kadrajın dışına çıkmış veya silinmiş.'}
          </p>
        </motion.div>

        {/* ── CENTER SECTION: INTERACTIVE MOUSE-TRACKING EYES ────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-6 relative cursor-pointer group">

            {/* ── LEFT EYE ── */}
            <div className="flex flex-col items-center">
              {/* Left Eyebrow */}
              <motion.div
                animate={{
                  y: eyebrowOffset.y,
                  rotate: -eyebrowOffset.rotate - 3,
                }}
                transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                className="w-16 sm:w-24 h-3.5 sm:h-4.5 bg-[#1D1D1F] rounded-full mb-2.5 sm:mb-3 transform -rotate-6 shadow-sm"
              />

              {/* Left Eye Socket */}
              <motion.div
                ref={leftEyeRef}
                animate={{ scaleY: isBlinking ? 0.08 : 1 }}
                transition={{ duration: 0.1 }}
                className="relative w-28 h-28 sm:w-38 sm:h-38 md:w-42 md:h-42 rounded-full bg-white border-[6px] sm:border-[8px] border-[#1D1D1F] shadow-[0_12px_28px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden"
              >
                {/* Pupil */}
                <motion.div
                  style={{
                    transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)`,
                  }}
                  transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-[#1D1D1F] relative flex items-center justify-center shadow-inner"
                >
                  {/* Catchlight / Reflection */}
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white absolute top-2 left-2 sm:top-2.5 sm:left-3 opacity-95" />
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
                className="w-16 sm:w-24 h-3.5 sm:h-4.5 bg-[#1D1D1F] rounded-full mb-2.5 sm:mb-3 transform rotate-6 shadow-sm"
              />

              {/* Right Eye Socket */}
              <motion.div
                ref={rightEyeRef}
                animate={{ scaleY: isBlinking ? 0.08 : 1 }}
                transition={{ duration: 0.1 }}
                className="relative w-28 h-28 sm:w-38 sm:h-38 md:w-42 md:h-42 rounded-full bg-white border-[6px] sm:border-[8px] border-[#1D1D1F] shadow-[0_12px_28px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden"
              >
                {/* Pupil */}
                <motion.div
                  style={{
                    transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)`,
                  }}
                  transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-[#1D1D1F] relative flex items-center justify-center shadow-inner"
                >
                  {/* Catchlight / Reflection */}
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white absolute top-2 left-2 sm:top-2.5 sm:left-3 opacity-95" />
                </motion.div>
              </motion.div>
            </div>

          </div>
        </motion.div>

        {/* ── SINGLE CENTERED MAIN ACTION BUTTON ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex items-center justify-center"
        >
          <Link
            to={basePath || '/'}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[15px] font-bold text-white bg-[#1D1D1F] hover:bg-black shadow-lg shadow-black/15 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <HomeIcon size={17} strokeWidth={2.2} />
            <span>{isEnglish ? 'Back to Home' : 'Ana Sayfaya Dön'}</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default NotFound;
