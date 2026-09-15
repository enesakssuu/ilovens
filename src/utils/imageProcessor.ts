/**
 * imageProcessor.ts
 * Pure client-side image processing engine using HTML5 Canvas API.
 * No backend, no third-party processing services. Everything runs in the browser.
 */

/** Load a File into an HTMLImageElement. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

/** Convert a dataURL to a File object. */
function dataURLtoFile(dataUrl: string, fileName: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}

/** Strip existing extension and append new one. */
function replaceExtension(fileName: string, newExt: string): string {
  const base = fileName.replace(/\.[^.]+$/, '');
  return `${base}.${newExt}`;
}

// ─────────────────────────────────────────────────────────────
// 1. COMPRESS
// ─────────────────────────────────────────────────────────────
/**
 * Compress an image using JPEG quality encoding.
 * @param file   - Source image file (any format).
 * @param quality - 0.0 (worst) to 1.0 (best). Default 0.8.
 * @returns A new File with reduced size.
 */
export async function compressImage(file: File, quality = 0.8): Promise<File> {
  const img = await loadImage(file);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0);

  // Always output as JPEG for maximum compression benefit.
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const outputName = replaceExtension(file.name, 'jpg');
  return dataURLtoFile(dataUrl, outputName);
}

// ─────────────────────────────────────────────────────────────
// 2. RESIZE
// ─────────────────────────────────────────────────────────────
/**
 * Resize an image to exact pixel dimensions.
 * @param file   - Source image file.
 * @param width  - Target width in pixels.
 * @param height - Target height in pixels.
 * @returns A new File at the specified dimensions.
 */
export async function resizeImage(
  file: File,
  width: number,
  height: number
): Promise<File> {
  const img = await loadImage(file);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Use high-quality image smoothing.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const dataUrl = canvas.toDataURL(mimeType, 0.92);
  return dataURLtoFile(dataUrl, replaceExtension(file.name, ext));
}

// ─────────────────────────────────────────────────────────────
// 3. CONVERT
// ─────────────────────────────────────────────────────────────
export type ImageFormat = 'jpeg' | 'png' | 'webp';

/**
 * Convert an image to a different format.
 * @param file   - Source image file.
 * @param format - Target format: 'jpeg' | 'png' | 'webp'.
 * @returns A new File in the requested format.
 */
export async function convertImage(file: File, format: ImageFormat): Promise<File> {
  const img = await loadImage(file);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // For JPEG, fill background white (JPEG doesn't support transparency).
  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeMap: Record<ImageFormat, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  const extMap: Record<ImageFormat, string> = {
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
  };

  const mime = mimeMap[format];
  const ext = extMap[format];
  const quality = format === 'png' ? undefined : 0.92;
  const dataUrl = canvas.toDataURL(mime, quality);
  return dataURLtoFile(dataUrl, replaceExtension(file.name, ext));
}

// ─────────────────────────────────────────────────────────────
// 4. WATERMARK
// ─────────────────────────────────────────────────────────────
export type WatermarkPosition =
  | 'bottomRight'
  | 'bottomLeft'
  | 'topRight'
  | 'topLeft'
  | 'center';

/**
 * Stamp a semi-transparent text watermark onto an image.
 * @param file     - Source image file.
 * @param text     - Watermark text.
 * @param position - Where to place the watermark.
 * @returns A new File with the watermark burned in.
 */
export async function watermarkImage(
  file: File,
  text: string,
  position: WatermarkPosition = 'bottomRight'
): Promise<File> {
  const img = await loadImage(file);

  const canvas = document.createElement('canvas');
  const { naturalWidth: w, naturalHeight: h } = img;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0);

  // Dynamic font size: ~3% of the shorter dimension, min 16px.
  const fontSize = Math.max(16, Math.round(Math.min(w, h) * 0.04));
  ctx.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;

  const padding = Math.round(fontSize * 1.2);
  const textMetrics = ctx.measureText(text);
  const textW = textMetrics.width;
  const textH = fontSize;

  // Compute (x, y) for the bottom-left corner of the text block.
  type XY = { x: number; y: number };
  const positions: Record<WatermarkPosition, XY> = {
    bottomRight: { x: w - textW - padding, y: h - padding },
    bottomLeft:  { x: padding, y: h - padding },
    topRight:    { x: w - textW - padding, y: textH + padding },
    topLeft:     { x: padding, y: textH + padding },
    center:      { x: (w - textW) / 2, y: (h + textH) / 2 },
  };

  const { x, y } = positions[position];

  // Semi-transparent dark shadow for legibility on any background.
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000000';
  ctx.fillText(text, x + 2, y + 2);
  ctx.restore();

  // Main white text at 60% opacity.
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
  ctx.restore();

  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const dataUrl = canvas.toDataURL(mimeType, 0.92);
  return dataURLtoFile(dataUrl, replaceExtension(file.name, `watermarked.${ext}`));
}

// ─────────────────────────────────────────────────────────────
// HELPERS (exported for UI use)
// ─────────────────────────────────────────────────────────────

/** Format bytes into human-readable string (KB / MB). */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Calculate savings percentage. */
export function savingsPercent(original: number, compressed: number): string {
  if (original === 0) return '0%';
  const pct = ((original - compressed) / original) * 100;
  return `${pct.toFixed(1)}%`;
}

/** Get image natural dimensions from a File. */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Helper to convert Data URL (base64) to a Blob object for reliable cross-browser downloading.
 */
function dataURLToBlob(dataUrl: string): Blob {
  try {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch {
    return new Blob([], { type: 'image/jpeg' });
  }
}

/**
 * Universal browser download trigger with guaranteed filename preservation.
 */
export function downloadFile(
  source: string | Blob | File,
  suggestedName: string
): void {
  let fileName = suggestedName || 'image_processed.jpg';
  // Clean up any double extension issues or missing extension
  fileName = fileName.replace(/[/\\?%*:|"<>]/g, '_');
  if (!/\.[a-zA-Z0-9]+$/.test(fileName)) {
    fileName += '.jpg';
  }

  let blobToDownload: Blob | null = null;
  let directUrl: string | null = null;

  if (typeof source === 'string') {
    if (source.startsWith('data:')) {
      blobToDownload = dataURLToBlob(source);
    } else {
      directUrl = source;
    }
  } else {
    blobToDownload = source;
  }

  const a = document.createElement('a');
  a.style.display = 'none';

  let objectUrl: string | null = null;
  if (blobToDownload) {
    objectUrl = URL.createObjectURL(blobToDownload);
    a.href = objectUrl;
  } else if (directUrl) {
    a.href = directUrl;
  }

  a.setAttribute('download', fileName);
  a.download = fileName;
  a.rel = 'noopener';

  document.body.appendChild(a);

  // Dispatch click event for standard link trigger
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  a.dispatchEvent(clickEvent);

  // Keep object URL alive for 60 seconds to prevent early memory revocation
  // before browser download manager finishes saving file on disk
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }, 60000);
}
