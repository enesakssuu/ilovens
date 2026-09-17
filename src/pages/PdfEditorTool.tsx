import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, FileText, Download, RotateCw, Trash2,
  ZoomIn, ZoomOut, Undo2, Redo2, Type, Pen, Highlighter,
  Square, Circle, ArrowUpRight, ShieldAlert, ImagePlus,
  Stamp, Check, ChevronLeft, ChevronRight, Upload,
  RefreshCw, Copy, MousePointer, Plus, Minus,
  Edit3, X
} from 'lucide-react';
import {
  loadPdfDocument,
  renderPdfPageToCanvas,
  renderPdfTextLayer,
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
  '#1e293b', // Slate
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

const FONT_FAMILIES = [
  { label: 'Inter (Modern)', value: 'Inter, system-ui, sans-serif' },
  { label: 'Arial (Standart)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Times New Roman (Resmi)', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New (Daktilo)', value: '"Courier New", Courier, monospace' },
  { label: 'Georgia (Kitap)', value: 'Georgia, serif' },
  { label: 'Impact (Kalın)', value: 'Impact, sans-serif' },
];

type ResizeHandleType = 'nw' | 'ne' | 'se' | 'sw';

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
  const [zoomScale, setZoomScale] = useState<number>(1.25);

  // Tool & Active Global Styling State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<string>('Inter, system-ui, sans-serif');
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

  // Selection & Manipulation state
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Modal / Dedicated Text Editor Card
  const [textEditorCard, setTextEditorCard] = useState<{
    isOpen: boolean;
    isNew: boolean;
    itemId?: string;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    isBold: boolean;
    isItalic: boolean;
    fillColor: string;
  } | null>(null);

  // Selected Native Text Popup (when selecting text in PDF)
  const [selectedTextPopup, setSelectedTextPopup] = useState<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Interaction: Dragging an object
  const [draggingState, setDraggingState] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialItemX: number;
    initialItemY: number;
  } | null>(null);

  // Interaction: Resizing an object
  const [resizingState, setResizingState] = useState<{
    id: string;
    handle: ResizeHandleType;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  } | null>(null);

  // Interaction: Freehand drawing on canvas
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Canvases and refs
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerContainerRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get currently selected item
  const selectedItem = (annotations[currentPageIndex] || []).find((a) => a.id === selectedAnnotationId);

  // Sync toolbar with selected item properties when an item is selected
  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.color) setColor(selectedItem.color);
      if (selectedItem.fontSize) setFontSize(selectedItem.fontSize);
      if (selectedItem.fontFamily) setFontFamily(selectedItem.fontFamily);
      if (selectedItem.isBold !== undefined) setIsBold(selectedItem.isBold);
      if (selectedItem.isItalic !== undefined) setIsItalic(selectedItem.isItalic);
      if (selectedItem.fillColor !== undefined) setTextFill(selectedItem.fillColor);
      if (selectedItem.strokeWidth) setStrokeWidth(selectedItem.strokeWidth);
    }
  }, [selectedItem]);

  // Update selected item property helper
  const updateSelectedItemProperty = (prop: Partial<AnnotationItem>) => {
    if (!selectedAnnotationId) return;
    const updatedList = (annotations[currentPageIndex] || []).map((item) => {
      if (item.id === selectedAnnotationId) {
        return { ...item, ...prop };
      }
      return item;
    });
    const updated = { ...annotations, [currentPageIndex]: updatedList };
    setAnnotations(updated);
    pushToHistory(updated);
  };

  // Record history
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
      setSelectedAnnotationId(null);
      setTextEditorCard(null);
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
    setSelectedAnnotationId(null);
    setSelectedTextPopup(null);
    setTextEditorCard(null);

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

  // Render current page: Base PDF Canvas + Text Layer
  const renderCurrentPage = useCallback(async () => {
    if (!pdfProxy || !pdfState || !baseCanvasRef.current) return;
    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo || pageInfo.deleted) return;

    try {
      // 1. Render Base Canvas
      await renderPdfPageToCanvas(
        pdfProxy,
        pageInfo.pageNumber,
        baseCanvasRef.current,
        zoomScale,
        pageInfo.rotation
      );

      // 2. Render Native Text Selection Layer
      if (textLayerContainerRef.current) {
        await renderPdfTextLayer(
          pdfProxy,
          pageInfo.pageNumber,
          textLayerContainerRef.current,
          zoomScale,
          pageInfo.rotation
        );
      }
    } catch (err) {
      console.error('Page render error:', err);
    }
  }, [pdfProxy, pdfState, currentPageIndex, zoomScale]);

  // Redraw Freehand Canvas Overlay (drawing & highlighters)
  const drawFreehandOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !pdfState || !baseCanvasRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo) return;

    canvas.width = baseCanvasRef.current.width;
    canvas.height = baseCanvasRef.current.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentScale = canvas.width / pageInfo.originalWidth;
    const pageAnnotations = annotations[currentPageIndex] || [];

    // Render stored freehand & line annotations on canvas
    for (const item of pageAnnotations) {
      if (item.type === 'draw' || item.type === 'highlighter') {
        if (item.points && item.points.length >= 2) {
          ctx.save();
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
          ctx.restore();
        }
      } else if (item.type === 'arrow' || item.type === 'line') {
        if (item.points && item.points.length >= 2) {
          ctx.save();
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
          ctx.restore();
        }
      }
    }

    // Render active drawing strokes/box
    if (isDrawingFreehand) {
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
    isDrawingFreehand,
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
    drawFreehandOverlay();
  }, [drawFreehandOverlay]);

  // Convert mouse event coordinates to unscaled original PDF coordinates
  const getPdfCoords = (e: React.MouseEvent) => {
    if (!baseCanvasRef.current || !pdfState) return { x: 0, y: 0 };
    const rect = baseCanvasRef.current.getBoundingClientRect();
    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo) return { x: 0, y: 0 };

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleFactor = pageInfo.originalWidth / baseCanvasRef.current.width;
    return {
      x: clientX * scaleFactor,
      y: clientY * scaleFactor,
    };
  };

  // Detect native text selection in the PDF
  const checkNativeTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !baseCanvasRef.current || !pdfState) {
      setSelectedTextPopup(null);
      return;
    }

    const selectedStr = selection.toString().trim();
    // Only show if at least 2 characters selected inside the PDF
    if (!selectedStr || selectedStr.length < 2) {
      setSelectedTextPopup(null);
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const canvasRect = baseCanvasRef.current.getBoundingClientRect();
      const pageInfo = pdfState.pages[currentPageIndex];
      if (!pageInfo) return;

      // Check if selection is strictly inside the canvas
      if (
        rect.left < canvasRect.left ||
        rect.right > canvasRect.right ||
        rect.top < canvasRect.top ||
        rect.bottom > canvasRect.bottom
      ) {
        setSelectedTextPopup(null);
        return;
      }

      const scaleFactor = pageInfo.originalWidth / baseCanvasRef.current.width;
      const unscaledX = (rect.left - canvasRect.left) * scaleFactor;
      const unscaledY = (rect.top - canvasRect.top) * scaleFactor;
      const unscaledW = rect.width * scaleFactor;
      const unscaledH = rect.height * scaleFactor;

      setSelectedTextPopup({
        text: selectedStr,
        x: Math.max(0, unscaledX),
        y: Math.max(0, unscaledY),
        width: Math.max(20, unscaledW),
        height: Math.max(14, unscaledH),
        screenX: rect.left + rect.width / 2,
        screenY: rect.top - 10,
      });
    } catch {
      setSelectedTextPopup(null);
    }
  };

  // Open Edit Card to Replace Selected Text
  const handleOpenReplaceCard = () => {
    if (!selectedTextPopup || !pdfState) return;

    setTextEditorCard({
      isOpen: true,
      isNew: true,
      x: selectedTextPopup.x,
      y: selectedTextPopup.y,
      text: selectedTextPopup.text,
      fontSize: Math.max(12, Math.min(36, Math.round(selectedTextPopup.height * 0.9))),
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#000000',
      isBold: false,
      isItalic: false,
      fillColor: '#ffffff', // Clean whiteout background to cover old text seamlessly
    });

    setSelectedTextPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  // Censor / Redact Selected PDF Text
  const handleRedactSelectedText = () => {
    if (!selectedTextPopup || !pdfState) return;

    const redactId = 'ann_redact_' + Date.now();
    const redactBox: AnnotationItem = {
      id: redactId,
      type: 'redact',
      pageIndex: currentPageIndex,
      x: Math.max(0, selectedTextPopup.x - 2),
      y: Math.max(0, selectedTextPopup.y - 2),
      width: selectedTextPopup.width + 4,
      height: selectedTextPopup.height + 4,
      color: '#000000',
      opacity: 1.0,
    };

    const updated = {
      ...annotations,
      [currentPageIndex]: [...(annotations[currentPageIndex] || []), redactBox],
    };

    setAnnotations(updated);
    pushToHistory(updated);
    setSelectedTextPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  // Save Text from the Focused Edit Card
  const handleSaveTextCard = () => {
    if (!textEditorCard) return;

    if (textEditorCard.isNew) {
      // If replacing or adding new text
      const newTextId = 'ann_text_' + Date.now();
      const newItems: AnnotationItem[] = [];

      // If background is whiteout, add whiteout block underneath
      if (textEditorCard.fillColor === '#ffffff') {
        newItems.push({
          id: 'ann_bg_' + Date.now(),
          type: 'redact',
          pageIndex: currentPageIndex,
          x: Math.max(0, textEditorCard.x - 2),
          y: Math.max(0, textEditorCard.y - 2),
          width: Math.max(80, textEditorCard.text.length * (textEditorCard.fontSize * 0.6) + 12),
          height: textEditorCard.fontSize * 1.35 + 4,
          color: '#ffffff',
          opacity: 1.0,
        });
      }

      newItems.push({
        id: newTextId,
        type: 'text',
        pageIndex: currentPageIndex,
        x: textEditorCard.x,
        y: textEditorCard.y,
        width: Math.max(100, textEditorCard.text.length * (textEditorCard.fontSize * 0.6) + 16),
        height: Math.max(28, textEditorCard.fontSize * 1.4),
        text: textEditorCard.text,
        fontSize: textEditorCard.fontSize,
        fontFamily: textEditorCard.fontFamily,
        color: textEditorCard.color,
        fillColor: textEditorCard.fillColor === '#ffffff' ? '#ffffff' : 'transparent',
        isBold: textEditorCard.isBold,
        isItalic: textEditorCard.isItalic,
        opacity: 1.0,
      });

      const updated = {
        ...annotations,
        [currentPageIndex]: [...(annotations[currentPageIndex] || []), ...newItems],
      };
      setAnnotations(updated);
      pushToHistory(updated);
    } else if (textEditorCard.itemId) {
      // Editing existing text item
      const updatedList = (annotations[currentPageIndex] || []).map((item) => {
        if (item.id === textEditorCard.itemId) {
          return {
            ...item,
            text: textEditorCard.text,
            fontSize: textEditorCard.fontSize,
            fontFamily: textEditorCard.fontFamily,
            color: textEditorCard.color,
            fillColor: textEditorCard.fillColor,
            isBold: textEditorCard.isBold,
            isItalic: textEditorCard.isItalic,
            width: Math.max(item.width || 80, textEditorCard.text.length * (textEditorCard.fontSize * 0.6) + 16),
            height: Math.max(item.height || 28, textEditorCard.fontSize * 1.4),
          };
        }
        return item;
      });
      const updated = { ...annotations, [currentPageIndex]: updatedList };
      setAnnotations(updated);
      pushToHistory(updated);
    }

    setTextEditorCard(null);
    setSelectedAnnotationId(null);
    setActiveTool('select');
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pdfState) return;
    const coords = getPdfCoords(e);

    if (activeTool === 'select') {
      setSelectedAnnotationId(null);
      setTextEditorCard(null);
      return;
    }

    if (activeTool === 'text') {
      // Open clean text editor card at click location
      setTextEditorCard({
        isOpen: true,
        isNew: true,
        x: coords.x,
        y: coords.y,
        text: '',
        fontSize,
        fontFamily,
        color,
        isBold,
        isItalic,
        fillColor: textFill,
      });
      return;
    }

    // Pen / Highlighter / Shapes
    setIsDrawingFreehand(true);
    setStartPoint(coords);
    setCurrentPoints([coords]);

    if (['rect', 'circle', 'redact'].includes(activeTool)) {
      setCurrentBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingFreehand || !startPoint) return;
    const coords = getPdfCoords(e);

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

  const handleCanvasMouseUp = () => {
    if (!isDrawingFreehand || !startPoint || !pdfState) {
      setIsDrawingFreehand(false);
      return;
    }

    const newItemId = 'ann_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    let newAnnotation: AnnotationItem | null = null;

    if (activeTool === 'pen' && currentPoints.length >= 2) {
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
    } else if (activeTool === 'highlighter' && currentPoints.length >= 2) {
      newAnnotation = {
        id: newItemId,
        type: 'highlighter',
        pageIndex: currentPageIndex,
        x: 0,
        y: 0,
        points: currentPoints,
        color,
        strokeWidth: 18,
        opacity: 0.35,
      };
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

      if (['redact', 'rect', 'circle'].includes(activeTool)) {
        setSelectedAnnotationId(newItemId);
        setActiveTool('select');
      }
    }

    setIsDrawingFreehand(false);
    setCurrentPoints([]);
    setCurrentBox(null);
    setStartPoint(null);
  };

  // ── INTERACTIVE OBJECT DRAG & RESIZE HANDLING ───────────────────────────
  const startDragObject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
    const item = (annotations[currentPageIndex] || []).find((a) => a.id === id);
    if (!item) return;

    setDraggingState({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialItemX: item.x,
      initialItemY: item.y,
    });
  };

  const startResizeObject = (e: React.MouseEvent, id: string, handle: ResizeHandleType) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
    const item = (annotations[currentPageIndex] || []).find((a) => a.id === id);
    if (!item) return;

    setResizingState({
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: item.x,
      initialY: item.y,
      initialW: item.width || 120,
      initialH: item.height || 40,
    });
  };

  const handleGlobalPointerMove = (e: React.MouseEvent) => {
    if (!pdfState || !baseCanvasRef.current) return;
    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo) return;

    const scaleFactor = pageInfo.originalWidth / baseCanvasRef.current.width;

    // Handle Dragging Object
    if (draggingState) {
      const dx = (e.clientX - draggingState.startX) * scaleFactor;
      const dy = (e.clientY - draggingState.startY) * scaleFactor;

      const updatedList = (annotations[currentPageIndex] || []).map((item) => {
        if (item.id === draggingState.id) {
          return {
            ...item,
            x: Math.max(0, Math.min(pageInfo.originalWidth - (item.width || 20), draggingState.initialItemX + dx)),
            y: Math.max(0, Math.min(pageInfo.originalHeight - (item.height || 20), draggingState.initialItemY + dy)),
          };
        }
        return item;
      });

      setAnnotations({ ...annotations, [currentPageIndex]: updatedList });
      return;
    }

    // Handle Resizing Object
    if (resizingState) {
      const dx = (e.clientX - resizingState.startX) * scaleFactor;
      const dy = (e.clientY - resizingState.startY) * scaleFactor;

      const updatedList = (annotations[currentPageIndex] || []).map((item) => {
        if (item.id === resizingState.id) {
          let newX = resizingState.initialX;
          let newY = resizingState.initialY;
          let newW = resizingState.initialW;
          let newH = resizingState.initialH;

          if (resizingState.handle.includes('e')) {
            newW = Math.max(30, resizingState.initialW + dx);
          }
          if (resizingState.handle.includes('s')) {
            newH = Math.max(16, resizingState.initialH + dy);
          }
          if (resizingState.handle.includes('w')) {
            const possibleW = resizingState.initialW - dx;
            if (possibleW >= 30) {
              newW = possibleW;
              newX = resizingState.initialX + dx;
            }
          }
          if (resizingState.handle.includes('n')) {
            const possibleH = resizingState.initialH - dy;
            if (possibleH >= 16) {
              newH = possibleH;
              newY = resizingState.initialY + dy;
            }
          }

          return { ...item, x: newX, y: newY, width: newW, height: newH };
        }
        return item;
      });

      setAnnotations({ ...annotations, [currentPageIndex]: updatedList });
    }
  };

  const handleGlobalPointerUp = () => {
    checkNativeTextSelection();

    if (draggingState || resizingState) {
      pushToHistory(annotations);
      setDraggingState(null);
      setResizingState(null);
    }
  };

  // Add Signature / Stamp Image
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile || !pdfState) return;

    const pageInfo = pdfState.pages[currentPageIndex];
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const targetWidth = Math.min(200, (pageInfo?.originalWidth || 600) * 0.35);
        const targetHeight = targetWidth / aspect;

        const posX = Math.max(20, ((pageInfo?.originalWidth || 600) - targetWidth) / 2);
        const posY = Math.max(20, ((pageInfo?.originalHeight || 800) - targetHeight) / 2);

        const newStampId = 'ann_stamp_' + Date.now();
        const newStamp: AnnotationItem = {
          id: newStampId,
          type: 'image',
          pageIndex: currentPageIndex,
          x: posX,
          y: posY,
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
        setSelectedAnnotationId(newStampId);
        setActiveTool('select');
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(imgFile);
    e.target.value = '';
  };

  // Open Edit Card for Existing Text Item
  const handleEditTextItem = (item: AnnotationItem) => {
    setTextEditorCard({
      isOpen: true,
      isNew: false,
      itemId: item.id,
      x: item.x,
      y: item.y,
      text: item.text || '',
      fontSize: item.fontSize || 18,
      fontFamily: item.fontFamily || 'Inter, system-ui, sans-serif',
      color: item.color || '#000000',
      isBold: !!item.isBold,
      isItalic: !!item.isItalic,
      fillColor: item.fillColor || 'transparent',
    });
  };

  // Duplicate Selected Object
  const handleDuplicateSelected = () => {
    if (!selectedAnnotationId) return;
    const item = (annotations[currentPageIndex] || []).find((a) => a.id === selectedAnnotationId);
    if (!item) return;

    const cloneId = 'ann_clone_' + Date.now();
    const clonedItem: AnnotationItem = {
      ...JSON.parse(JSON.stringify(item)),
      id: cloneId,
      x: item.x + 20,
      y: item.y + 20,
    };

    const updated = {
      ...annotations,
      [currentPageIndex]: [...(annotations[currentPageIndex] || []), clonedItem],
    };
    setAnnotations(updated);
    pushToHistory(updated);
    setSelectedAnnotationId(cloneId);
  };

  // Delete Selected Annotation
  const handleDeleteSelected = () => {
    if (!selectedAnnotationId) return;
    const updatedList = (annotations[currentPageIndex] || []).filter(
      (item) => item.id !== selectedAnnotationId
    );
    const updated = { ...annotations, [currentPageIndex]: updatedList };
    setAnnotations(updated);
    pushToHistory(updated);
    setSelectedAnnotationId(null);
    setTextEditorCard(null);
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

  // Export PDF with lossless vector and overlay embedding
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

  // Export Single Page as PNG
  const handleDownloadCurrentPageImage = () => {
    if (!baseCanvasRef.current || !pdfState || !file) return;

    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = baseCanvasRef.current.width;
    exportCanvas.height = baseCanvasRef.current.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(baseCanvasRef.current, 0, 0);

    if (overlayCanvasRef.current) {
      ctx.drawImage(overlayCanvasRef.current, 0, 0);
    }

    const currentScale = exportCanvas.width / pageInfo.originalWidth;
    const pageAnns = annotations[currentPageIndex] || [];

    for (const item of pageAnns) {
      if (item.type === 'text') {
        const scaledFontSize = (item.fontSize || 16) * currentScale;
        ctx.font = `${item.isItalic ? 'italic ' : ''}${item.isBold ? 'bold ' : ''}${scaledFontSize}px ${
          item.fontFamily || 'Inter, system-ui, sans-serif'
        }`;
        ctx.fillStyle = item.color || '#000000';
        ctx.textBaseline = 'top';

        if (item.fillColor && item.fillColor !== 'transparent') {
          ctx.fillStyle = item.fillColor;
          ctx.fillRect(item.x * currentScale, item.y * currentScale, (item.width || 80) * currentScale, (item.height || 28) * currentScale);
          ctx.fillStyle = item.color || '#000000';
        }

        ctx.fillText(item.text || '', item.x * currentScale, item.y * currentScale);
      } else if (item.type === 'image' && item.imageDataUrl) {
        const img = new Image();
        img.src = item.imageDataUrl;
        if (img.complete) {
          ctx.drawImage(img, item.x * currentScale, item.y * currentScale, (item.width || 100) * currentScale, (item.height || 60) * currentScale);
        }
      } else if (item.type === 'redact') {
        ctx.fillStyle = item.color || '#000000';
        ctx.fillRect(item.x * currentScale, item.y * currentScale, (item.width || 100) * currentScale, (item.height || 30) * currentScale);
      }
    }

    const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
    const baseName = file.name.replace(/\.[^.]+$/, '');
    downloadFile(dataUrl, `${baseName}_page_${currentPageIndex + 1}.png`);
  };

  const activePageInfo = pdfState?.pages[currentPageIndex];
  const activePages = pdfState?.pages.filter((p) => !p.deleted) || [];
  const currentScaleRatio = (baseCanvasRef.current && activePageInfo)
    ? baseCanvasRef.current.width / activePageInfo.originalWidth
    : zoomScale;

  const pageObjectAnnotations = (annotations[currentPageIndex] || []).filter(
    (item) => ['text', 'image', 'rect', 'circle', 'redact'].includes(item.type)
  );

  const isTextContextActive = activeTool === 'text' || (selectedItem && selectedItem.type === 'text');

  return (
    <div
      className="w-full max-w-[1580px] mx-auto px-3 sm:px-6 lg:px-8 py-5 flex flex-col flex-1"
      onMouseMove={handleGlobalPointerMove}
      onMouseUp={handleGlobalPointerUp}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
                  ? 'Edit text seamlessly, drag signatures, redact confidential data directly in browser.'
                  : 'Metinleri kusursuzca değiştirin, imzaları sürükleyin, verileri gizleyin.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        {pdfState && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => signatureInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all"
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
              title={isEnglish ? 'Export page as PNG' : 'Sayfayı PNG olarak kaydet'}
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
                ? 'Select & replace text, drag signatures, adjust styling. 100% private in your browser.'
                : 'Metinleri değiştirin, imzaları sürükleyin, yazı tipini ve boyutunu kolayca ayarlayın.'}
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
              { icon: <Edit3 size={16} className="text-blue-600" />, label: isEnglish ? 'Select & Replace Text' : 'Metin Seç & Değiştir' },
              { icon: <Type size={16} className="text-purple-600" />, label: isEnglish ? 'Font & Size Styling' : 'Yazı Tipi & Boyutu' },
              { icon: <ImagePlus size={16} className="text-rose-600" />, label: isEnglish ? 'Signatures & Stamps' : 'İmza & Resim Ekle' },
              { icon: <ShieldAlert size={16} className="text-zinc-800" />, label: isEnglish ? 'Redact / Censor' : 'Sansürle / Karart' },
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
          {/* LEFT: THUMBNAILS & PAGE MANAGER */}
          <div className="w-full lg:w-60 bg-white rounded-3xl border border-zinc-200 p-4 shadow-sm flex flex-col max-h-[85vh] overflow-y-auto">
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
                    onClick={() => {
                      setCurrentPageIndex(idx);
                      setSelectedAnnotationId(null);
                      setSelectedTextPopup(null);
                      setTextEditorCard(null);
                    }}
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
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-200/60">
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

          {/* CENTER: MAIN WORK AREA */}
          <div className="flex-1 w-full flex flex-col gap-3">
            {/* TOP TOOLBAR */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Tool Selector */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: 'select', icon: <MousePointer size={15} />, label: isEnglish ? 'Select / Move' : 'Seç & Taşı' },
                  { id: 'text', icon: <Type size={15} />, label: isEnglish ? 'Add Text' : 'Metin Ekle' },
                  { id: 'pen', icon: <Pen size={15} />, label: isEnglish ? 'Draw Pen' : 'Kalem' },
                  { id: 'highlighter', icon: <Highlighter size={15} />, label: isEnglish ? 'Highlight' : 'Vurgula' },
                  { id: 'redact', icon: <ShieldAlert size={15} />, label: isEnglish ? 'Redact' : 'Sansür' },
                  { id: 'rect', icon: <Square size={15} />, label: isEnglish ? 'Rectangle' : 'Kutu' },
                  { id: 'circle', icon: <Circle size={15} />, label: isEnglish ? 'Circle' : 'Daire' },
                  { id: 'arrow', icon: <ArrowUpRight size={15} />, label: isEnglish ? 'Arrow' : 'Ok' },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id as ToolType);
                      if (tool.id !== 'select') setSelectedAnnotationId(null);
                    }}
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

              {/* Undo / Redo / Zoom */}
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
                  onClick={() => setZoomScale((z) => Math.max(0.7, z - 0.2))}
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

            {/* SUB-TOOLBAR: Color, Font, Size, Stroke Controls (Live bound to active selection) */}
            <div className="bg-white/95 backdrop-blur rounded-2xl border border-zinc-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Color Palette */}
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 font-medium mr-1">
                    {isEnglish ? 'Color:' : 'Renk:'}
                  </span>
                  {(activeTool === 'highlighter' ? HIGHLIGHTER_COLORS : COLOR_PALETTE).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        updateSelectedItemProperty({ color: c });
                      }}
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
                    onChange={(e) => {
                      setColor(e.target.value);
                      updateSelectedItemProperty({ color: e.target.value });
                    }}
                    className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent p-0"
                    title={isEnglish ? 'Custom Color' : 'Özel Renk'}
                  />
                </div>

                {/* Text Formatting Controls */}
                {isTextContextActive && (
                  <div className="flex items-center gap-2 border-l border-zinc-200 pl-3 flex-wrap">
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        setFontFamily(e.target.value);
                        updateSelectedItemProperty({ fontFamily: e.target.value });
                      }}
                      className="px-2 py-1 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f.label} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <span className="text-zinc-500 font-medium ml-1">
                      {isEnglish ? 'Size:' : 'Boyut:'}
                    </span>
                    <button
                      onClick={() => {
                        const newSize = Math.max(10, fontSize - 2);
                        setFontSize(newSize);
                        updateSelectedItemProperty({ fontSize: newSize });
                      }}
                      className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                      title={isEnglish ? 'Decrease Font Size' : 'Yazı Boyutunu Küçült'}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="font-bold text-zinc-800 min-w-[28px] text-center">
                      {fontSize}px
                    </span>
                    <button
                      onClick={() => {
                        const newSize = Math.min(80, fontSize + 2);
                        setFontSize(newSize);
                        updateSelectedItemProperty({ fontSize: newSize });
                      }}
                      className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                      title={isEnglish ? 'Increase Font Size' : 'Yazı Boyutunu Büyüt'}
                    >
                      <Plus size={13} />
                    </button>

                    <button
                      onClick={() => {
                        const newBold = !isBold;
                        setIsBold(newBold);
                        updateSelectedItemProperty({ isBold: newBold });
                      }}
                      className={`px-2 py-0.5 rounded-lg font-black ${isBold ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'}`}
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onClick={() => {
                        const newItalic = !isItalic;
                        setIsItalic(newItalic);
                        updateSelectedItemProperty({ isItalic: newItalic });
                      }}
                      className={`px-2 py-0.5 rounded-lg italic font-serif ${isItalic ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'}`}
                      title="Italic"
                    >
                      I
                    </button>
                  </div>
                )}

                {/* Stroke width */}
                {(activeTool === 'pen' || activeTool === 'rect' || activeTool === 'circle' || activeTool === 'arrow') && (
                  <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
                    <span className="text-zinc-500 font-medium">
                      {isEnglish ? 'Thickness:' : 'Kalınlık:'}
                    </span>
                    {[2, 4, 6, 10].map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setStrokeWidth(w);
                          updateSelectedItemProperty({ strokeWidth: w });
                        }}
                        className={`px-2 py-0.5 rounded-lg font-bold ${
                          strokeWidth === w ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                )}

                {/* Fill control */}
                {(activeTool === 'rect' || activeTool === 'circle' || (selectedItem && ['rect', 'circle'].includes(selectedItem.type))) && (
                  <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
                    <span className="text-zinc-500 font-medium">
                      {isEnglish ? 'Fill:' : 'Dolgu:'}
                    </span>
                    <button
                      onClick={() => {
                        const nextFill = textFill === 'transparent' ? color + '40' : 'transparent';
                        setTextFill(nextFill);
                        updateSelectedItemProperty({ fillColor: nextFill });
                      }}
                      className={`px-2.5 py-0.5 rounded-lg font-semibold ${
                        textFill !== 'transparent' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {textFill !== 'transparent' ? (isEnglish ? 'Filled' : 'Dolu') : (isEnglish ? 'Transparent' : 'Şeffaf')}
                    </button>
                  </div>
                )}
              </div>

              {/* Action for selected item */}
              <div className="flex items-center gap-2">
                {selectedItem && (
                  <>
                    <button
                      onClick={() => setSelectedAnnotationId(null)}
                      className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl font-bold transition-colors"
                      title={isEnglish ? 'Done' : 'Bitti'}
                    >
                      <Check size={13} />
                      <span>{isEnglish ? 'Done' : 'Tamam'}</span>
                    </button>
                    {selectedItem.type === 'text' && (
                      <button
                        onClick={() => handleEditTextItem(selectedItem)}
                        className="flex items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl font-semibold transition-colors"
                        title={isEnglish ? 'Edit Text' : 'Metni Düzenle'}
                      >
                        <Edit3 size={12} />
                        <span>{isEnglish ? 'Edit' : 'Düzenle'}</span>
                      </button>
                    )}
                    <button
                      onClick={handleDuplicateSelected}
                      className="flex items-center gap-1 text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-xl font-semibold transition-colors"
                      title={isEnglish ? 'Duplicate' : 'Çoğalt'}
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-xl font-semibold transition-colors"
                      title={isEnglish ? 'Delete Selected' : 'Seçileni Sil'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* STAGE CONTAINER */}
            <div
              ref={containerRef}
              className="flex-1 bg-zinc-100/90 rounded-3xl border border-zinc-200/80 p-6 flex flex-col items-center justify-start overflow-auto min-h-[620px] relative shadow-inner"
            >
              <div
                className="relative shadow-2xl rounded-sm overflow-hidden bg-white border border-zinc-300"
                style={{
                  width: baseCanvasRef.current ? `${baseCanvasRef.current.width}px` : 'auto',
                  height: baseCanvasRef.current ? `${baseCanvasRef.current.height}px` : 'auto',
                }}
              >
                {/* 1. Base PDF Render Canvas */}
                <canvas ref={baseCanvasRef} className="block" />

                {/* 2. PDF.js Native Text Selection Layer */}
                <div
                  ref={textLayerContainerRef}
                  className={`textLayer ${activeTool === 'select' ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 5,
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                  }}
                />

                {/* 3. Freehand Drawing & Highlighter Canvas Overlay */}
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className={`absolute inset-0 z-10 ${
                    activeTool === 'select'
                      ? 'pointer-events-none'
                      : activeTool === 'text'
                      ? 'cursor-text pointer-events-auto'
                      : 'cursor-crosshair pointer-events-auto'
                  }`}
                />

                {/* 4. Interactive Object Layer */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  {pageObjectAnnotations.map((item) => {
                    const isSelected = item.id === selectedAnnotationId;
                    const scaledX = item.x * currentScaleRatio;
                    const scaledY = item.y * currentScaleRatio;
                    const scaledW = (item.width || 120) * currentScaleRatio;
                    const scaledH = (item.height || 40) * currentScaleRatio;

                    return (
                      <div
                        key={item.id}
                        onMouseDown={(e) => startDragObject(e, item.id)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (item.type === 'text') handleEditTextItem(item);
                        }}
                        className={`absolute pointer-events-auto group transition-shadow ${
                          isSelected
                            ? 'ring-2 ring-blue-500 shadow-xl cursor-move bg-white/10'
                            : 'cursor-pointer hover:ring-1 hover:ring-blue-300'
                        }`}
                        style={{
                          left: `${scaledX}px`,
                          top: `${scaledY}px`,
                          width: `${scaledW}px`,
                          height: `${scaledH}px`,
                        }}
                      >
                        {/* Render Content */}
                        {item.type === 'text' && (
                          <div
                            className="w-full h-full flex items-start justify-start relative overflow-hidden"
                            style={{
                              backgroundColor: item.fillColor || 'transparent',
                            }}
                          >
                            <div
                              className="w-full h-full select-none break-words whitespace-pre-wrap leading-tight"
                              style={{
                                fontSize: `${(item.fontSize || 16) * currentScaleRatio}px`,
                                fontFamily: item.fontFamily || 'Inter, system-ui, sans-serif',
                                color: item.color || '#000000',
                                fontWeight: item.isBold ? 'bold' : 'normal',
                                fontStyle: item.isItalic ? 'italic' : 'normal',
                              }}
                            >
                              {item.text || ''}
                            </div>
                          </div>
                        )}

                        {item.type === 'image' && item.imageDataUrl && (
                          <img
                            src={item.imageDataUrl}
                            alt="Signature"
                            className="w-full h-full object-contain pointer-events-none select-none"
                            draggable={false}
                          />
                        )}

                        {item.type === 'redact' && (
                          <div
                            className="w-full h-full rounded-sm"
                            style={{ backgroundColor: item.color || '#000000' }}
                          />
                        )}

                        {item.type === 'rect' && (
                          <div
                            className="w-full h-full"
                            style={{
                              border: `${(item.strokeWidth || 2) * currentScaleRatio}px solid ${item.color || '#000000'}`,
                              backgroundColor: item.fillColor || 'transparent',
                            }}
                          />
                        )}

                        {item.type === 'circle' && (
                          <div
                            className="w-full h-full rounded-full"
                            style={{
                              border: `${(item.strokeWidth || 2) * currentScaleRatio}px solid ${item.color || '#000000'}`,
                              backgroundColor: item.fillColor || 'transparent',
                            }}
                          />
                        )}

                        {/* Floating Action Menu on Selected Object */}
                        {isSelected && (
                          <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur text-white rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-2xl z-40 text-xs whitespace-nowrap"
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedAnnotationId(null)}
                              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                              title={isEnglish ? 'Done / Deselect' : 'Bitti / Seçimi Kaldır'}
                            >
                              <Check size={13} />
                              <span>{isEnglish ? 'Done' : 'Tamam'}</span>
                            </button>

                            {item.type === 'text' && (
                              <>
                                <div className="h-3 w-px bg-zinc-700" />
                                <button
                                  onClick={() => handleEditTextItem(item)}
                                  className="flex items-center gap-1 hover:text-blue-400 font-medium"
                                  title={isEnglish ? 'Edit Text' : 'Düzenle'}
                                >
                                  <Edit3 size={12} />
                                  <span>{isEnglish ? 'Edit' : 'Düzenle'}</span>
                                </button>
                              </>
                            )}

                            <div className="h-3 w-px bg-zinc-700" />
                            <button
                              onClick={handleDuplicateSelected}
                              className="p-1 hover:text-blue-400"
                              title={isEnglish ? 'Duplicate' : 'Çoğalt'}
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={handleDeleteSelected}
                              className="p-1 hover:text-red-400"
                              title={isEnglish ? 'Delete' : 'Sil'}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}

                        {/* 4 Corner Resize Handles */}
                        {isSelected && (
                          <>
                            <div
                              onMouseDown={(e) => startResizeObject(e, item.id, 'nw')}
                              className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize z-30 shadow-md"
                            />
                            <div
                              onMouseDown={(e) => startResizeObject(e, item.id, 'ne')}
                              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize z-30 shadow-md"
                            />
                            <div
                              onMouseDown={(e) => startResizeObject(e, item.id, 'se')}
                              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize z-30 shadow-md"
                            />
                            <div
                              onMouseDown={(e) => startResizeObject(e, item.id, 'sw')}
                              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize z-30 shadow-md"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 5. Floating Popup for Native PDF Selected Text */}
                {selectedTextPopup && activeTool === 'select' && (
                  <div
                    className="fixed z-50 bg-zinc-900 text-white rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 border border-zinc-700 animate-fadeIn"
                    style={{
                      left: `${selectedTextPopup.screenX}px`,
                      top: `${selectedTextPopup.screenY - 35}px`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <button
                      onClick={handleOpenReplaceCard}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <Edit3 size={13} />
                      <span>{isEnglish ? 'Replace Text' : 'Metni Değiştir'}</span>
                    </button>
                    <button
                      onClick={handleRedactSelectedText}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-all"
                    >
                      <ShieldAlert size={13} />
                      <span>{isEnglish ? 'Censor' : 'Sansürle'}</span>
                    </button>
                    <button
                      onClick={() => setSelectedTextPopup(null)}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="Kapat"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Floating Page Navigator */}
              <div className="sticky bottom-4 mt-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 shadow-xl flex items-center gap-3 z-30">
                <button
                  onClick={() => {
                    setCurrentPageIndex((p) => Math.max(0, p - 1));
                    setSelectedAnnotationId(null);
                    setSelectedTextPopup(null);
                    setTextEditorCard(null);
                  }}
                  disabled={currentPageIndex <= 0}
                  className="p-1 rounded-full text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs font-bold text-zinc-700">
                  {isEnglish ? 'Page' : 'Sayfa'} {currentPageIndex + 1} / {pdfState.numPages}
                </span>
                <button
                  onClick={() => {
                    setCurrentPageIndex((p) => Math.min(pdfState.numPages - 1, p + 1));
                    setSelectedAnnotationId(null);
                    setSelectedTextPopup(null);
                    setTextEditorCard(null);
                  }}
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

      {/* ── DEDICATED TEXT EDITOR MODAL / CARD (For 1-Click Replace or Add Text) ── */}
      {textEditorCard?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-100 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <h3 className="text-base font-bold text-zinc-900">
                  {textEditorCard.isNew
                    ? (isEnglish ? 'Write / Replace Text' : 'Metin Yaz / Değiştir')
                    : (isEnglish ? 'Edit Text' : 'Metni Düzenle')}
                </h3>
              </div>
              <button
                onClick={() => setTextEditorCard(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">
                {isEnglish ? 'Text Content:' : 'Yeni Metin / Sayı:'}
              </label>
              <textarea
                autoFocus
                rows={3}
                value={textEditorCard.text}
                onChange={(e) => setTextEditorCard({ ...textEditorCard, text: e.target.value })}
                placeholder={isEnglish ? 'Type your replacement text here...' : 'Yeni metni buraya yazın...'}
                className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                style={{
                  fontFamily: textEditorCard.fontFamily,
                  color: textEditorCard.color,
                  fontWeight: textEditorCard.isBold ? 'bold' : 'normal',
                  fontStyle: textEditorCard.isItalic ? 'italic' : 'normal',
                }}
              />
            </div>

            {/* Font & Size Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">
                  {isEnglish ? 'Font Family:' : 'Yazı Tipi:'}
                </label>
                <select
                  value={textEditorCard.fontFamily}
                  onChange={(e) => setTextEditorCard({ ...textEditorCard, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 bg-white"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.label} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">
                  {isEnglish ? 'Font Size:' : 'Yazı Boyutu:'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setTextEditorCard({ ...textEditorCard, fontSize: Math.max(10, textEditorCard.fontSize - 2) })}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  >
                    <Minus size={13} />
                  </button>
                  <input
                    type="number"
                    value={textEditorCard.fontSize}
                    onChange={(e) => setTextEditorCard({ ...textEditorCard, fontSize: Number(e.target.value) || 16 })}
                    className="w-16 px-2 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold text-center"
                  />
                  <button
                    onClick={() => setTextEditorCard({ ...textEditorCard, fontSize: Math.min(80, textEditorCard.fontSize + 2) })}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Styling & Color */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-600 mr-1">
                  {isEnglish ? 'Color:' : 'Renk:'}
                </span>
                {COLOR_PALETTE.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    onClick={() => setTextEditorCard({ ...textEditorCard, color: c })}
                    className={`w-6 h-6 rounded-full border border-black/10 flex items-center justify-center ${
                      textEditorCard.color === c ? 'scale-125 shadow-md ring-2 ring-blue-500' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {textEditorCard.color === c && (
                      <Check size={11} className={c === '#ffffff' ? 'text-black' : 'text-white'} />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTextEditorCard({ ...textEditorCard, isBold: !textEditorCard.isBold })}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                    textEditorCard.isBold ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  B
                </button>
                <button
                  onClick={() => setTextEditorCard({ ...textEditorCard, isItalic: !textEditorCard.isItalic })}
                  className={`px-3 py-1.5 rounded-xl italic font-serif text-xs ${
                    textEditorCard.isItalic ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  I
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setTextEditorCard(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                {isEnglish ? 'Cancel' : 'İptal'}
              </button>
              <button
                onClick={handleSaveTextCard}
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
              >
                <Check size={14} />
                <span>{isEnglish ? 'Apply & Save' : '✓ Tamam / Uygula'}</span>
              </button>
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
