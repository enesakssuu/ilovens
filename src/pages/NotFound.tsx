import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home as HomeIcon } from 'lucide-react';

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
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, [triggerBlink]);

  // Track mouse coordinates and calculate pupil offset for each eye
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Max distance pupil can move inside eye socket (in pixels)
      const maxDistance = window.innerWidth < 640 ? 28 : 42;

      // ── Left Eye Pupil Tracking ──
      if (leftEyeRef.current) {
        const rect = leftEyeRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const angle = Math.atan2(dy, dx);
        const dist = Math.hypot(dx, dy);

        const clampedDist = Math.min(dist * 0.085, maxDistance);
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

        const clampedDist = Math.min(dist * 0.085, maxDistance);
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

  return (
    <div
      onClick={triggerBlink}
      className="w-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center px-4 sm:px-8 py-10 select-none"
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center my-auto">

        {/* ── BOLD, PROMINENT HEADLINE ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-14"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.04em] text-[#1D1D1F] leading-[1.08] font-sans">
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
        </motion.div>

        {/* ── LARGE INTERACTIVE MOUSE-TRACKING EYES ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-6 sm:gap-10 relative cursor-pointer group">

            {/* ── LEFT EYE ── */}
            <div className="flex flex-col items-center">
              {/* Left Eyebrow */}
              <motion.div
                animate={{
                  y: eyebrowOffset.y,
                  rotate: -eyebrowOffset.rotate - 3,
                }}
                transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                className="w-24 sm:w-36 h-4 sm:h-6 bg-[#1D1D1F] rounded-full mb-3.5 sm:mb-5 transform -rotate-6 shadow-sm"
              />

              {/* Left Eye Socket */}
              <motion.div
                ref={leftEyeRef}
                animate={{ scaleY: isBlinking ? 0.08 : 1 }}
                transition={{ duration: 0.1 }}
                className="relative w-36 h-36 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full bg-white border-[8px] sm:border-[11px] border-[#1D1D1F] shadow-[0_16px_36px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden"
              >
                {/* Pupil */}
                <motion.div
                  style={{
                    transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)`,
                  }}
                  transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                  className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-[#1D1D1F] relative flex items-center justify-center shadow-inner"
                >
                  {/* Catchlight / Reflection */}
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white absolute top-2.5 left-2.5 sm:top-4 sm:left-4 opacity-95" />
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
                className="w-24 sm:w-36 h-4 sm:h-6 bg-[#1D1D1F] rounded-full mb-3.5 sm:mb-5 transform rotate-6 shadow-sm"
              />

              {/* Right Eye Socket */}
              <motion.div
                ref={rightEyeRef}
                animate={{ scaleY: isBlinking ? 0.08 : 1 }}
                transition={{ duration: 0.1 }}
                className="relative w-36 h-36 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full bg-white border-[8px] sm:border-[11px] border-[#1D1D1F] shadow-[0_16px_36px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden"
              >
                {/* Pupil */}
                <motion.div
                  style={{
                    transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)`,
                  }}
                  transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                  className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-[#1D1D1F] relative flex items-center justify-center shadow-inner"
                >
                  {/* Catchlight / Reflection */}
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white absolute top-2.5 left-2.5 sm:top-4 sm:left-4 opacity-95" />
                </motion.div>
              </motion.div>
            </div>

          </div>
        </motion.div>

        {/* ── BIG CENTERED ANA SAYFAYA DÖN BUTTON ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center"
        >
          <Link
            to={basePath || '/'}
            className="inline-flex items-center gap-3 px-9 sm:px-11 py-4 sm:py-4.5 rounded-full text-[16px] sm:text-[17px] font-extrabold text-white bg-[#1D1D1F] hover:bg-black shadow-xl shadow-black/15 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <HomeIcon size={19} strokeWidth={2.4} />
            <span>{isEnglish ? 'Back to Home' : 'Ana Sayfaya Dön'}</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default NotFound;
