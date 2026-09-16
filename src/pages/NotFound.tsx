import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Home as HomeIcon,
  ArrowLeft,
  RotateCcw,
  Plus,
  Compass
} from 'lucide-react';

interface PhysicsObject {
  id: number;
  type: 'text404' | 'badge' | 'dot';
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  width: number;
  height: number;
  radius: number;
  color: string;
  bgColor?: string;
  textColor?: string;
  isDragging?: boolean;
}

const BRAND_PALETTE = [
  { bg: '#FA7DA8', text: '#FFFFFF', name: 'Pink' },
  { bg: '#B896DF', text: '#FFFFFF', name: 'Purple' },
  { bg: '#86B3F0', text: '#FFFFFF', name: 'Sky' },
  { bg: '#7B8BFF', text: '#FFFFFF', name: 'Indigo' },
  { bg: '#1D1D1F', text: '#FFFFFF', name: 'Dark' },
  { bg: '#FFFFFF', text: '#1D1D1F', name: 'White' },
];

const BADGE_WORDS = [
  'COMPRESS', 'RESIZE', 'CONVERT', 'SVG', 'WEBP',
  'PNG', 'JPG', 'RAW 8K', 'CROP', 'WATERMARK',
  'PHOTO EDIT', 'PALETTE', '404 ERROR', 'LOST PIXEL'
];

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const objectsRef = useRef<PhysicsObject[]>([]);
  const draggedObjRef = useRef<{ obj: PhysicsObject; offsetX: number; offsetY: number } | null>(null);
  const mouseRef = useRef<{ x: number; y: number; prevX: number; prevY: number; vx: number; vy: number; isDown: boolean }>({
    x: -1000,
    y: -1000,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
  });

  // Helper to create physics body
  const spawnObject = (w: number, customX?: number, customY?: number): PhysicsObject => {
    const rand = Math.random();
    let type: 'text404' | 'badge' | 'dot' = 'text404';
    if (rand < 0.45) type = 'text404';
    else if (rand < 0.85) type = 'badge';
    else type = 'dot';

    const colorScheme = BRAND_PALETTE[Math.floor(Math.random() * BRAND_PALETTE.length)];
    const x = customX !== undefined ? customX : Math.random() * (w - 120) + 60;
    const y = customY !== undefined ? customY : -Math.random() * 500 - 60;

    if (type === 'text404') {
      const fontSize = Math.floor(Math.random() * 36) + 48; // 48px to 84px
      return {
        id: Math.random(),
        type: 'text404',
        text: '404',
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        angle: (Math.random() - 0.5) * 0.8,
        vAngle: (Math.random() - 0.5) * 0.04,
        width: fontSize * 2.1,
        height: fontSize * 0.9,
        radius: fontSize,
        color: colorScheme.bg === '#FFFFFF' ? '#FA7DA8' : colorScheme.bg,
      };
    } else if (type === 'badge') {
      const text = BADGE_WORDS[Math.floor(Math.random() * BADGE_WORDS.length)];
      const textWidth = text.length * 10 + 28;
      const height = 36;
      return {
        id: Math.random(),
        type: 'badge',
        text,
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        angle: (Math.random() - 0.5) * 0.6,
        vAngle: (Math.random() - 0.5) * 0.03,
        width: textWidth,
        height,
        radius: Math.max(textWidth, height) * 0.5,
        color: colorScheme.bg,
        bgColor: colorScheme.bg,
        textColor: colorScheme.text,
      };
    } else {
      const radius = Math.floor(Math.random() * 10) + 7;
      return {
        id: Math.random(),
        type: 'dot',
        text: '',
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        angle: 0,
        vAngle: 0,
        width: radius * 2,
        height: radius * 2,
        radius,
        color: colorScheme.bg,
      };
    }
  };

  const resetSimulation = () => {
    if (!canvasRef.current) return;
    const w = window.innerWidth;
    const count = Math.min(Math.floor(w / 28), 55);
    const initial: PhysicsObject[] = [];
    for (let i = 0; i < count; i++) {
      initial.push(spawnObject(w));
    }
    objectsRef.current = initial;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Populate initial items
    resetSimulation();

    // Physics constants
    const gravity = 0.32;
    const airDrag = 0.988;
    const groundBounce = 0.52;
    const wallBounce = 0.6;
    const mouseRadius = 150;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      mouse.vx = (mouse.x - mouse.prevX) * 0.5;
      mouse.vy = (mouse.y - mouse.prevY) * 0.5;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      const objects = objectsRef.current;

      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];

        if (obj.isDragging) {
          // If being dragged, directly follow mouse with velocity
          obj.vx = mouse.vx * 1.2;
          obj.vy = mouse.vy * 1.2;
          obj.vAngle = mouse.vx * 0.02;
        } else {
          // Apply gravity and air drag
          obj.vy += gravity * dt;
          obj.vx *= airDrag;
          obj.vy *= airDrag;
          obj.vAngle *= 0.98;

          obj.x += obj.vx * dt;
          obj.y += obj.vy * dt;
          obj.angle += obj.vAngle * dt;

          // Mouse Repulsion Force when not dragging
          const dx = obj.x - mouse.x;
          const dy = obj.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseRadius && dist > 0) {
            const force = (1 - dist / mouseRadius) * 2.2;
            const nx = dx / dist;
            const ny = dy / dist;

            obj.vx += (nx * force * 10 + mouse.vx * 0.6) * dt;
            obj.vy += (ny * force * 10 + mouse.vy * 0.6) * dt;
            obj.vAngle += (nx * 0.08 + (Math.random() - 0.5) * 0.05) * dt;
          }

          // Floor collision and stacking
          const floorLimit = h - obj.height * 0.5 - 6;
          if (obj.y > floorLimit) {
            obj.y = floorLimit;
            obj.vy = -obj.vy * groundBounce;
            obj.vx += (Math.random() - 0.5) * 1.2; // slight pile scatter
            obj.vAngle *= 0.8;

            if (Math.abs(obj.vy) < 0.6) {
              obj.vy = 0;
            }
          }

          // Wall collision
          const halfW = obj.width * 0.5;
          if (obj.x < halfW) {
            obj.x = halfW;
            obj.vx = Math.abs(obj.vx) * wallBounce;
          } else if (obj.x > w - halfW) {
            obj.x = w - halfW;
            obj.vx = -Math.abs(obj.vx) * wallBounce;
          }
        }

        // ── DRAW OBJECT ──────────────────────────────────────────
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.angle);

        if (obj.type === 'text404') {
          // Editorial 404 Typography
          ctx.font = `900 ${obj.height * 1.1}px "Inter Tight", "Inter", -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = obj.color;
          ctx.shadowColor = 'rgba(0,0,0,0.06)';
          ctx.shadowBlur = 8;
          ctx.fillText('404', 0, 0);
        } else if (obj.type === 'badge') {
          // Draggable Pill Badge
          const pw = obj.width;
          const ph = obj.height;
          const rad = ph * 0.5;

          ctx.shadowColor = 'rgba(0,0,0,0.12)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;

          ctx.beginPath();
          ctx.roundRect(-pw * 0.5, -ph * 0.5, pw, ph, rad);
          ctx.fillStyle = obj.bgColor || '#1D1D1F';
          ctx.fill();

          ctx.shadowColor = 'transparent';
          ctx.font = `800 12px "Inter", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = obj.textColor || '#FFFFFF';
          ctx.letterSpacing = '1px';
          ctx.fillText(obj.text, 0, 1);
        } else if (obj.type === 'dot') {
          // Geometric Color Dot
          ctx.shadowColor = 'rgba(0,0,0,0.08)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = obj.color;
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // ── Drag & Drop / Physics Interactivity ────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    mouseRef.current.isDown = true;
    mouseRef.current.x = clickX;
    mouseRef.current.y = clickY;

    // Check if clicked an object (reverse order for top-most)
    const objects = objectsRef.current;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const dx = clickX - obj.x;
      const dy = clickY - obj.y;
      if (Math.hypot(dx, dy) < obj.radius * 1.1) {
        obj.isDragging = true;
        draggedObjRef.current = { obj, offsetX: dx, offsetY: dy };
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current.x = x;
    mouseRef.current.y = y;

    if (draggedObjRef.current) {
      draggedObjRef.current.obj.x = x - draggedObjRef.current.offsetX;
      draggedObjRef.current.obj.y = y - draggedObjRef.current.offsetY;
    }
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
    if (draggedObjRef.current) {
      draggedObjRef.current.obj.isDragging = false;
      draggedObjRef.current = null;
    }
  };

  // Add 10 more falling elements
  const addMoreBodies = (e: React.MouseEvent) => {
    e.stopPropagation();
    const w = window.innerWidth;
    const newItems: PhysicsObject[] = [];
    for (let i = 0; i < 12; i++) {
      newItems.push(spawnObject(w));
    }
    objectsRef.current = [...objectsRef.current, ...newItems];
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-[calc(100vh-80px)] min-h-[620px] overflow-hidden select-none bg-[#FAF9F7]"
    >
      {/* ── FULL CANVAS PHYSICS SIMULATION ─────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* ── AWWWARDS-STYLE FLOATING HUD TOP BAR ────────────────────── */}
      <div className="absolute top-6 inset-x-0 px-6 sm:px-12 flex items-center justify-between pointer-events-none z-20">
        
        {/* Left: Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/10 shadow-sm pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#FA7DA8] animate-ping" />
          <span className="text-[12px] font-extrabold uppercase tracking-wider text-black">
            {isEnglish ? 'Physics 404 Playground' : 'Fizik 404 Deneyim Alanı'}
          </span>
        </div>

        {/* Right: Controls (Spawn + Reset) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={addMoreBodies}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-black text-[12px] font-bold border border-black/10 shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={2.5} className="text-[#FA7DA8]" />
            <span>{isEnglish ? 'Drop 404s' : '404 Ekle'}</span>
          </button>

          <button
            onClick={resetSimulation}
            title={isEnglish ? 'Reset Canvas' : 'Yeniden Başlat'}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-black border border-black/10 shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <RotateCcw size={13} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* ── EDITORIAL CENTER CONTENT (DEPO STUDIO INSPIRED) ────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black text-white text-[11px] font-extrabold uppercase tracking-widest mb-4 shadow-sm">
            <Compass size={12} className="text-[#FA7DA8] animate-spin" style={{ animationDuration: '6s' }} />
            <span>404 NOT FOUND</span>
          </div>

          {/* Huge Brutalist / Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-[#1D1D1F] leading-[0.98] mb-4">
            {isEnglish ? (
              <>
                EVERYTHING HAS<br />
                <span className="text-[#FA7DA8]">FALLEN APART.</span>
              </>
            ) : (
              <>
                HER ŞEY<br />
                <span className="text-[#FA7DA8]">YERLE BİR OLDU.</span>
              </>
            )}
          </h1>

          <p className="text-[15px] sm:text-[17px] text-zinc-600 font-medium max-w-md mx-auto mb-8 leading-snug">
            {isEnglish
              ? 'Grab & fling the falling blocks or head back to create something extraordinary.'
              : 'Düşen blokları farenle tutup fırlatabilir veya hemen ana sayfaya dönüp görsellerini işleyebilirsin.'}
          </p>

          {/* Bold Primary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pointer-events-auto">
            <Link
              to={basePath || '/'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[14.5px] font-black text-white bg-[#1D1D1F] hover:bg-black shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <HomeIcon size={16} strokeWidth={2.4} />
              <span>{isEnglish ? 'RETURN TO HOME' : 'ANA SAYFAYA DÖN'}</span>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[14.5px] font-black text-[#1D1D1F] bg-white hover:bg-zinc-100 border-2 border-[#1D1D1F] shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowLeft size={16} strokeWidth={2.4} />
              <span>{isEnglish ? 'GO BACK' : 'GERİ DÖN'}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── BOTTOM INTERACTION HELPER ──────────────────────────────── */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none z-20">
        <div className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-black/10 text-[11.5px] font-bold text-zinc-600 shadow-sm flex items-center gap-2">
          <span>🖐️</span>
          <span>
            {isEnglish
              ? 'Drag & toss any 404 element or badge with your mouse!'
              : 'İstediğin 404 yazısını veya butonu farenle tutup fırlatabilirsin!'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
