import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Code2, Download, CheckCircle2 } from 'lucide-react';
import { downloadFile } from '../utils/imageProcessor';

function optimizeSvg(svgText: string): { result: string; originalSize: number; newSize: number } {
  const originalSize = new Blob([svgText]).size;

  let result = svgText;
  // Remove XML declaration
  result = result.replace(/<\?xml[^?]*\?>\s*/g, '');
  // Remove comments
  result = result.replace(/<!--[\s\S]*?-->/g, '');
  // Remove metadata tags
  result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  // Remove empty style attributes
  result = result.replace(/\s+style=""/g, '');
  // Remove editor-specific attributes (Inkscape, Sodipodi, Adobe)
  result = result.replace(/\s+inkscape:[^=]+="[^"]*"/g, '');
  result = result.replace(/\s+sodipodi:[^=]+="[^"]*"/g, '');
  result = result.replace(/\s+dc:[^=]+="[^"]*"/g, '');
  result = result.replace(/\s+cc:[^=]+="[^"]*"/g, '');
  result = result.replace(/\s+rdf:[^=]+="[^"]*"/g, '');
  result = result.replace(/\s+xmlns:inkscape="[^"]*"/g, '');
  result = result.replace(/\s+xmlns:sodipodi="[^"]*"/g, '');
  result = result.replace(/\s+xmlns:dc="[^"]*"/g, '');
  result = result.replace(/\s+xmlns:cc="[^"]*"/g, '');
  result = result.replace(/\s+xmlns:rdf="[^"]*"/g, '');
  // Remove id attributes (optional but common)
  // Collapse whitespace
  result = result.replace(/\s{2,}/g, ' ').replace(/>\s+</g, '><').trim();

  const newSize = new Blob([result]).size;
  return { result, originalSize, newSize };
}

export default function SvgOptimizeTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [svgContent, setSvgContent] = useState('');
  const [result, setResult] = useState<{ result: string; originalSize: number; newSize: number } | null>(null);
  const [fileName, setFileName] = useState('optimized.svg');

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name.replace('.svg', '_optimized.svg'));
    const reader = new FileReader();
    reader.onload = (ev) => setSvgContent(ev.target?.result as string);
    reader.readAsText(f);
    e.target.value = '';
  }, []);

  const handleOptimize = () => {
    if (!svgContent.trim()) return;
    const res = optimizeSvg(svgContent);
    setResult(res);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.result], { type: 'image/svg+xml' });
    downloadFile(blob, fileName);
  };

  const savingsPct = result
    ? Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to={basePath || '/'} className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors">
        <ArrowLeft size={15} strokeWidth={1.75} />{isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-lime-600 rounded-2xl flex items-center justify-center text-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Code2 size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">SVG Optimizer</h1>
          <p className="text-apple-secondary text-sm">{isEnglish ? 'Remove unnecessary metadata, comments, and editor artifacts.' : 'Gereksiz meta verileri, yorumları ve editör kalıntılarını temizle.'}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.6)' }}>
        {/* File upload */}
        <label className="flex flex-col items-center justify-center w-full min-h-[120px] rounded-2xl cursor-pointer border-2 border-dashed border-apple-divider hover:border-lime-400 hover:bg-lime-50/30 transition-all duration-200">
          <Code2 size={24} className="text-apple-secondary mb-2" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-apple-text">{isEnglish ? 'Upload SVG File' : 'SVG Dosyası Yükle'}</span>
          <span className="text-xs text-apple-secondary mt-1">{isEnglish ? 'or paste code below' : 'ya da aşağıya kodu yapıştır'}</span>
          <input type="file" accept=".svg,image/svg+xml" className="hidden" onChange={handleFile} />
        </label>

        <div>
          <label className="label-text">{isEnglish ? 'SVG Code' : 'SVG Kodu'}</label>
          <textarea
            value={svgContent}
            onChange={(e) => setSvgContent(e.target.value)}
            placeholder={isEnglish ? 'Paste your SVG code here...' : 'SVG kodunuzu buraya yapıştırın...'}
            rows={8}
            className="input-field font-mono text-xs resize-y min-h-[120px]"
            style={{ fontFamily: '"SF Mono", "Fira Code", monospace' }}
          />
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleOptimize} disabled={!svgContent.trim()}
          className="btn-primary w-full py-3" style={{ background: '#65a30d' }}>
          <Code2 size={16} strokeWidth={1.75} />{isEnglish ? 'Optimize SVG' : 'SVG Optimize Et'}
        </motion.button>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 space-y-4" style={{ background: 'rgba(247,254,231,0.9)', border: '1px solid rgba(101,163,13,0.2)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-lime-600" strokeWidth={1.75} /><span className="font-semibold text-sm text-lime-800">{isEnglish ? 'Optimized!' : 'Optimize edildi!'}</span></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white/70 rounded-2xl">
                  <p className="text-[10px] text-apple-secondary mb-0.5">{isEnglish ? 'Original' : 'Orijinal'}</p>
                  <p className="text-sm font-bold text-apple-text">{(result.originalSize / 1024).toFixed(1)} KB</p>
                </div>
                <div className="text-center p-3 bg-white/70 rounded-2xl">
                  <p className="text-[10px] text-apple-secondary mb-0.5">{isEnglish ? 'Optimized' : 'Optimize'}</p>
                  <p className="text-sm font-bold text-lime-600">{(result.newSize / 1024).toFixed(1)} KB</p>
                </div>
                <div className="text-center p-3 bg-lime-600 rounded-2xl">
                  <p className="text-[10px] text-lime-100 mb-0.5">{isEnglish ? 'Saved' : 'Tasarruf'}</p>
                  <p className="text-sm font-bold text-white">{savingsPct}%</p>
                </div>
              </div>
              <textarea readOnly value={result.result} rows={5}
                className="input-field font-mono text-xs resize-y" style={{ fontFamily: '"SF Mono", monospace' }} />
              <button onClick={handleDownload} className="btn-primary w-full" style={{ background: '#65a30d' }}>
                <Download size={16} strokeWidth={1.75} />{isEnglish ? 'Download Optimized SVG' : 'Optimize SVG İndir'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
