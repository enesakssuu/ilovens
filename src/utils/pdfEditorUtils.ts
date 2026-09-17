import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface AnnotationItem {
  id: string;
  type: 'text' | 'draw' | 'highlighter' | 'redact' | 'rect' | 'circle' | 'line' | 'arrow' | 'image';
  pageIndex: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fillColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  strokeWidth?: number;
  opacity?: number;
  points?: { x: number; y: number }[];
  imageDataUrl?: string;
}

export interface PageInfo {
  pageIndex: number;
  pageNumber: number;
  originalWidth: number;
  originalHeight: number;
  rotation: number;
  deleted: boolean;
  thumbnailUrl?: string;
}

export interface PdfDocumentState {
  numPages: number;
  pages: PageInfo[];
  pdfBytes: ArrayBuffer;
  fileName: string;
}

/**
 * Load PDF file and parse page dimensions and generate page list
 */
export async function loadPdfDocument(file: File): Promise<{
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  state: PdfDocumentState;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const bufferCopy = arrayBuffer.slice(0);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const pages: PageInfo[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    pages.push({
      pageIndex: i - 1,
      pageNumber: i,
      originalWidth: viewport.width,
      originalHeight: viewport.height,
      rotation: 0,
      deleted: false,
    });
  }

  return {
    pdfDoc: pdf,
    state: {
      numPages: pdf.numPages,
      pages,
      pdfBytes: bufferCopy,
      fileName: file.name,
    },
  };
}

/**
 * Render a single PDF page to a canvas
 */
export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5,
  rotation: number = 0
): Promise<void> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale, rotation });

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;
}

/**
 * Render PDF text layer for selecting, searching, and copying native text
 */
export async function renderPdfTextLayer(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  container: HTMLDivElement,
  scale: number = 1.5,
  rotation: number = 0
): Promise<void> {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale, rotation });

    container.innerHTML = '';
    container.style.width = `${viewport.width}px`;
    container.style.height = `${viewport.height}px`;

    const textContent = await page.getTextContent();
    const textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: container,
      viewport: viewport,
    });

    await textLayer.render();
  } catch (err) {
    console.error('Error rendering text layer:', err);
  }
}

/**
 * Render an annotation overlay to a high-resolution PNG data URL for a specific page
 */
export function renderAnnotationsToDataUrl(
  annotations: AnnotationItem[],
  width: number,
  height: number
): string | null {
  if (annotations.length === 0) return null;

  const canvas = document.createElement('canvas');
  const exportScale = 2.0;
  canvas.width = width * exportScale;
  canvas.height = height * exportScale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(exportScale, exportScale);

  for (const item of annotations) {
    ctx.save();

    if (item.type === 'draw' || item.type === 'highlighter') {
      if (!item.points || item.points.length < 2) {
        ctx.restore();
        continue;
      }
      ctx.beginPath();
      ctx.strokeStyle = item.color || '#000000';
      ctx.lineWidth = item.strokeWidth || (item.type === 'highlighter' ? 18 : 3);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = item.opacity ?? (item.type === 'highlighter' ? 0.35 : 1.0);

      const pts = item.points;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    } else if (item.type === 'redact') {
      ctx.fillStyle = item.color || '#000000';
      ctx.globalAlpha = item.opacity ?? 1.0;
      ctx.fillRect(item.x, item.y, item.width || 100, item.height || 30);
    } else if (item.type === 'rect') {
      ctx.strokeStyle = item.color || '#000000';
      ctx.lineWidth = item.strokeWidth || 2;
      ctx.globalAlpha = item.opacity ?? 1.0;
      if (item.fillColor && item.fillColor !== 'transparent') {
        ctx.fillStyle = item.fillColor;
        ctx.fillRect(item.x, item.y, item.width || 100, item.height || 60);
      }
      ctx.strokeRect(item.x, item.y, item.width || 100, item.height || 60);
    } else if (item.type === 'circle') {
      ctx.strokeStyle = item.color || '#000000';
      ctx.lineWidth = item.strokeWidth || 2;
      ctx.globalAlpha = item.opacity ?? 1.0;
      const w = item.width || 60;
      const h = item.height || 60;
      ctx.beginPath();
      ctx.ellipse(item.x + w / 2, item.y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * Math.PI);
      if (item.fillColor && item.fillColor !== 'transparent') {
        ctx.fillStyle = item.fillColor;
        ctx.fill();
      }
      ctx.stroke();
    } else if (item.type === 'line' || item.type === 'arrow') {
      if (!item.points || item.points.length < 2) {
        ctx.restore();
        continue;
      }
      const p1 = item.points[0];
      const p2 = item.points[item.points.length - 1];
      ctx.strokeStyle = item.color || '#000000';
      ctx.lineWidth = item.strokeWidth || 3;
      ctx.lineCap = 'round';
      ctx.globalAlpha = item.opacity ?? 1.0;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      if (item.type === 'arrow') {
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const headLen = Math.max(12, (item.strokeWidth || 3) * 3.5);
        ctx.beginPath();
        ctx.fillStyle = item.color || '#000000';
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(
          p2.x - headLen * Math.cos(angle - Math.PI / 6),
          p2.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          p2.x - headLen * Math.cos(angle + Math.PI / 6),
          p2.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    } else if (item.type === 'text') {
      ctx.font = `${item.isItalic ? 'italic ' : ''}${item.isBold ? 'bold ' : ''}${item.fontSize || 16}px ${
        item.fontFamily || 'sans-serif'
      }`;
      ctx.fillStyle = item.color || '#000000';
      ctx.globalAlpha = item.opacity ?? 1.0;

      if (item.fillColor && item.fillColor !== 'transparent') {
        const metrics = ctx.measureText(item.text || '');
        const pad = 4;
        ctx.fillStyle = item.fillColor;
        ctx.fillRect(
          item.x - pad,
          item.y - (item.fontSize || 16) - pad,
          metrics.width + pad * 2,
          (item.fontSize || 16) * 1.3 + pad * 2
        );
        ctx.fillStyle = item.color || '#000000';
      }

      ctx.fillText(item.text || '', item.x, item.y);
    } else if (item.type === 'image' && item.imageDataUrl) {
      const img = new Image();
      img.src = item.imageDataUrl;
      if (img.complete) {
        ctx.globalAlpha = item.opacity ?? 1.0;
        ctx.drawImage(img, item.x, item.y, item.width || 120, item.height || 80);
      }
    }

    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

/**
 * Export modified PDF with pdf-lib preserving rotations, deletions, and applying all overlays.
 */
export async function exportEditedPdf(
  originalPdfBytes: ArrayBuffer,
  pages: PageInfo[],
  annotationsByPage: Record<number, AnnotationItem[]>,
  watermarkText?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const totalOriginalPages = pdfDoc.getPageCount();

  // 1. Process deletions (delete backwards so indices don't shift)
  for (let i = totalOriginalPages - 1; i >= 0; i--) {
    const pageInfo = pages.find((p) => p.pageIndex === i);
    if (pageInfo && pageInfo.deleted) {
      pdfDoc.removePage(i);
    }
  }

  const activePages = pages.filter((p) => !p.deleted);
  const remainingPdfPages = pdfDoc.getPages();

  // 2. Process rotations and overlays
  for (let idx = 0; idx < activePages.length; idx++) {
    const pageInfo = activePages[idx];
    const pdfPage = remainingPdfPages[idx];
    if (!pdfPage) continue;

    if (pageInfo.rotation !== 0) {
      const currentRot = pdfPage.getRotation().angle;
      pdfPage.setRotation(degrees((currentRot + pageInfo.rotation) % 360));
    }

    const { width: pWidth, height: pHeight } = pdfPage.getSize();
    const pageAnnotations = annotationsByPage[pageInfo.pageIndex] || [];

    if (pageAnnotations.length > 0) {
      const overlayDataUrl = renderAnnotationsToDataUrl(
        pageAnnotations,
        pageInfo.originalWidth,
        pageInfo.originalHeight
      );

      if (overlayDataUrl) {
        const pngImageBytes = await fetch(overlayDataUrl).then((res) => res.arrayBuffer());
        const embeddedPng = await pdfDoc.embedPng(pngImageBytes);

        pdfPage.drawImage(embeddedPng, {
          x: 0,
          y: 0,
          width: pWidth,
          height: pHeight,
        });
      }
    }

    if (watermarkText && watermarkText.trim().length > 0) {
      const { width, height } = pdfPage.getSize();
      pdfPage.drawText(watermarkText.trim(), {
        x: width * 0.2,
        y: height * 0.45,
        size: Math.max(24, Math.min(width, height) / 12),
        rotate: degrees(45),
        opacity: 0.18,
      });
    }
  }

  return await pdfDoc.save();
}
