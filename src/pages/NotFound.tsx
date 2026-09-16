import React, { useEffect, useRef } from 'react';
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
  Code2,
  Plus
} from 'lucide-react';

interface PhysicsBody {
  id: number;
  type: 'text' | 'dot';
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  size: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  mass: number;
}

const BRAND_COLORS = [
  '#FA7DA8', // Brand Coral Pink
  '#B896DF', // Brand Purple
  '#86B3F0', // Brand Sky Blue
  '#E879F9', // Brand Fuchsia
  '#F43F5E', // Brand Rose
  '#7B8BFF', // Brand Indigo
];

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const mouseRef = useRef<{ x: number; y: number; isMoving: boolean; prevX: number; prevY: number; vx: number; vy: number }>({
    x: -1000,
    y: -1000,
    isMoving: false,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
  });



  // Helper to spawn a single falling 404 or dot
  const createBody = (width: number, fromTop = true, spawnX?: number, spawnY?: number): PhysicsBody => {
    const isText = Math.random() > 0.18; // 82% 404 text, 18% circular dots
    const size = isText ? Math.floor(Math.random() * 32) + 36 : Math.floor(Math.random() * 12) + 8;
    const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];

    return {
      id: Math.random(),
      type: isText ? 'text' : 'dot',
      text: '404',
      x: spawnX !== undefined ? spawnX : Math.random() * (width - 100) + 50,
      y: spawnY !== undefined ? spawnY : (fromTop ? -Math.random() * 400 - 40 : Math.random() * 200),
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      rotation: (Math.random() - 0.5) * 1.2,
      vRot: (Math.random() - 0.5) * 0.05,
      size,
      width: isText ? size * 2.2 : size * 2,
      height: isText ? size : size * 2,
      color,
      opacity: Math.random() * 0.35 + 0.65,
      mass: isText ? size * 0.5 : size * 0.2,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
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

    // Initial population of falling 404s
    const initialCount = Math.min(Math.floor(window.innerWidth / 24), 65);
    const initialBodies: PhysicsBody[] = [];
    for (let i = 0; i < initialCount; i++) {
      initialBodies.push(createBody(window.innerWidth, true));
    }
    bodiesRef.current = initialBodies;

    // Physics constants
    const gravity = 0.22;
    const drag = 0.985;
    const bounce = 0.55;
    const mouseRadius = 160;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const bodies = bodiesRef.current;

      // Calculate mouse velocity for pushing
      mouse.vx = mouse.x - mouse.prevX;
      mouse.vy = mouse.y - mouse.prevY;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];

        // Apply gravity & drag
        b.vy += gravity * dt;
        b.vx *= drag;
        b.vy *= drag;
        b.vRot *= 0.98;

        // Apply position
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rotation += b.vRot * dt;

        // Mouse repulsion & fling
        const dx = b.x - mouse.x;
        const dy = b.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * 1.6;
          const normalX = dx / dist;
          const normalY = dy / dist;

          // Push away from cursor + transfer mouse velocity
          b.vx += (normalX * force * 9 + mouse.vx * 0.4) * dt;
          b.vy += (normalY * force * 9 + mouse.vy * 0.4) * dt;
          b.vRot += (normalX * 0.08 + (Math.random() - 0.5) * 0.04) * dt;
        }

        // Floor collision & stacking spread
        const floorY = h - b.height * 0.6;
        if (b.y > floorY) {
          b.y = floorY;
          b.vy = -b.vy * bounce;
          b.vx += (Math.random() - 0.5) * 1.5; // Stacking spread
          b.vRot *= 0.85;

          // If rested at the bottom, gently let others slide off
          if (Math.abs(b.vy) < 0.6) {
            b.vy = 0;
          }
        }

        // Left & Right wall collisions
        if (b.x < b.width * 0.5) {
          b.x = b.width * 0.5;
          b.vx = Math.abs(b.vx) * bounce;
        } else if (b.x > w - b.width * 0.5) {
          b.x = w - b.width * 0.5;
          b.vx = -Math.abs(b.vx) * bounce;
        }

        // DRAW BODY
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.globalAlpha = b.opacity;

        if (b.type === 'text') {
          ctx.font = `900 ${b.size}px Inter, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = b.color;
          ctx.fillText(b.text, 0, 0);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, b.size, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Track mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
    mouseRef.current.isMoving = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.x = -1000;
    mouseRef.current.y = -1000;
  };

  // Click anywhere on canvas to burst new 404s!
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Spawn 5 extra 404 particles radiating outwards
    const newBodies: PhysicsBody[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const speed = Math.random() * 8 + 6;
      const body = createBody(window.innerWidth, false, clickX, clickY);
      body.vx = Math.cos(angle) * speed;
      body.vy = Math.sin(angle) * speed - 4;
      body.vRot = (Math.random() - 0.5) * 0.3;
      newBodies.push(body);
    }

    bodiesRef.current = [...bodiesRef.current, ...newBodies];
  };

  // Function to drop a wave of 15 more 404s
  const dropMore404s = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBodies: PhysicsBody[] = [];
    for (let i = 0; i < 16; i++) {
      newBodies.push(createBody(window.innerWidth, true));
    }
    bodiesRef.current = [...bodiesRef.current, ...newBodies];
  };

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
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative w-full min-h-[calc(100vh-110px)] flex flex-col items-center justify-center overflow-hidden cursor-default select-none"
    >
      {/* ── FULL-SCREEN PHYSICS CANVAS ─────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* ── FLOATING GLASS OVERLAY CARD (INTERACTIVE & CLEAN) ──────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-w-xl mx-4 my-auto p-8 sm:p-10 rounded-[36px] bg-white/90 backdrop-blur-2xl border border-white/95 shadow-[0_24px_70px_rgba(250,125,168,0.18),0_12px_32px_rgba(184,150,223,0.15)] text-center"
      >
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-[12.5px] font-bold text-zinc-700 bg-white border border-gray-200/80 shadow-sm">
          <Sparkles size={14} className="text-[#FA7DA8] animate-spin" style={{ animationDuration: '4s' }} />
          <span className="bg-gradient-to-r from-[#FA7DA8] via-[#B896DF] to-[#86B3F0] bg-clip-text text-transparent font-extrabold uppercase tracking-wider text-[11px]">
            {isEnglish ? 'Interactive 404 Physics' : 'Etkileşimli 404 Yağmuru'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Big Gradient Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-[#1D1D1F] tracking-tight mb-3">
          {isEnglish ? 'Oops! Page got scattered.' : 'Ooops! Sayfa darmadağın oldu.'}
        </h1>

        <p className="text-[15px] sm:text-[16px] text-[#6E6E73] font-medium leading-relaxed mb-8 max-w-md mx-auto">
          {isEnglish
            ? 'Move your mouse to scatter the falling 404s, or click anywhere on the screen to spawn a new explosion!'
            : 'Fareni gezdirerek düşen 404\'leri dağıtabilir veya ekrana tıklayarak yeni 404 patlamaları yaratabilirsin!'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
          <Link
            to={basePath || '/'}
            className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-full text-[14.5px] font-bold text-white bg-[#1D1D1F] hover:bg-black shadow-lg shadow-black/15 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <HomeIcon size={16} strokeWidth={2.2} />
            <span>{isEnglish ? 'Back to Home' : 'Ana Sayfaya Dön'}</span>
          </Link>

          <button
            onClick={dropMore404s}
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-[14px] font-bold text-white bg-gradient-to-r from-[#FA7DA8] via-[#B896DF] to-[#86B3F0] hover:opacity-95 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{isEnglish ? 'Drop More 404s' : 'Daha Çok 404 Yağdır!'}</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-bold text-zinc-700 bg-white hover:bg-gray-50 border border-gray-200/90 shadow-sm hover:shadow hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <ArrowLeft size={15} strokeWidth={2.2} />
            <span>{isEnglish ? 'Go Back' : 'Geri Dön'}</span>
          </button>
        </div>

        {/* Quick Tools Directory */}
        <div className="pt-6 border-t border-gray-100">
          <div className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
            {isEnglish ? 'Popular Tools' : 'Hemen Kullanabileceğin Popüler Araçlar'}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold text-zinc-700 bg-gray-50 hover:bg-white hover:text-brand-purple border border-gray-200/70 hover:border-purple-200 shadow-sm hover:shadow transition-all"
              >
                <span className="text-zinc-400">{tool.icon}</span>
                <span>{tool.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Floating Interactive Hint */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-10">
        <div className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/80 text-[12px] font-bold text-zinc-600 shadow-sm">
          💡 {isEnglish ? 'Tip: Move cursor to push 404s • Click anywhere to burst' : 'İpucu: Fareyi gezdirerek 404\'leri it • Ekrana tıklayarak patlat'}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
