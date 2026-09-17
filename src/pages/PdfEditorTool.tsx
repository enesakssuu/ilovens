import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, FileText, Download, RotateCw, Trash2,
  ZoomIn, ZoomOut, Undo2, Redo2, Type, Pen, Highlighter,
  Square, Circle, ArrowUpRight, ShieldAlert, ImagePlus,
  Stamp, Eye, Check, ChevronLeft, ChevronRight, Upload,
  RefreshCw, Layers
} from 'lucide-react';
import {
  loadPdfDocument,
  renderPdfPageToCanvas,
  exportEditedPdf,
} from '../utils/pdfEditorUtils';
import type {
  AnnotationItem,
  PdfDocumentState,
} from '../utils/pdfEditorUtils';
import { downloadFile } from '../utils/imageProcessor';
import { trackEvent } from '../utils/analytics';
import type * as pdfjsLib from 'pdfjs-dist';

type ToolType = 'select' | 'text' | 'pen' | 'highlighter' | 'redact' | 'rect' | 'circle' | 'arrow';

const COLOR_PALETTE = [
  '#000000', // Black
  '#dc2626', // Red
  '#2563eb', // Blue
  '#16a34a', // Green
  '#ca8a04', // Amber/Yellow
  '#9333ea', // Purple
  '#ffffff', // White
];

const HIGHLIGHTER_COLORS = [
  '#facc15', // Yellow
  '#4ade80', // Green
  '#60a5fa', // Blue
  '#f472b6', // Pink
  '#c084fc', // Purple
];

export default function PdfEditorTool() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  useEffect(() => {
    trackEvent({ type: 'pageview', toolId: 'pdf-editor', toolName: 'PDF Düzenleyici' });
  }, []);

  // PDF Document State
  const [file, setFile] = useState<File | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfState, setPdfState] = useState<PdfDocumentState | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1.2);

  // Tool & Styling State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [color, setColor] = useState<string>('#dc2626');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(18);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [textFill, setTextFill] = useState<string>('transparent');
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [showWatermarkModal, setShowWatermarkModal] = useState<boolean>(false);

  // Annotations State (pageIndex -> list of items)
  const [annotations, setAnnotations] = useState<Record<number, AnnotationItem[]>>({});
  // History for Undo / Redo
  const [history, setHistory] = useState<Record<number, AnnotationItem[]>[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Current drawing/interaction state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Text input modal/inline state
  const [textInputState, setTextInputState] = useState<{
    x: number;
    y: number;
    text: string;
    isOpen: boolean;
  } | null>(null);

  // Canvases
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Record history when annotations change
  const pushToHistory = useCallback((newAnnotations: Record<number, AnnotationItem[]>) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIdx + 1);
      return [...sliced, JSON.parse(JSON.stringify(newAnnotations))];
    });
    setHistoryIdx((prev) => prev + 1);
  }, [historyIdx]);

  const undo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setAnnotations(JSON.parse(JSON.stringify(prev)));
      setHistoryIdx((idx) => idx - 1);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setAnnotations(JSON.parse(JSON.stringify(next)));
      setHistoryIdx((idx) => idx + 1);
    }
  };

  // Handle PDF file selection
  const handleFileSelect = async (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      alert(isEnglish ? 'Please upload a valid PDF document.' : 'Lütfen geçerli bir PDF belgesi yükleyin.');
      return;
    }

    setLoading(true);
    setFile(f);
    setAnnotations({});
    setHistory([]);
    setHistoryIdx(-1);
    setCurrentPageIndex(0);

    try {
      const { pdfDoc, state } = await loadPdfDocument(f);
      setPdfProxy(pdfDoc);
      setPdfState(state);
      setHistory([{}]);
      setHistoryIdx(0);

      trackEvent({
        type: 'tool_use',
        toolId: 'pdf-editor',
        toolName: 'PDF Düzenleyici',
        fileSizeBefore: f.size,
      });
    } catch (err) {
      console.error('PDF Load Error:', err);
      alert(isEnglish ? 'Failed to read PDF file. Please try another file.' : 'PDF dosyası okunamadı. Lütfen başka bir dosya deneyin.');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  // Render current page to Base Canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfProxy || !pdfState || !baseCanvasRef.current) return;
    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo || pageInfo.deleted) return;

    try {
      await renderPdfPageToCanvas(
        pdfProxy,
        pageInfo.pageNumber,
        baseCanvasRef.current,
        zoomScale,
        pageInfo.rotation
      );
    } catch (err) {
      console.error('Page render error:', err);
    }
  }, [pdfProxy, pdfState, currentPageIndex, zoomScale]);

  // Redraw Overlay Canvas (annotations, active selection, dynamic preview)
  const drawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !pdfState) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo) return;

    // Match overlay dimensions to base canvas
    if (baseCanvasRef.current) {
      canvas.width = baseCanvasRef.current.width;
      canvas.height = baseCanvasRef.current.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factor relative to unscaled original page dimensions
    const currentScale = canvas.width / pageInfo.originalWidth;

    const pageAnnotations = annotations[currentPageIndex] || [];

    // Render stored annotations
    for (const item of pageAnnotations) {
      ctx.save();
      const isSelected = item.id === selectedAnnotationId;

      if (item.type === 'draw' || item.type === 'highlighter') {
        if (item.points && item.points.length >= 2) {
          ctx.beginPath();
          ctx.strokeStyle = item.color || '#000000';
          ctx.lineWidth = (item.strokeWidth || 3) * currentScale;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = item.opacity ?? (item.type === 'highlighter' ? 0.35 : 1.0);

          const pts = item.points;
          ctx.moveTo(pts[0].x * currentScale, pts[0].y * currentScale);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x * currentScale, pts[i].y * currentScale);
          }
          ctx.stroke();
        }
      } else if (item.type === 'redact') {
        ctx.fillStyle = item.color || '#000000';
        ctx.globalAlpha = item.opacity ?? 1.0;
        ctx.fillRect(
          item.x * currentScale,
          item.y * currentScale,
          (item.width || 100) * currentScale,
          (item.height || 30) * currentScale
        );
      } else if (item.type === 'rect') {
        ctx.strokeStyle = item.color || '#000000';
        ctx.lineWidth = (item.strokeWidth || 2) * currentScale;
        ctx.globalAlpha = item.opacity ?? 1.0;
        if (item.fillColor && item.fillColor !== 'transparent') {
          ctx.fillStyle = item.fillColor;
          ctx.fillRect(
            item.x * currentScale,
            item.y * currentScale,
            (item.width || 100) * currentScale,
            (item.height || 60) * currentScale
          );
        }
        ctx.strokeRect(
          item.x * currentScale,
          item.y * currentScale,
          (item.width || 100) * currentScale,
          (item.height || 60) * currentScale
        );
      } else if (item.type === 'circle') {
        ctx.strokeStyle = item.color || '#000000';
        ctx.lineWidth = (item.strokeWidth || 2) * currentScale;
        ctx.globalAlpha = item.opacity ?? 1.0;
        const w = (item.width || 60) * currentScale;
        const h = (item.height || 60) * currentScale;
        ctx.beginPath();
        ctx.ellipse(
          item.x * currentScale + w / 2,
          item.y * currentScale + h / 2,
          Math.abs(w / 2),
          Math.abs(h / 2),
          0,
          0,
          2 * Math.PI
        );
        if (item.fillColor && item.fillColor !== 'transparent') {
          ctx.fillStyle = item.fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (item.type === 'arrow' || item.type === 'line') {
        if (item.points && item.points.length >= 2) {
          const p1 = { x: item.points[0].x * currentScale, y: item.points[0].y * currentScale };
          const p2 = { x: item.points[item.points.length - 1].x * currentScale, y: item.points[item.points.length - 1].y * currentScale };
          ctx.strokeStyle = item.color || '#000000';
          ctx.lineWidth = (item.strokeWidth || 3) * currentScale;
          ctx.lineCap = 'round';
          ctx.globalAlpha = item.opacity ?? 1.0;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          if (item.type === 'arrow') {
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const headLen = Math.max(12, (item.strokeWidth || 3) * 3.5 * currentScale);
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
        }
      } else if (item.type === 'text') {
        const scaledFontSize = (item.fontSize || 16) * currentScale;
        ctx.font = `${item.isItalic ? 'italic ' : ''}${item.isBold ? 'bold ' : ''}${scaledFontSize}px ${
          item.fontFamily || 'Inter, system-ui, sans-serif'
        }`;
        ctx.fillStyle = item.color || '#000000';
        ctx.globalAlpha = item.opacity ?? 1.0;

        if (item.fillColor && item.fillColor !== 'transparent') {
          const metrics = ctx.measureText(item.text || '');
          const pad = 4 * currentScale;
          ctx.fillStyle = item.fillColor;
          ctx.fillRect(
            item.x * currentScale - pad,
            item.y * currentScale - scaledFontSize - pad,
            metrics.width + pad * 2,
            scaledFontSize * 1.3 + pad * 2
          );
          ctx.fillStyle = item.color || '#000000';
        }

        ctx.fillText(item.text || '', item.x * currentScale, item.y * currentScale);
      } else if (item.type === 'image' && item.imageDataUrl) {
        const img = new Image();
        img.src = item.imageDataUrl;
        if (img.complete) {
          ctx.globalAlpha = item.opacity ?? 1.0;
          ctx.drawImage(
            img,
            item.x * currentScale,
            item.y * currentScale,
            (item.width || 120) * currentScale,
            (item.height || 80) * currentScale
          );
        }
      }

      // Selection bounding box & handle
      if (isSelected && item.width && item.height) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          item.x * currentScale - 3,
          item.y * currentScale - 3,
          (item.width || 100) * currentScale + 6,
          (item.height || 30) * currentScale + 6
        );
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // Render in-progress drawing / active drag box
    if (isDrawing) {
      ctx.save();
      if ((activeTool === 'pen' || activeTool === 'highlighter') && currentPoints.length >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = (activeTool === 'highlighter' ? 18 : strokeWidth) * currentScale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = activeTool === 'highlighter' ? 0.35 : 1.0;

        ctx.moveTo(currentPoints[0].x * currentScale, currentPoints[0].y * currentScale);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x * currentScale, currentPoints[i].y * currentScale);
        }
        ctx.stroke();
      } else if (currentBox) {
        const x = currentBox.x * currentScale;
        const y = currentBox.y * currentScale;
        const w = currentBox.width * currentScale;
        const h = currentBox.height * currentScale;

        if (activeTool === 'redact') {
          ctx.fillStyle = color === '#ffffff' ? '#ffffff' : '#000000';
          ctx.fillRect(x, y, w, h);
        } else if (activeTool === 'rect') {
          ctx.strokeStyle = color;
          ctx.lineWidth = strokeWidth * currentScale;
          ctx.strokeRect(x, y, w, h);
        } else if (activeTool === 'circle') {
          ctx.strokeStyle = color;
          ctx.lineWidth = strokeWidth * currentScale;
          ctx.beginPath();
          ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (activeTool === 'arrow') {
          if (startPoint && currentPoints.length > 0) {
            const p1 = { x: startPoint.x * currentScale, y: startPoint.y * currentScale };
            const p2 = { x: currentPoints[currentPoints.length - 1].x * currentScale, y: currentPoints[currentPoints.length - 1].y * currentScale };
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth * currentScale;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const headLen = Math.max(12, strokeWidth * 3.5 * currentScale);
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI / 6), p2.y - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI / 6), p2.y - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }
  }, [
    pdfState,
    currentPageIndex,
    annotations,
    selectedAnnotationId,
    isDrawing,
    currentPoints,
    currentBox,
    activeTool,
    color,
    strokeWidth,
    startPoint,
  ]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // Convert canvas client mouse coordinates to unscaled original PDF coordinates
  const getOriginalCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !pdfState) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo) return { x: 0, y: 0 };

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleFactor = pageInfo.originalWidth / canvas.width;
    return {
      x: clientX * scaleFactor,
      y: clientY * scaleFactor,
    };
  };

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pdfState) return;
    const coords = getOriginalCoords(e);

    if (activeTool === 'select') {
      const pageAnnotations = annotations[currentPageIndex] || [];
      const found = [...pageAnnotations].reverse().find((item) => {
        if (item.x !== undefined && item.y !== undefined && item.width && item.height) {
          return (
            coords.x >= item.x &&
            coords.x <= item.x + item.width &&
            coords.y >= item.y &&
            coords.y <= item.y + item.height
          );
        }
        return false;
      });
      setSelectedAnnotationId(found ? found.id : null);
      return;
    }

    if (activeTool === 'text') {
      setTextInputState({
        x: coords.x,
        y: coords.y,
        text: '',
        isOpen: true,
      });
      return;
    }

    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentPoints([coords]);

    if (['rect', 'circle', 'redact'].includes(activeTool)) {
      setCurrentBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const coords = getOriginalCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentPoints((prev) => [...prev, coords]);
    } else if (['rect', 'circle', 'redact'].includes(activeTool)) {
      const minX = Math.min(startPoint.x, coords.x);
      const minY = Math.min(startPoint.y, coords.y);
      const width = Math.abs(coords.x - startPoint.x);
      const height = Math.abs(coords.y - startPoint.y);
      setCurrentBox({ x: minX, y: minY, width, height });
    } else if (activeTool === 'arrow') {
      setCurrentPoints([startPoint, coords]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !pdfState) {
      setIsDrawing(false);
      return;
    }

    const newItemId = 'ann_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    let newAnnotation: AnnotationItem | null = null;

    if (activeTool === 'pen') {
      if (currentPoints.length >= 2) {
        newAnnotation = {
          id: newItemId,
          type: 'draw',
          pageIndex: currentPageIndex,
          x: 0,
          y: 0,
          points: currentPoints,
          color,
          strokeWidth,
          opacity: 1.0,
        };
      }
    } else if (activeTool === 'highlighter') {
      if (currentPoints.length >= 2) {
        newAnnotation = {
          id: newItemId,
          type: 'highlighter',
          pageIndex: currentPageIndex,
          x: 0,
          y: 0,
          points: currentPoints,
          color: color,
          strokeWidth: 18,
          opacity: 0.35,
        };
      }
    } else if (activeTool === 'redact' && currentBox && currentBox.width > 5 && currentBox.height > 5) {
      newAnnotation = {
        id: newItemId,
        type: 'redact',
        pageIndex: currentPageIndex,
        x: currentBox.x,
        y: currentBox.y,
        width: currentBox.width,
        height: currentBox.height,
        color: color === '#ffffff' ? '#ffffff' : '#000000',
        opacity: 1.0,
      };
    } else if (activeTool === 'rect' && currentBox && currentBox.width > 5 && currentBox.height > 5) {
      newAnnotation = {
        id: newItemId,
        type: 'rect',
        pageIndex: currentPageIndex,
        x: currentBox.x,
        y: currentBox.y,
        width: currentBox.width,
        height: currentBox.height,
        color,
        strokeWidth,
        fillColor: textFill,
        opacity: 1.0,
      };
    } else if (activeTool === 'circle' && currentBox && currentBox.width > 5 && currentBox.height > 5) {
      newAnnotation = {
        id: newItemId,
        type: 'circle',
        pageIndex: currentPageIndex,
        x: currentBox.x,
        y: currentBox.y,
        width: currentBox.width,
        height: currentBox.height,
        color,
        strokeWidth,
        fillColor: textFill,
        opacity: 1.0,
      };
    } else if (activeTool === 'arrow' && currentPoints.length >= 2) {
      newAnnotation = {
        id: newItemId,
        type: 'arrow',
        pageIndex: currentPageIndex,
        x: 0,
        y: 0,
        points: currentPoints,
        color,
        strokeWidth,
        opacity: 1.0,
      };
    }

    if (newAnnotation) {
      const updated = {
        ...annotations,
        [currentPageIndex]: [...(annotations[currentPageIndex] || []), newAnnotation],
      };
      setAnnotations(updated);
      pushToHistory(updated);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setCurrentBox(null);
    setStartPoint(null);
  };

  // Add text box handler
  const handleSaveText = () => {
    if (!textInputState || !textInputState.text.trim()) {
      setTextInputState(null);
      return;
    }

    const newItem: AnnotationItem = {
      id: 'ann_text_' + Date.now(),
      type: 'text',
      pageIndex: currentPageIndex,
      x: textInputState.x,
      y: textInputState.y,
      text: textInputState.text,
      fontSize,
      fontFamily: 'Inter, system-ui, sans-serif',
      color,
      fillColor: textFill,
      isBold,
      isItalic,
      opacity: 1.0,
    };

    const updated = {
      ...annotations,
      [currentPageIndex]: [...(annotations[currentPageIndex] || []), newItem],
    };
    setAnnotations(updated);
    pushToHistory(updated);
    setTextInputState(null);
  };

  // Insert Signature / Stamp Image
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const targetWidth = Math.min(220, img.width);
        const targetHeight = targetWidth / aspect;

        const newStamp: AnnotationItem = {
          id: 'ann_stamp_' + Date.now(),
          type: 'image',
          pageIndex: currentPageIndex,
          x: 80,
          y: 80,
          width: targetWidth,
          height: targetHeight,
          imageDataUrl: dataUrl,
          opacity: 1.0,
        };

        const updated = {
          ...annotations,
          [currentPageIndex]: [...(annotations[currentPageIndex] || []), newStamp],
        };
        setAnnotations(updated);
        pushToHistory(updated);
        setActiveTool('select');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(imgFile);
    e.target.value = '';
  };

  // Page Operations
  const handleRotatePage = (clockwise: boolean = true) => {
    if (!pdfState) return;
    const delta = clockwise ? 90 : 270;
    const updatedPages = pdfState.pages.map((p, idx) => {
      if (idx === currentPageIndex) {
        return { ...p, rotation: (p.rotation + delta) % 360 };
      }
      return p;
    });

    setPdfState({ ...pdfState, pages: updatedPages });
  };

  const handleDeletePage = (pageIdx: number) => {
    if (!pdfState) return;
    const remainingActive = pdfState.pages.filter((p) => !p.deleted);
    if (remainingActive.length <= 1) {
      alert(isEnglish ? 'A document must have at least 1 active page.' : 'Belgede en az 1 aktif sayfa kalmalıdır.');
      return;
    }

    const updatedPages = pdfState.pages.map((p, idx) => {
      if (idx === pageIdx) return { ...p, deleted: true };
      return p;
    });

    setPdfState({ ...pdfState, pages: updatedPages });

    const nextActive = updatedPages.findIndex((p, idx) => !p.deleted && idx >= pageIdx);
    if (nextActive !== -1) {
      setCurrentPageIndex(nextActive);
    } else {
      const prevActive = updatedPages.findLastIndex((p) => !p.deleted);
      if (prevActive !== -1) setCurrentPageIndex(prevActive);
    }
  };

  const handleDeleteSelectedAnnotation = () => {
    if (!selectedAnnotationId) return;
    const updatedList = (annotations[currentPageIndex] || []).filter(
      (item) => item.id !== selectedAnnotationId
    );
    const updated = { ...annotations, [currentPageIndex]: updatedList };
    setAnnotations(updated);
    pushToHistory(updated);
    setSelectedAnnotationId(null);
  };

  const handleClearCurrentPageAnnotations = () => {
    if (!confirm(isEnglish ? 'Clear all annotations on this page?' : 'Bu sayfadaki tüm çizim ve eklemeler silinsin mi?')) return;
    const updated = { ...annotations, [currentPageIndex]: [] };
    setAnnotations(updated);
    pushToHistory(updated);
    setSelectedAnnotationId(null);
  };

  // Export PDF
  const handleDownloadPdf = async () => {
    if (!pdfState || !file) return;
    setExporting(true);

    try {
      const editedPdfBytes = await exportEditedPdf(
        pdfState.pdfBytes,
        pdfState.pages,
        annotations,
        watermarkText
      );

      const baseName = file.name.replace(/\.[^.]+$/, '');
      const downloadName = `${baseName}_edited.pdf`;

      const pdfBlob = new Blob([new Uint8Array(editedPdfBytes)], { type: 'application/pdf' });
      downloadFile(pdfBlob, downloadName);

      trackEvent({
        type: 'download',
        toolId: 'pdf-editor',
        toolName: 'PDF Düzenleyici',
        fileSizeBefore: file.size,
        fileSizeAfter: editedPdfBytes.byteLength,
      });
    } catch (err) {
      console.error('Export PDF Error:', err);
      alert(isEnglish ? 'An error occurred while exporting the PDF.' : 'PDF dışa aktarılırken bir hata oluştu.');
    } finally {
      setExporting(false);
    }
  };

  // Export single page as PNG
  const handleDownloadCurrentPageImage = () => {
    if (!baseCanvasRef.current || !overlayCanvasRef.current || !file) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = baseCanvasRef.current.width;
    exportCanvas.height = baseCanvasRef.current.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(baseCanvasRef.current, 0, 0);
    ctx.drawImage(overlayCanvasRef.current, 0, 0);

    const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
    const baseName = file.name.replace(/\.[^.]+$/, '');
    downloadFile(dataUrl, `${baseName}_page_${currentPageIndex + 1}.png`);
  };

  const activePageInfo = pdfState?.pages[currentPageIndex];
  const activePages = pdfState?.pages.filter((p) => !p.deleted) || [];

  return (
    <div className="w-full max-w-[1580px] mx-auto px-3 sm:px-6 lg:px-8 py-6 flex flex-col flex-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <Link
            to={basePath || '/'}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-zinc-600 hover:text-brand-text hover:border-brand-purple shadow-sm transition-all"
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr from-red-600 to-rose-500 shadow-md"
            >
              <FileText size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-text">
                  {isEnglish ? 'PDF Editor' : 'PDF Düzenleyici'}
                </h1>
                <span className="text-[10.5px] font-bold text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 shadow-sm">
                  {isEnglish ? '100% Free' : 'Ücretsiz & Yerel'}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {isEnglish
                  ? 'Add text, sign, highlight, redact & manage pages directly in browser.'
                  : 'Tarayıcında metin ekle, imzala, vurgula, sansürle ve sayfaları yönet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Bar (When File Loaded) */}
        {pdfState && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => signatureInputRef.current?.click()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all"
            >
              <ImagePlus size={14} className="text-rose-500" />
              <span>{isEnglish ? 'Add Signature / Image' : 'İmza / Resim Ekle'}</span>
            </button>
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleSignatureUpload}
            />

            <button
              onClick={() => setShowWatermarkModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all"
              title={isEnglish ? 'Watermark' : 'Filigran'}
            >
              <Stamp size={14} className="text-indigo-600" />
              <span>{isEnglish ? 'Watermark' : 'Filigran'}</span>
            </button>

            <button
              onClick={handleDownloadCurrentPageImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all"
              title={isEnglish ? 'Export current page as high-res PNG image' : 'Geçerli sayfayı PNG olarak indir'}
            >
              <Download size={14} />
              <span>PNG</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-brand-purple hover:brightness-105 shadow-md transition-all disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>{isEnglish ? 'Exporting...' : 'Hazırlanıyor...'}</span>
                </>
              ) : (
                <>
                  <Download size={15} strokeWidth={2.2} />
                  <span>{isEnglish ? 'Download PDF' : 'PDF İndir'}</span>
                </>
              )}
            </button>

            <label className="cursor-pointer ml-1">
              <span className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs flex items-center justify-center transition-colors">
                <Upload size={14} />
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Main Workspace */}
      {!pdfState ? (
        // ── EMPTY STATE DROPZONE ──────────────────────────────────────────
        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] max-w-3xl mx-auto w-full">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files[0];
              if (dropped) handleFileSelect(dropped);
            }}
            className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-red-300 hover:border-red-500 bg-white/80 hover:bg-red-50/30 rounded-3xl cursor-pointer shadow-xl transition-all group"
          >
            <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-[-4deg] transition-all shadow-md">
              <FileText size={40} strokeWidth={1.8} />
            </div>

            <h3 className="text-xl font-bold text-brand-text mb-2 text-center">
              {isEnglish ? 'Choose a PDF file or drop it here' : 'PDF dosyanızı seçin veya buraya sürükleyin'}
            </h3>
            <p className="text-sm text-zinc-500 mb-6 text-center max-w-md">
              {isEnglish
                ? 'Completely secure and private. Your files stay in your browser.'
                : '100% güvenli ve özel. Dosyalarınız asla hiçbir sunucuya yüklenmez.'}
            </p>

            <span className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md group-hover:shadow-lg transition-all">
              {loading ? (isEnglish ? 'Loading PDF...' : 'PDF Yükleniyor...') : (isEnglish ? 'Select PDF' : 'PDF Dosyası Seç')}
            </span>

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
          </label>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 w-full text-center">
            {[
              { icon: <Type size={16} className="text-blue-600" />, label: isEnglish ? 'Add Text' : 'Metin Ekle' },
              { icon: <Pen size={16} className="text-rose-600" />, label: isEnglish ? 'Sign & Draw' : 'İmza & Kalem' },
              { icon: <ShieldAlert size={16} className="text-zinc-800" />, label: isEnglish ? 'Redact / Censor' : 'Sansürle / Karart' },
              { icon: <Layers size={16} className="text-purple-600" />, label: isEnglish ? 'Manage Pages' : 'Sayfa Yönetimi' },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm text-xs font-semibold text-zinc-700">
                {f.icon}
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ── FULL PDF EDITOR INTERFACE ────────────────────────────────────
        <div className="flex-1 flex flex-col lg:flex-row gap-4 items-start">
          {/* LEFT: THUMBNAILS & PAGE MANAGER (SIDEBAR) */}
          <div className="w-full lg:w-64 bg-white rounded-3xl border border-zinc-200 p-4 shadow-sm flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {isEnglish ? 'Pages' : 'Sayfalar'} ({activePages.length})
              </span>
              <span className="text-[11px] font-medium text-zinc-500">
                {currentPageIndex + 1} / {pdfState.numPages}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {pdfState.pages.map((p, idx) => {
                if (p.deleted) return null;
                const isSelected = idx === currentPageIndex;
                const pageAnns = annotations[idx] || [];

                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentPageIndex(idx)}
                    className={`group relative p-2 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50/40 shadow-sm ring-2 ring-red-500/20'
                        : 'border-zinc-100 hover:border-zinc-300 bg-zinc-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[11px] font-bold text-zinc-700">
                        {isEnglish ? 'Page' : 'Sayfa'} {idx + 1}
                      </span>
                      {pageAnns.length > 0 && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                          {pageAnns.length}
                        </span>
                      )}
                    </div>

                    {/* Thumbnail placeholder or preview */}
                    <div className="w-full aspect-[1/1.4] bg-white rounded-xl border border-zinc-200 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                      <FileText size={28} className="text-zinc-300" />
                      <span className="text-[10px] font-semibold text-zinc-400 mt-1">
                        {p.originalWidth.toFixed(0)} × {p.originalHeight.toFixed(0)}
                      </span>
                      {p.rotation !== 0 && (
                        <span className="absolute top-1 right-1 text-[9px] font-bold text-white bg-zinc-700 px-1 rounded">
                          {p.rotation}°
                        </span>
                      )}
                    </div>

                    {/* Quick page actions */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-200/60 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPageIndex(idx);
                          handleRotatePage(true);
                        }}
                        title={isEnglish ? 'Rotate 90° Clockwise' : '90° Saat Yönünde Döndür'}
                        className="p-1 text-zinc-500 hover:text-brand-text hover:bg-zinc-200 rounded-lg transition-colors"
                      >
                        <RotateCw size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(idx);
                        }}
                        title={isEnglish ? 'Delete this page' : 'Bu sayfayı sil'}
                        className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER: TOOLBAR & CANVAS STAGE */}
          <div className="flex-1 w-full flex flex-col gap-3">
            {/* TOP TOOLBAR: Tools & Styling */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Tool Selection Buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: 'select', icon: <Eye size={15} />, label: isEnglish ? 'Select' : 'Seç' },
                  { id: 'text', icon: <Type size={15} />, label: isEnglish ? 'Text' : 'Metin' },
                  { id: 'pen', icon: <Pen size={15} />, label: isEnglish ? 'Pen' : 'Kalem' },
                  { id: 'highlighter', icon: <Highlighter size={15} />, label: isEnglish ? 'Highlight' : 'Vurgula' },
                  { id: 'redact', icon: <ShieldAlert size={15} />, label: isEnglish ? 'Redact' : 'Sansür' },
                  { id: 'rect', icon: <Square size={15} />, label: isEnglish ? 'Rectangle' : 'Kutu' },
                  { id: 'circle', icon: <Circle size={15} />, label: isEnglish ? 'Circle' : 'Daire' },
                  { id: 'arrow', icon: <ArrowUpRight size={15} />, label: isEnglish ? 'Arrow' : 'Ok' },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as ToolType)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTool === tool.id
                        ? 'bg-zinc-900 text-white shadow-sm scale-105'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>

              {/* Undo / Redo / Zoom & Page controls */}
              <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-zinc-200 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-end">
                <button
                  onClick={undo}
                  disabled={historyIdx <= 0}
                  className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                  title={isEnglish ? 'Undo' : 'Geri Al'}
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIdx >= history.length - 1}
                  className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                  title={isEnglish ? 'Redo' : 'İleri Al'}
                >
                  <Redo2 size={16} />
                </button>

                <div className="h-4 w-px bg-zinc-200 mx-1" />

                <button
                  onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors"
                  title={isEnglish ? 'Zoom Out' : 'Uzaklaştır'}
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-bold text-zinc-600 min-w-[42px] text-center">
                  {(zoomScale * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors"
                  title={isEnglish ? 'Zoom In' : 'Yakınlaştır'}
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* SUB-TOOLBAR: Color Picker & Properties for active tool */}
            <div className="bg-white/90 backdrop-blur rounded-2xl border border-zinc-200 px-4 py-2 flex items-center justify-between gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Color Palette */}
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 font-medium mr-1">
                    {isEnglish ? 'Color:' : 'Renk:'}
                  </span>
                  {(activeTool === 'highlighter' ? HIGHLIGHTER_COLORS : COLOR_PALETTE).map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border border-black/10 flex items-center justify-center transition-transform ${
                        color === c ? 'scale-125 shadow-md ring-2 ring-zinc-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && (
                        <Check size={12} className={c === '#ffffff' || c === '#facc15' ? 'text-black' : 'text-white'} />
                      )}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent p-0"
                    title={isEnglish ? 'Custom Color' : 'Özel Renk'}
                  />
                </div>

                {/* Stroke width or Font size */}
                {(activeTool === 'pen' || activeTool === 'rect' || activeTool === 'circle' || activeTool === 'arrow') && (
                  <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
                    <span className="text-zinc-500 font-medium">
                      {isEnglish ? 'Thickness:' : 'Kalınlık:'}
                    </span>
                    {[2, 4, 6, 10].map((w) => (
                      <button
                        key={w}
                        onClick={() => setStrokeWidth(w)}
                        className={`px-2 py-0.5 rounded-lg font-bold ${
                          strokeWidth === w ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                )}

                {/* Text Formatting Controls */}
                {activeTool === 'text' && (
                  <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
                    <span className="text-zinc-500 font-medium">
                      {isEnglish ? 'Size:' : 'Boyut:'}
                    </span>
                    {[14, 18, 24, 32].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`px-2 py-0.5 rounded-lg font-bold ${
                          fontSize === s ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsBold((b) => !b)}
                      className={`px-2 py-0.5 rounded-lg font-black ${isBold ? 'bg-zinc-800 text-white' : 'bg-zinc-100'}`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => setIsItalic((it) => !it)}
                      className={`px-2 py-0.5 rounded-lg italic font-serif ${isItalic ? 'bg-zinc-800 text-white' : 'bg-zinc-100'}`}
                    >
                      I
                    </button>
                  </div>
                )}

                {/* Fill control for shapes */}
                {(activeTool === 'rect' || activeTool === 'circle') && (
                  <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
                    <span className="text-zinc-500 font-medium">
                      {isEnglish ? 'Fill:' : 'Dolgu:'}
                    </span>
                    <button
                      onClick={() => setTextFill(textFill === 'transparent' ? color + '33' : 'transparent')}
                      className={`px-2.5 py-0.5 rounded-lg font-semibold ${
                        textFill !== 'transparent' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {textFill !== 'transparent' ? (isEnglish ? 'Filled' : 'Dolu') : (isEnglish ? 'Transparent' : 'Şeffaf')}
                    </button>
                  </div>
                )}
              </div>

              {/* Page Clear or Selection Delete */}
              <div className="flex items-center gap-2">
                {selectedAnnotationId && (
                  <button
                    onClick={handleDeleteSelectedAnnotation}
                    className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-xl font-semibold transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>{isEnglish ? 'Delete Selected' : 'Seçileni Sil'}</span>
                  </button>
                )}
                {(annotations[currentPageIndex] || []).length > 0 && (
                  <button
                    onClick={handleClearCurrentPageAnnotations}
                    className="text-zinc-500 hover:text-red-600 px-2 py-1 font-medium transition-colors"
                  >
                    {isEnglish ? 'Clear Page' : 'Sayfayı Temizle'}
                  </button>
                )}
              </div>
            </div>

            {/* STAGE CONTAINER WITH DUAL CANVAS (Base PDF + Overlay) */}
            <div
              ref={containerRef}
              className="flex-1 bg-zinc-100/90 rounded-3xl border border-zinc-200/80 p-6 flex flex-col items-center justify-start overflow-auto min-h-[600px] relative shadow-inner"
            >
              <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white border border-zinc-300">
                {/* 1. Base PDF Render Canvas */}
                <canvas ref={baseCanvasRef} className="block" />

                {/* 2. Interactive Editing Overlay Canvas */}
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className={`absolute inset-0 z-10 ${
                    activeTool === 'select'
                      ? 'cursor-default'
                      : activeTool === 'text'
                      ? 'cursor-text'
                      : 'cursor-crosshair'
                  }`}
                />

                {/* 3. Inline Text Input Modal/Box */}
                {textInputState?.isOpen && (
                  <div
                    className="absolute z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-zinc-300 shadow-2xl flex flex-col gap-2 min-w-[240px]"
                    style={{
                      left: Math.max(10, (textInputState.x / (activePageInfo?.originalWidth || 600)) * (baseCanvasRef.current?.width || 600)),
                      top: Math.max(10, (textInputState.y / (activePageInfo?.originalHeight || 800)) * (baseCanvasRef.current?.height || 800)),
                    }}
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder={isEnglish ? 'Type text here...' : 'Metni buraya yazın...'}
                      value={textInputState.text}
                      onChange={(e) => setTextInputState({ ...textInputState, text: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveText();
                        if (e.key === 'Escape') setTextInputState(null);
                      }}
                      className="px-3 py-1.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                      style={{
                        color,
                        fontSize: `${fontSize}px`,
                        fontWeight: isBold ? 'bold' : 'normal',
                        fontStyle: isItalic ? 'italic' : 'normal',
                      }}
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setTextInputState(null)}
                        className="px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 rounded-lg"
                      >
                        {isEnglish ? 'Cancel' : 'İptal'}
                      </button>
                      <button
                        onClick={handleSaveText}
                        className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                      >
                        {isEnglish ? 'Add' : 'Ekle'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Floating Page Navigator */}
              <div className="sticky bottom-4 mt-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 shadow-xl flex items-center gap-3 z-30">
                <button
                  onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                  disabled={currentPageIndex <= 0}
                  className="p-1 rounded-full text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs font-bold text-zinc-700">
                  {isEnglish ? 'Page' : 'Sayfa'} {currentPageIndex + 1} / {pdfState.numPages}
                </span>
                <button
                  onClick={() => setCurrentPageIndex((p) => Math.min(pdfState.numPages - 1, p + 1))}
                  disabled={currentPageIndex >= pdfState.numPages - 1}
                  className="p-1 rounded-full text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="h-4 w-px bg-zinc-200" />
                <button
                  onClick={() => handleRotatePage(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-brand-text px-2 py-1 rounded-lg hover:bg-zinc-100"
                >
                  <RotateCw size={13} />
                  <span>{isEnglish ? 'Rotate' : 'Döndür'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watermark Dialog Modal */}
      {showWatermarkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stamp className="text-indigo-600" size={20} />
                <h3 className="text-lg font-bold text-zinc-900">
                  {isEnglish ? 'Add PDF Watermark' : 'PDF Filigranı Ekle'}
                </h3>
              </div>
              <button
                onClick={() => setShowWatermarkModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              {isEnglish
                ? 'Enter a watermark text that will be diagonally stamped across all pages upon download.'
                : 'İndirildiğinde tüm sayfalara çapraz olarak basılacak filigran metnini girin.'}
            </p>

            <input
              type="text"
              placeholder={isEnglish ? 'e.g. CONFIDENTIAL, DRAFT' : 'Örn: GİZLİ, TASLAK, ONAYLANDI'}
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setWatermarkText('');
                  setShowWatermarkModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                {isEnglish ? 'Clear' : 'Kaldır'}
              </button>
              <button
                onClick={() => setShowWatermarkModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                {isEnglish ? 'Save Watermark' : 'Filigranı Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
