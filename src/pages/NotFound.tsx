import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as HomeIcon,
  ArrowLeft,
  Dices,
  Sparkles,
  Gamepad2,
  Trophy,
  RotateCcw,
  Minimize2,
  RefreshCw,
  Maximize2,
  Code2,
  Wand2,
  Crop,
  Laugh,
  Flame
} from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export const NotFound: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  // ── Random Fun Quotes / Jokes ──────────────────────────────────────
  const funJokesTr = [
    '“Bu sayfa 404 değil, sadece görünmez PNG formatında kaydedilmiş.” 🖼️',
    '“Sayfa kaybolmadı, sadece CSS dosyasında `display: none;` unutulmuş.” 🎨',
    '“Fotoğrafçı arkasını döndüğü anda sayfa kadrajdan kaçtı!” 📸',
    '“404 Hatası: Piksel canavarı bu URL\'yi akşam yemeğinde yedi.” 👾',
    '“Sayfa şu anda yüksek çözünürlüklü olarak render ediliyor... Şaka şaka, yok öyle bir sayfa.” ☕',
    '“Ctrl+Z yaptık ama geri gelmedi be reis.” ⌨️',
  ];

  const funJokesEn = [
    '“This page is not 404, it was just exported as a transparent PNG.” 🖼️',
    '“The page isn\'t missing, someone just left `display: none;` in the CSS.” 🎨',
    '“As soon as the photographer blinked, the page slipped out of frame!” 📸',
    '“404: The pixel monster ate this URL for dinner.” 👾',
    '“Page is currently rendering in 8K... Just kidding, it really doesn\'t exist.” ☕',
    '“We tried pressing Ctrl+Z, but it didn\'t bring it back.” ⌨️',
  ];

  const jokes = isEnglish ? funJokesEn : funJokesTr;
  const [jokeIndex, setJokeIndex] = useState(0);

  const nextJoke = () => {
    setJokeIndex((prev) => (prev + 1) % jokes.length);
  };

  // ── Mini Game: Catch the Lost Pixels ────────────────────────────────
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('ilovens_404_highscore') || 0);
  });
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [targetEmoji, setTargetEmoji] = useState('👾');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [comboMessage, setComboMessage] = useState<string | null>(null);

  const emojis = ['👾', '📸', '🎨', '✨', '⚡', '🛸', '🍕', '🐱', '🕶️'];

  const moveTarget = () => {
    // Random position within 15% to 85% range
    const newX = Math.floor(Math.random() * 70) + 15;
    const newY = Math.floor(Math.random() * 70) + 15;
    setTargetPos({ x: newX, y: newY });
    setTargetEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  };

  const handleCatchPixel = () => {
    const newScore = score + 1;
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('ilovens_404_highscore', String(newScore));
    }

    // Spawn mini explosion particles
    const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      color: ['#7B8BFF', '#E879F9', '#FA7DA8', '#10B981', '#F59E0B'][i % 5],
      size: Math.random() * 6 + 4,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);

    // Fun combo messages
    if (newScore === 5) setComboMessage(isEnglish ? '🔥 Nice reflexes!' : '🔥 Refleksler harika!');
    else if (newScore === 10) setComboMessage(isEnglish ? '⚡ Pixel Master!' : '⚡ Piksel Ustası!');
    else if (newScore === 20) setComboMessage(isEnglish ? '👑 Unstoppable Gamer!' : '👑 Durdurulamaz Şampiyon!');
    else if (newScore > 5 && newScore % 5 === 0) setComboMessage(isEnglish ? `🎉 Streak: ${newScore}!` : `🎉 Seri: ${newScore}!`);

    moveTarget();
  };

  const resetGame = () => {
    setScore(0);
    setComboMessage(null);
    moveTarget();
  };

  // ── Random Tool Teleporter ──────────────────────────────────────────
  const allTools = [
    { path: '/compress', name: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır' },
    { path: '/resize', name: isEnglish ? 'Resize Image' : 'Yeniden Boyutlandır' },
    { path: '/convert', name: isEnglish ? 'Format Convert' : 'Format Dönüştür' },
    { path: '/crop', name: isEnglish ? 'Crop Image' : 'Görsel Kırp' },
    { path: '/rotate', name: isEnglish ? 'Rotate & Flip' : 'Döndür & Çevir' },
    { path: '/svg-optimize', name: 'SVG Optimizer' },
    { path: '/exif-remover', name: 'EXIF Remover' },
    { path: '/watermark', name: isEnglish ? 'Watermark' : 'Filigran Ekle' },
    { path: '/meme', name: 'Meme Generator' },
    { path: '/blur-face', name: isEnglish ? 'Face Blur' : 'Yüz Bulanıklaştır' },
    { path: '/color-palette', name: isEnglish ? 'Color Palette' : 'Renk Paleti' },
    { path: '/photo-editor', name: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü' },
    { path: '/heic-to-jpg', name: 'HEIC to JPG' },
    { path: '/html-to-image', name: 'HTML to Image' },
  ];

  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportChoice, setTeleportChoice] = useState<string | null>(null);

  const teleportToRandomTool = () => {
    setIsTeleporting(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = allTools[Math.floor(Math.random() * allTools.length)];
      setTeleportChoice(rand.name);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setTimeout(() => {
          navigate(`${basePath}${rand.path}`);
        }, 450);
      }
    }, 90);
  };

  // ── Popular Tools Grid ──────────────────────────────────────────────
  const popularTools = [
    {
      icon: <Minimize2 size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Compress Image' : 'Görsel Sıkıştır',
      desc: isEnglish ? 'Shrink up to 90%' : '%90\'a varan dosya sıkıştırma',
      path: `${basePath}/compress`,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white',
    },
    {
      icon: <RefreshCw size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Format Convert' : 'Format Dönüştür',
      desc: isEnglish ? 'JPG, PNG, WebP, HEIC' : 'JPG, PNG, WebP ve HEIC',
      path: `${basePath}/convert`,
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white',
    },
    {
      icon: <Maximize2 size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Resize Image' : 'Yeniden Boyutlandır',
      desc: isEnglish ? 'Pixel perfect resizing' : 'Piksel bazında hassas boyut',
      path: `${basePath}/resize`,
      color: 'bg-violet-500/10 text-violet-600 border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white',
    },
    {
      icon: <Code2 size={20} strokeWidth={1.8} />,
      title: 'SVG Optimizer',
      desc: isEnglish ? 'Clean SVG vector code' : 'SVG kodlarını temizle ve küçült',
      path: `${basePath}/svg-optimize`,
      color: 'bg-lime-500/10 text-lime-600 border-lime-500/20 group-hover:bg-lime-500 group-hover:text-white',
    },
    {
      icon: <Wand2 size={20} strokeWidth={1.8} />,
      title: isEnglish ? 'Photo Editor' : 'Fotoğraf Editörü',
      desc: isEnglish ? 'Filters, effects & fine-tuning' : 'Filtreler, parlaklık ve efektler',
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
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 select-none">
      
      {/* ── TOP HERO BANNER ────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-[13px] font-semibold text-[#6E6E73] bg-white/90 border border-gray-200/80 shadow-sm backdrop-blur-md"
        >
          <Sparkles size={14} className="text-[#B896DF] animate-pulse" strokeWidth={2.2} />
          <span>{isEnglish ? '404 · You Discovered the Secret Lounge!' : '404 · Gizli Dinlenme Alanını Keşfettin!'}</span>
        </motion.div>

        {/* Big Stylized 404 Number with Playful Bouncing Emoji */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative my-2 inline-block"
        >
          <div className="text-[96px] sm:text-[130px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] filter drop-shadow-sm">
            404
          </div>
          <motion.div
            animate={{
              y: [0, -12, 0],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-3 -right-6 sm:-right-8 text-3xl sm:text-4xl filter drop-shadow"
          >
            🛸
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-2"
        >
          {isEnglish ? 'Looks like this page got cropped out!' : 'Görünüşe göre bu sayfa kadrajdan çıktı!'}
        </motion.h1>

        {/* Fun Developer & Designer Joke Box */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="my-5 max-w-xl mx-auto p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 text-purple-600 mt-0.5">
              <Laugh size={18} strokeWidth={2} />
            </div>
            <p className="text-[13.5px] sm:text-[14px] text-zinc-700 font-medium leading-snug">
              {jokes[jokeIndex]}
            </p>
          </div>
          <button
            onClick={nextJoke}
            className="flex-shrink-0 px-3 py-1.5 text-[12px] font-semibold text-purple-600 hover:text-purple-700 bg-purple-50/80 hover:bg-purple-100 rounded-full transition-all"
          >
            {isEnglish ? 'Next Joke 🎲' : 'Başka Espri 🎲'}
          </button>
        </motion.div>

        {/* Main CTA Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Link
            to={basePath || '/'}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-semibold text-white bg-[#1D1D1F] hover:bg-black shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <HomeIcon size={15} strokeWidth={2} />
            <span>{isEnglish ? 'Back to Home' : 'Ana Sayfaya Dön'}</span>
          </Link>

          <button
            onClick={teleportToRandomTool}
            disabled={isTeleporting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-semibold text-white bg-gradient-to-r from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] hover:opacity-95 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75"
          >
            <Dices size={16} className={isTeleporting ? 'animate-spin' : ''} />
            <span>
              {isTeleporting
                ? `${isEnglish ? 'Teleporting to:' : 'Işınlanıyor:'} ${teleportChoice || '...'}`
                : isEnglish
                ? 'Beam Me to Random Tool 🎲'
                : 'Beni Rastgele Bir Araca Fırlat 🎲'}
            </span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-gray-200/90 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            <span>{isEnglish ? 'Go Back' : 'Geri Dön'}</span>
          </button>
        </motion.div>
      </div>

      {/* ── INTERACTIVE PLAY ZONE: CATCH THE LOST PIXEL ──────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="max-w-2xl mx-auto mb-14"
      >
        <div className="bg-white/85 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          {/* Header of Mini Game */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm">
                <Gamepad2 size={17} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-[14.5px] font-bold text-[#1D1D1F]">
                  {isEnglish ? 'Mini Game: Catch the Lost Pixels!' : 'Mini Oyun: Kayıp Pikselleri Yakala!'}
                </h2>
                <p className="text-[11.5px] text-[#6E6E73]">
                  {isEnglish ? 'Click the bouncing emoji to score points!' : 'Puan toplamak için zıplayan emojiyi yakala!'}
                </p>
              </div>
            </div>

            {/* Scoreboard */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold">
                <Flame size={13} className="text-amber-500" />
                <span>{isEnglish ? 'Score:' : 'Skor:'} {score}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-bold">
                <Trophy size={13} className="text-purple-500" />
                <span>{isEnglish ? 'Best:' : 'En İyi:'} {highScore}</span>
              </div>
              {score > 0 && (
                <button
                  onClick={resetGame}
                  title={isEnglish ? 'Reset Score' : 'Skoru Sıfırla'}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Play Canvas Box */}
          <div className="relative w-full h-44 sm:h-52 bg-gradient-to-b from-gray-50/90 to-white/90 rounded-2xl border border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
            
            {/* Combo Toast Notification */}
            <AnimatePresence>
              {comboMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-3 px-3 py-1 rounded-full bg-black/80 text-white text-xs font-bold shadow-md z-20 pointer-events-none"
                >
                  {comboMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint when score is 0 */}
            {score === 0 && (
              <div className="absolute text-center pointer-events-none opacity-40">
                <div className="text-3xl mb-1">👆</div>
                <div className="text-xs font-semibold text-zinc-600">
                  {isEnglish ? 'Click to catch!' : 'Yakalamak için tıkla!'}
                </div>
              </div>
            )}

            {/* Bouncing Target Character */}
            <motion.button
              onClick={handleCatchPixel}
              style={{
                left: `${targetPos.x}%`,
                top: `${targetPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.75 }}
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute z-10 p-2.5 rounded-2xl bg-white shadow-lg border border-gray-200/80 text-2xl sm:text-3xl cursor-pointer hover:shadow-xl transition-shadow flex items-center justify-center"
            >
              {targetEmoji}
            </motion.button>

            {/* Particle Burst Effects */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: `${targetPos.x}%`,
                  y: `${targetPos.y}%`,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x: `calc(${targetPos.x}% + ${p.x}px)`,
                  y: `calc(${targetPos.y}% + ${p.y}px)`,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                }}
                className="absolute rounded-full pointer-events-none z-30"
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── POPULAR TOOLS DIRECTORY ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-4xl mx-auto pt-6 border-t border-gray-200/70"
      >
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#B896DF]" />
            <h2 className="text-[16px] sm:text-[18px] font-bold text-[#1D1D1F]">
              {isEnglish ? 'Need Actual Work Done? Try These Tools' : 'İşine Geri Dönmek İster Misin? Popüler Araçlar:'}
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
          {popularTools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group relative flex items-start gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-gray-100/90 hover:border-gray-200/90 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
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
