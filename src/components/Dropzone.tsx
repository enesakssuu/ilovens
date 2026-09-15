import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Upload, ImageIcon, X } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  accept?: string;
}

export default function Dropzone({
  onFileSelect,
  selectedFile,
  accept = 'image/*',
}: DropzoneProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      onFileSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input value so the same file can be re-selected
      e.target.value = '';
    },
    [handleFile]
  );

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null as unknown as File);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedFile && preview ? (
          // ── Preview state ─────────────────────────────────────────
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative w-full rounded-3xl overflow-hidden border border-apple-divider shadow-apple-md bg-white"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-72 object-contain bg-[#F5F5F7]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ImageIcon size={16} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-xs font-semibold truncate max-w-[180px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-white/70 text-xs">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center transition-all"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Change file overlay */}
            <label className="absolute top-3 right-3 cursor-pointer">
              <span className="flex items-center gap-1.5 bg-white/85 backdrop-blur-sm text-apple-text text-xs font-semibold px-3 py-1.5 rounded-xl shadow-apple-sm hover:bg-white transition-all duration-200">
                <Upload size={12} />
                {t('dropzone.change')}
              </span>
              <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={onInputChange}
              />
            </label>
          </motion.div>
        ) : (
          // ── Empty / Drag state ────────────────────────────────────
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <label
              htmlFor="dropzone-input"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`
                flex flex-col items-center justify-center
                w-full min-h-[240px] rounded-3xl cursor-pointer
                border-2 border-dashed transition-all duration-300
                ${
                  isDragging
                    ? 'border-apple-blue bg-blue-50 scale-[1.01]'
                    : 'border-apple-border bg-white hover:border-apple-blue/50 hover:bg-apple-bg/50'
                }
              `}
            >
              <motion.div
                animate={isDragging ? { scale: 1.15, y: -6 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-4 py-10 px-8 text-center"
              >
                <div
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isDragging
                      ? 'bg-apple-blue text-white shadow-blue-glow'
                      : 'bg-apple-bg text-apple-secondary'
                    }
                  `}
                >
                  <Upload size={28} />
                </div>

                <div className="space-y-1.5">
                  <p
                    className={`text-lg font-bold tracking-tight transition-colors duration-200 ${
                      isDragging ? 'text-apple-blue' : 'text-apple-text'
                    }`}
                  >
                    {isDragging ? t('dropzone.dragging') : t('dropzone.title')}
                  </p>
                  {!isDragging && (
                    <>
                      <p className="text-apple-secondary text-sm">
                        {t('dropzone.subtitle')}
                      </p>
                      <p className="text-apple-secondary/60 text-xs mt-1">
                        {t('dropzone.hint')}
                      </p>
                    </>
                  )}
                </div>

                {!isDragging && (
                  <div className="flex items-center gap-2">
                    <span className="bg-apple-blue text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-apple-sm hover:bg-apple-blueHover transition-all duration-200">
                      {t('dropzone.subtitle').includes('tıkla') || t('dropzone.subtitle').includes('click')
                        ? (t('dropzone.subtitle').includes('tıkla') ? 'Dosya Seç' : 'Browse File')
                        : 'Dosya Seç'}
                    </span>
                  </div>
                )}
              </motion.div>
            </label>
            <input
              id="dropzone-input"
              type="file"
              accept={accept}
              className="hidden"
              onChange={onInputChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
