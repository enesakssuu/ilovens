import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Palette, Copy, Check } from 'lucide-react';
import Dropzone from '../components/Dropzone';

interface ColorSwatch {
  hex: string;
  rgb: [number, number, number];
  count: number;
}

function extractColors(imgData: ImageData, numColors = 8): ColorSwatch[] {
  const data = imgData.data;
  const colorMap = new Map<string, { rgb: [number, number, number]; count: number }>();

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const a = data[i + 3];
    if (a < 128) continue; // skip transparent

    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);
    if (existing) existing.count++;
    else colorMap.set(key, { rgb: [r, g, b], count: 1 });
  }

  const sorted = [...colorMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, numColors * 4);

  // Deduplicate similar colors
  const result: ColorSwatch[] = [];
  for (const [, val] of sorted) {
    const [r, g, b] = val.rgb;
    const isSimilar = result.some(c => {
      return Math.abs(c.rgb[0] - r) < 48 && Math.abs(c.rgb[1] - g) < 48 && Math.abs(c.rgb[2] - b) < 48;
    });
    if (!isSimilar) {
      const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
      result.push({ hex, rgb: [r, g, b], count: val.count });
    }
    if (result.length >= numColors) break;
  }
  return result;
}

export default function ColorPaletteTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [file, setFile] = useState<File | null>(null);
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleFileSelect = async (f: File) => {
    setFile(f);
    setColors([]);
    setProcessing(true);
    try {
      const reader = new FileReader();
      const imgSrc: string = await new Promise((res) => {
        reader.onload = (e) => res(e.target?.result as string);
        reader.readAsDataURL(f);
      });
      const img = new Image();
      img.src = imgSrc;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const canvas = document.createElement('canvas');
      const maxSize = 200;
      const ratio = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight);
      canvas.width = Math.round(img.naturalWidth * ratio);
      canvas.height = Math.round(img.naturalHeight * ratio);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const palette = extractColors(imageData, 8);
      setColors(palette);
    } finally { setProcessing(false); }
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  const getLuminance = ([r, g, b]: [number, number, number]) =>
    0.299 * r + 0.587 * g + 0.114 * b;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />{isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Palette size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">{isEnglish ? 'Color Palette Extractor' : 'Renk Paleti Çıkarıcı'}</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Extract dominant HEX & RGB colors from any image.' : 'Görseldeki baskın HEX ve RGB renk kodlarını çıkar.'}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

        {processing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <span className="animate-spin inline-block w-5 h-5 border-2 border-pink-200 border-t-pink-500 rounded-full" />
            <span className="text-sm text-apple-secondary">{isEnglish ? 'Analyzing colors...' : 'Renkler analiz ediliyor...'}</span>
          </div>
        )}

        <AnimatePresence>
          {colors.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Large swatches */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {colors.map((c, i) => (
                  <motion.button
                    key={c.hex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => copyHex(c.hex)}
                    className="relative aspect-square rounded-2xl cursor-pointer hover:scale-110 transition-all duration-200 group"
                    style={{ background: c.hex, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                    title={c.hex}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {copied === c.hex
                        ? <Check size={14} strokeWidth={2.5} style={{ color: getLuminance(c.rgb) > 128 ? '#000' : '#fff' }} />
                        : <Copy size={12} strokeWidth={2.5} style={{ color: getLuminance(c.rgb) > 128 ? '#000' : '#fff' }} />
                      }
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Detailed list */}
              <div className="space-y-2">
                {colors.map((c, i) => (
                  <motion.div
                    key={c.hex}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 + 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 transition-all cursor-pointer group"
                    onClick={() => copyHex(c.hex)}
                  >
                    <div className="w-8 h-8 rounded-xl flex-shrink-0" style={{ background: c.hex, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-apple-text uppercase tracking-wide">{c.hex}</p>
                      <p className="text-xs text-apple-secondary">rgb({c.rgb.join(', ')})</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-black/5">
                      {copied === c.hex ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-apple-secondary" />}
                    </button>
                  </motion.div>
                ))}
              </div>

              <p className="text-[11px] text-apple-secondary text-center">{isEnglish ? 'Click any color to copy HEX code' : 'HEX kodu kopyalamak için renke tıkla'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
