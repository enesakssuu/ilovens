import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Globe2, Download, CheckCircle2,
  Code2, Palette, Sparkles, LayoutTemplate, RefreshCw, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { downloadFile } from '../utils/imageProcessor';

const sampleTemplates = [
  {
    id: 'quote',
    nameTr: 'Alıntı Kartı',
    nameEn: 'Quote Card',
    html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 24px; color: white; font-family: sans-serif; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
  <p style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.4;">"Tasarım sadece nasıl göründüğü değil, nasıl çalıştığıdır."</p>
  <p style="font-size: 16px; opacity: 0.9; margin: 0; font-weight: 500;">— Steve Jobs</p>
</div>`,
  },
  {
    id: 'badge',
    nameTr: 'Ürün Rozeti',
    nameEn: 'Product Badge',
    html: `<div style="background: #ffffff; padding: 32px; border-radius: 20px; border: 1px solid #e4e4e7; font-family: sans-serif; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
  <div style="width: 56px; height: 56px; border-radius: 16px; background: #86B3F0; display: flex; align-items: center; justify-content: center; font-size: 28px;">⚡</div>
  <div>
    <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #323642;">iLoveNS Visual Tools</h3>
    <p style="margin: 4px 0 0 0; font-size: 14px; color: #71717a;">100% Serverless & Ultra Fast Image Processing</p>
  </div>
</div>`,
  },
  {
    id: 'code',
    nameTr: 'Kod Kartı',
    nameEn: 'Code Card',
    html: `<div style="background: #1e1e2e; padding: 30px; border-radius: 20px; color: #cdd6f4; font-family: monospace; font-size: 15px; border: 1px solid #313244; box-shadow: 0 15px 30px rgba(0,0,0,0.3);">
  <div style="display: flex; gap: 8px; margin-bottom: 20px;">
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #f38ba8; display: inline-block;"></span>
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #f9e2af; display: inline-block;"></span>
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #a6e3a1; display: inline-block;"></span>
  </div>
  <pre style="margin: 0; line-height: 1.6;"><span style="color: #cba6f7;">const</span> <span style="color: #89b4fa;">app</span> = <span style="color: #f9e2af;">createApp</span>({
  <span style="color: #89dceb;">name</span>: <span style="color: #a6e3a1;">'iLoveNS'</span>,
  <span style="color: #89dceb;">fast</span>: <span style="color: #fab387;">true</span>
});</pre>
</div>`,
  },
];

export default function HtmlToImageTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [htmlCode, setHtmlCode] = useState(sampleTemplates[0].html);
  const [bgColor, setBgColor] = useState('transparent');
  const [padding, setPadding] = useState(24);
  const [rendering, setRendering] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleRender = useCallback(async () => {
    if (!previewContainerRef.current) return;
    setRendering(true);
    try {
      const canvas = await html2canvas(previewContainerRef.current, {
        backgroundColor: bgColor === 'transparent' ? null : bgColor,
        scale: 2, // High DPI export
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setResultUrl(dataUrl);
    } catch (err) {
      console.error('HTML to Image rendering failed:', err);
    } finally {
      setRendering(false);
    }
  }, [bgColor]);

  const handleDownload = () => {
    if (!resultUrl) return;
    downloadFile(resultUrl, 'html_render.png');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link
        to={basePath || '/'}
        className="inline-flex items-center gap-1.5 text-apple-secondary hover:text-apple-text text-sm font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        {isEnglish ? 'All Tools' : 'Tüm Araçlar'}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-11 h-11 bg-teal-600 rounded-2xl flex items-center justify-center text-white"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <Globe2 size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-text">
            {isEnglish ? 'HTML → Image Generator' : 'HTML → Görsel Dönüştürücü'}
          </h1>
          <p className="text-apple-secondary text-sm">
            {isEnglish
              ? 'Render custom HTML/CSS snippets into crisp PNG images instantly in browser.'
              : 'Özel HTML ve CSS şablonlarını doğrudan tarayıcınızda yüksek kaliteli PNG görsele dönüştürün.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: HTML Editor & Templates */}
        <div className="lg:col-span-6 space-y-5">
          {/* Templates */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <LayoutTemplate size={14} />
              {isEnglish ? 'Quick Templates' : 'Hızlı Şablonlar'}
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    setHtmlCode(tmpl.html);
                    setResultUrl(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="text-brand-purple" />
                  {isEnglish ? tmpl.nameEn : tmpl.nameTr}
                </button>
              ))}
            </div>
          </div>

          {/* Code Area */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <Code2 size={14} />
                {isEnglish ? 'HTML / CSS Code' : 'HTML / CSS Kodu'}
              </span>
            </div>
            <textarea
              value={htmlCode}
              onChange={(e) => {
                setHtmlCode(e.target.value);
                setResultUrl(null);
              }}
              rows={10}
              className="w-full font-mono text-xs p-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-zinc-900 text-zinc-100 resize-none leading-relaxed"
              placeholder="<div>HTML code here...</div>"
            />
          </div>

          {/* Controls */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <Palette size={14} />
              {isEnglish ? 'Export Settings' : 'Dışa Aktarma Ayarları'}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1.5">
                  {isEnglish ? 'Background' : 'Arka Plan'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  />
                  <button
                    onClick={() => setBgColor('transparent')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      bgColor === 'transparent'
                        ? 'border-brand-purple text-brand-purple bg-purple-50'
                        : 'border-zinc-200 text-zinc-600'
                    }`}
                  >
                    {isEnglish ? 'Transparent' : 'Şeffaf'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1.5">
                  {isEnglish ? 'Padding (px)' : 'İç Boşluk (px)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
            </div>

            <button
              onClick={handleRender}
              disabled={rendering}
              className="w-full btn-primary py-3 font-semibold text-sm flex items-center justify-center gap-2"
            >
              {rendering ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isEnglish ? 'Rendering Image...' : 'Görsel Oluşturuluyor...'}
                </>
              ) : (
                <>
                  <RefreshCw size={16} strokeWidth={2} />
                  {isEnglish ? 'Generate Image' : 'Görseli Oluştur'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Render & Export Preview */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-card p-5 space-y-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              {isEnglish ? 'Live Preview & Canvas' : 'Canlı Önizleme & Tuval'}
            </span>

            {/* DOM Container to render */}
            <div className="overflow-x-auto rounded-2xl border border-dashed border-zinc-300 p-4 bg-zinc-50/50 flex justify-center items-center min-h-[300px]">
              <div
                ref={previewContainerRef}
                style={{
                  padding: `${padding}px`,
                  backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
                  borderRadius: '16px',
                  display: 'inline-block',
                  maxWidth: '100%',
                }}
                dangerouslySetInnerHTML={{ __html: htmlCode }}
              />
            </div>

            <AnimatePresence>
              {resultUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t border-zinc-100 space-y-4"
                >
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={16} />
                    {isEnglish ? 'Render Successful!' : 'Görsel Başarıyla Oluşturuldu!'}
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Download size={16} strokeWidth={2} />
                    {isEnglish ? 'Download PNG Image' : 'PNG Görseli İndir'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
