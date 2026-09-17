import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, FileText, Download, RotateCw, Trash2,
  ZoomIn, ZoomOut, Undo2, Redo2, Type, Pen, Highlighter,
  Square, Circle, ArrowUpRight, ShieldAlert, ImagePlus,
  Stamp, Check, ChevronLeft, ChevronRight, Upload,
  RefreshCw, Copy, MousePointer, Plus, Minus,
  Edit3, X, Eraser, AlignLeft, AlignCenter, AlignRight
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

type ToolType =
  | 'select'
  | 'replace'
  | 'text'
  | 'pen'
  | 'highlighter'
  | 'whiteout'
  | 'redact'
  | 'rect'
  | 'circle'
  | 'arrow';

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

const FONT_FAMILIES = [
  { label: 'Inter (Modern Sans)', value: 'Inter, system-ui, sans-serif' },
  { label: 'Arial (Standart)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Times New Roman (Resmi Serif)', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New (Daktilo Monospace)', value: '"Courier New", Courier, monospace' },
  { label: 'Georgia (Kitap Serif)', value: 'Georgia, serif' },
  { label: 'Impact (Kalın Başlık)', value: 'Impact, sans-serif' },
];

type ResizeHandleType = 'nw' | 'ne' | 'se' | 'sw';

interface InPlaceEditorState {
  isOpen: boolean;
  isNew: boolean;
  itemId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fillColor: string; // '#ffffff' for whiteout mask or 'transparent'
  isBold: boolean;
  isItalic: boolean;
  align: 'left' | 'center' | 'right';
  screenX: number;
  screenY: number;
}

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

  // Active Tool & Styling Presets
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>('Inter, system-ui, sans-serif');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [showWatermarkModal, setShowWatermarkModal] = useState<boolean>(false);

  // Annotations State (pageIndex -> list of items)
  const [annotations, setAnnotations] = useState<Record<number, AnnotationItem[]>>({});
  const [history, setHistory] = useState<Record<number, AnnotationItem[]>[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Selection & Manipulation state
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Dedicated In-Place Precision Text Replacement / Edit Popover
  const [inPlaceEditor, setInPlaceEditor] = useState<InPlaceEditorState | null>(null);

  // Native Selected Text Quick Action Popup
  const [nativeTextPopup, setNativeTextPopup] = useState<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Dragging / Resizing interaction states
  const [draggingState, setDraggingState] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialItemX: number;
    initialItemY: number;
  } | null>(null);

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

  // Drawing Box / Strokes interaction states
  const [isDrawingInteraction, setIsDrawingInteraction] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [dragStartPoint, setDragStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Canvases and refs
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerContainerRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Currently selected item
  const selectedItem = (annotations[currentPageIndex] || []).find((a) => a.id === selectedAnnotationId);

  // Sync toolbar when selecting an object
  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.color) setColor(selectedItem.color);
      if (selectedItem.fontSize) setFontSize(selectedItem.fontSize);
      if (selectedItem.fontFamily) setFontFamily(selectedItem.fontFamily);
      if (selectedItem.isBold !== undefined) setIsBold(selectedItem.isBold);
      if (selectedItem.isItalic !== undefined) setIsItalic(selectedItem.isItalic);
      if (selectedItem.align) setTextAlign(selectedItem.align);
      if (selectedItem.strokeWidth) setStrokeWidth(selectedItem.strokeWidth);
    }
  }, [selectedItem]);

  // Push annotations to history stack
  const pushToHistory = (newAnnotations: Record<number, AnnotationItem[]>) => {
    const nextHistory = history.slice(0, historyIdx + 1);
    nextHistory.push(JSON.parse(JSON.stringify(newAnnotations)));
    setHistory(nextHistory);
    setHistoryIdx(nextHistory.length - 1);
  };

  const undo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setAnnotations(JSON.parse(JSON.stringify(prev)));
      setHistoryIdx(historyIdx - 1);
      setSelectedAnnotationId(null);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setAnnotations(JSON.parse(JSON.stringify(next)));
      setHistoryIdx(historyIdx + 1);
      setSelectedAnnotationId(null);
    }
  };

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      alert(isEnglish ? 'Please upload a valid PDF file.' : 'Lütfen geçerli bir PDF dosyası yükleyin.');
      return;
    }

    setLoading(true);
    setFile(selected);
    setCurrentPageIndex(0);
    setAnnotations({});
    setHistory([]);
    setHistoryIdx(-1);
    setSelectedAnnotationId(null);
    setInPlaceEditor(null);
    setNativeTextPopup(null);

    try {
      const { pdfDoc, state } = await loadPdfDocument(selected);
      setPdfProxy(pdfDoc);
      setPdfState(state);

      const initialAnnotations: Record<number, AnnotationItem[]> = {};
      state.pages.forEach((p) => {
        initialAnnotations[p.pageIndex] = [];
      });
      setAnnotations(initialAnnotations);
      setHistory([initialAnnotations]);
      setHistoryIdx(0);

      trackEvent({
        type: 'tool_use',
        toolId: 'pdf-editor',
        toolName: 'PDF Düzenleyici',
        fileSizeBefore: selected.size,
      });
    } catch (err) {
      console.error('PDF load error:', err);
      alert(isEnglish ? 'Failed to read PDF document.' : 'PDF belgesi yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Render Base PDF Canvas + Text Layer
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

  // Redraw Freehand Overlay Canvas
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

    // Render stored drawings & lines
    for (const item of pageAnnotations) {
      if (item.type === 'draw' || item.type === 'highlighter') {
        if (item.points && item.points.length >= 2) {
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = item.color || '#000000';
          ctx.lineWidth = (item.strokeWidth || (item.type === 'highlighter' ? 18 : 3)) * currentScale;
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

    // Render active drawing interaction preview
    if (isDrawingInteraction) {
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

        if (activeTool === 'replace') {
          // Guided dashed blue selection box for text replacement
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
          ctx.fillRect(x, y, w, h);
        } else if (activeTool === 'whiteout') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(x, y, w, h);
        } else if (activeTool === 'redact') {
          ctx.fillStyle = '#000000';
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
        } else if (activeTool === 'arrow' && dragStartPoint && currentPoints.length > 0) {
          const p1 = { x: dragStartPoint.x * currentScale, y: dragStartPoint.y * currentScale };
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
      ctx.restore();
    }
  }, [
    pdfState,
    currentPageIndex,
    annotations,
    isDrawingInteraction,
    currentPoints,
    currentBox,
    activeTool,
    color,
    strokeWidth,
    dragStartPoint,
  ]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  useEffect(() => {
    drawFreehandOverlay();
  }, [drawFreehandOverlay]);

  // Convert mouse event coordinates to original unscaled PDF coordinates
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

  // Check Native Text Selection on the PDF Canvas
  const checkNativeTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !baseCanvasRef.current || !pdfState) {
      setNativeTextPopup(null);
      return;
    }

    const selectedStr = selection.toString().trim();
    if (!selectedStr || selectedStr.length < 2) {
      setNativeTextPopup(null);
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const canvasRect = baseCanvasRef.current.getBoundingClientRect();
      const pageInfo = pdfState.pages[currentPageIndex];
      if (!pageInfo) return;

      if (
        rect.left < canvasRect.left - 10 ||
        rect.right > canvasRect.right + 10 ||
        rect.top < canvasRect.top - 10 ||
        rect.bottom > canvasRect.bottom + 10
      ) {
        setNativeTextPopup(null);
        return;
      }

      const scaleFactor = pageInfo.originalWidth / baseCanvasRef.current.width;
      const unscaledX = (rect.left - canvasRect.left) * scaleFactor;
      const unscaledY = (rect.top - canvasRect.top) * scaleFactor;
      const unscaledW = rect.width * scaleFactor;
      const unscaledH = rect.height * scaleFactor;

      setNativeTextPopup({
        text: selectedStr,
        x: Math.max(0, unscaledX),
        y: Math.max(0, unscaledY),
        width: Math.max(20, unscaledW),
        height: Math.max(14, unscaledH),
        screenX: rect.left + rect.width / 2,
        screenY: rect.top - 10,
      });
    } catch {
      setNativeTextPopup(null);
    }
  };

  // Launch In-Place Replacement from Native Selection
  const handleLaunchInPlaceFromNative = () => {
    if (!nativeTextPopup || !pdfState) return;

    const estimatedFontSize = Math.max(11, Math.min(36, Math.round(nativeTextPopup.height * 0.9)));

    setInPlaceEditor({
      isOpen: true,
      isNew: true,
      x: nativeTextPopup.x,
      y: nativeTextPopup.y,
      width: Math.max(60, nativeTextPopup.width),
      height: Math.max(20, nativeTextPopup.height),
      text: nativeTextPopup.text,
      fontSize: estimatedFontSize,
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#000000',
      fillColor: '#ffffff', // Clean whiteout mask
      isBold: false,
      isItalic: false,
      align: 'left',
      screenX: nativeTextPopup.screenX,
      screenY: nativeTextPopup.screenY,
    });

    setNativeTextPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  // Launch In-Place Redact from Native Selection
  const handleRedactNativeText = () => {
    if (!nativeTextPopup || !pdfState) return;

    const redactId = 'ann_redact_' + Date.now();
    const redactBox: AnnotationItem = {
      id: redactId,
      type: 'redact',
      pageIndex: currentPageIndex,
      x: Math.max(0, nativeTextPopup.x - 2),
      y: Math.max(0, nativeTextPopup.y - 2),
      width: nativeTextPopup.width + 4,
      height: nativeTextPopup.height + 4,
      color: '#000000',
      opacity: 1.0,
    };

    const updated = {
      ...annotations,
      [currentPageIndex]: [...(annotations[currentPageIndex] || []), redactBox],
    };

    setAnnotations(updated);
    pushToHistory(updated);
    setNativeTextPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  // Apply and Save In-Place Text (creates high-fidelity text annotation with seamless whiteout mask)
  const handleApplyInPlaceText = () => {
    if (!inPlaceEditor || !inPlaceEditor.text.trim()) {
      setInPlaceEditor(null);
      return;
    }

    const calculatedWidth = Math.max(
      inPlaceEditor.width || 60,
      inPlaceEditor.text.length * (inPlaceEditor.fontSize * 0.6) + 12
    );
    const calculatedHeight = Math.max(
      inPlaceEditor.height || 20,
      inPlaceEditor.fontSize * 1.35
    );

    if (inPlaceEditor.isNew) {
      const newItem: AnnotationItem = {
        id: 'ann_text_' + Date.now(),
        type: 'text',
        pageIndex: currentPageIndex,
        x: inPlaceEditor.x,
        y: inPlaceEditor.y,
        width: calculatedWidth,
        height: calculatedHeight,
        text: inPlaceEditor.text,
        fontSize: inPlaceEditor.fontSize,
        fontFamily: inPlaceEditor.fontFamily,
        color: inPlaceEditor.color,
        fillColor: inPlaceEditor.fillColor,
        isBold: inPlaceEditor.isBold,
        isItalic: inPlaceEditor.isItalic,
        align: inPlaceEditor.align,
        opacity: 1.0,
      };

      const updated = {
        ...annotations,
        [currentPageIndex]: [...(annotations[currentPageIndex] || []), newItem],
      };
      setAnnotations(updated);
      pushToHistory(updated);
    } else if (inPlaceEditor.itemId) {
      const updatedList = (annotations[currentPageIndex] || []).map((item) => {
        if (item.id === inPlaceEditor.itemId) {
          return {
            ...item,
            text: inPlaceEditor.text,
            fontSize: inPlaceEditor.fontSize,
            fontFamily: inPlaceEditor.fontFamily,
            color: inPlaceEditor.color,
            fillColor: inPlaceEditor.fillColor,
            isBold: inPlaceEditor.isBold,
            isItalic: inPlaceEditor.isItalic,
            align: inPlaceEditor.align,
            width: calculatedWidth,
            height: calculatedHeight,
          };
        }
        return item;
      });
      const updated = { ...annotations, [currentPageIndex]: updatedList };
      setAnnotations(updated);
      pushToHistory(updated);
    }

    setInPlaceEditor(null);
    setSelectedAnnotationId(null);
    setActiveTool('select');
  };

  // Canvas Mouse Interaction Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pdfState) return;
    const coords = getPdfCoords(e);

    if (activeTool === 'select') {
      setSelectedAnnotationId(null);
      setInPlaceEditor(null);
      return;
    }

    if (activeTool === 'text') {
      // Add text at click position
      const clientRect = baseCanvasRef.current?.getBoundingClientRect();
      const screenX = clientRect ? e.clientX : window.innerWidth / 2;
      const screenY = clientRect ? e.clientY : window.innerHeight / 2;

      setInPlaceEditor({
        isOpen: true,
        isNew: true,
        x: coords.x,
        y: coords.y,
        width: 140,
        height: 28,
        text: '',
        fontSize,
        fontFamily,
        color,
        fillColor: 'transparent',
        isBold,
        isItalic,
        align: textAlign,
        screenX,
        screenY,
      });
      return;
    }

    // For replace, pen, highlighter, whiteout, redact, shapes
    setIsDrawingInteraction(true);
    setDragStartPoint(coords);
    setCurrentPoints([coords]);

    if (['replace', 'whiteout', 'redact', 'rect', 'circle'].includes(activeTool)) {
      setCurrentBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingInteraction || !dragStartPoint) return;
    const coords = getPdfCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'arrow') {
      setCurrentPoints((pts) => [...pts, coords]);
    } else if (['replace', 'whiteout', 'redact', 'rect', 'circle'].includes(activeTool)) {
      const x = Math.min(dragStartPoint.x, coords.x);
      const y = Math.min(dragStartPoint.y, coords.y);
      const width = Math.abs(coords.x - dragStartPoint.x);
      const height = Math.abs(coords.y - dragStartPoint.y);
      setCurrentBox({ x, y, width, height });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingInteraction || !dragStartPoint || !pdfState) {
      setIsDrawingInteraction(false);
      setDragStartPoint(null);
      setCurrentBox(null);
      return;
    }

    const coords = getPdfCoords(e);
    const boxX = Math.min(dragStartPoint.x, coords.x);
    const boxY = Math.min(dragStartPoint.y, coords.y);
    const boxW = Math.max(Math.abs(coords.x - dragStartPoint.x), 10);
    const boxH = Math.max(Math.abs(coords.y - dragStartPoint.y), 10);

    if (activeTool === 'replace') {
      // Open in-place precision replacement popover
      const clientRect = baseCanvasRef.current?.getBoundingClientRect();
      const pageInfo = pdfState.pages[currentPageIndex];
      const scaleRatio = clientRect && pageInfo ? clientRect.width / pageInfo.originalWidth : 1;

      const screenX = clientRect ? clientRect.left + (boxX + boxW / 2) * scaleRatio : e.clientX;
      const screenY = clientRect ? clientRect.top + boxY * scaleRatio : e.clientY;
      const autoFontSize = Math.max(11, Math.min(48, Math.round(boxH * 0.85)));

      setInPlaceEditor({
        isOpen: true,
        isNew: true,
        x: boxX,
        y: boxY,
        width: Math.max(80, boxW),
        height: Math.max(22, boxH),
        text: '',
        fontSize: autoFontSize,
        fontFamily,
        color,
        fillColor: '#ffffff', // Seamless whiteout background
        isBold,
        isItalic,
        align: textAlign,
        screenX,
        screenY,
      });

      setIsDrawingInteraction(false);
      setDragStartPoint(null);
      setCurrentBox(null);
      return;
    }

    if (activeTool === 'whiteout') {
      const whiteoutId = 'ann_whiteout_' + Date.now();
      const whiteoutItem: AnnotationItem = {
        id: whiteoutId,
        type: 'redact',
        pageIndex: currentPageIndex,
        x: boxX,
        y: boxY,
        width: boxW,
        height: boxH,
        color: '#ffffff',
        opacity: 1.0,
      };

      const updated = {
        ...annotations,
        [currentPageIndex]: [...(annotations[currentPageIndex] || []), whiteoutItem],
      };
      setAnnotations(updated);
      pushToHistory(updated);
      setSelectedAnnotationId(whiteoutId);
      setActiveTool('select');
    } else if (activeTool === 'redact') {
      const redactId = 'ann_redact_' + Date.now();
      const redactItem: AnnotationItem = {
        id: redactId,
        type: 'redact',
        pageIndex: currentPageIndex,
        x: boxX,
        y: boxY,
        width: boxW,
        height: boxH,
        color: '#000000',
        opacity: 1.0,
      };

      const updated = {
        ...annotations,
        [currentPageIndex]: [...(annotations[currentPageIndex] || []), redactItem],
      };
      setAnnotations(updated);
      pushToHistory(updated);
      setSelectedAnnotationId(redactId);
      setActiveTool('select');
    } else if (activeTool === 'rect' || activeTool === 'circle') {
      const shapeId = `ann_${activeTool}_${Date.now()}`;
      const shapeItem: AnnotationItem = {
        id: shapeId,
        type: activeTool,
        pageIndex: currentPageIndex,
        x: boxX,
        y: boxY,
        width: boxW,
        height: boxH,
        color,
        fillColor: 'transparent',
        strokeWidth,
        opacity: 1.0,
      };

      const updated = {
        ...annotations,
        [currentPageIndex]: [...(annotations[currentPageIndex] || []), shapeItem],
      };
      setAnnotations(updated);
      pushToHistory(updated);
      setSelectedAnnotationId(shapeId);
      setActiveTool('select');
    } else if (activeTool === 'pen' || activeTool === 'highlighter') {
      if (currentPoints.length >= 2) {
        const drawId = `ann_${activeTool}_${Date.now()}`;
        const drawItem: AnnotationItem = {
          id: drawId,
          type: activeTool === 'highlighter' ? 'highlighter' : 'draw',
          pageIndex: currentPageIndex,
          x: 0,
          y: 0,
          points: currentPoints,
          color,
          strokeWidth: activeTool === 'highlighter' ? 18 : strokeWidth,
          opacity: activeTool === 'highlighter' ? 0.35 : 1.0,
        };

        const updated = {
          ...annotations,
          [currentPageIndex]: [...(annotations[currentPageIndex] || []), drawItem],
        };
        setAnnotations(updated);
        pushToHistory(updated);
      }
    } else if (activeTool === 'arrow') {
      if (currentPoints.length >= 2) {
        const arrowId = `ann_arrow_${Date.now()}`;
        const arrowItem: AnnotationItem = {
          id: arrowId,
          type: 'arrow',
          pageIndex: currentPageIndex,
          x: 0,
          y: 0,
          points: [dragStartPoint, currentPoints[currentPoints.length - 1]],
          color,
          strokeWidth,
          opacity: 1.0,
        };

        const updated = {
          ...annotations,
          [currentPageIndex]: [...(annotations[currentPageIndex] || []), arrowItem],
        };
        setAnnotations(updated);
        pushToHistory(updated);
      }
    }

    setIsDrawingInteraction(false);
    setDragStartPoint(null);
    setCurrentPoints([]);
    setCurrentBox(null);
  };

  // Object Dragging & Resizing Handlers
  const startDragObject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
    setInPlaceEditor(null);
    setNativeTextPopup(null);

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
      initialW: item.width || 100,
      initialH: item.height || 40,
    });
  };

  const handleGlobalPointerMove = (e: React.MouseEvent) => {
    if (!pdfState || !baseCanvasRef.current) return;
    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo) return;

    const scaleFactor = pageInfo.originalWidth / baseCanvasRef.current.width;

    if (draggingState) {
      const deltaX = (e.clientX - draggingState.startX) * scaleFactor;
      const deltaY = (e.clientY - draggingState.startY) * scaleFactor;

      const updatedList = (annotations[currentPageIndex] || []).map((item) => {
        if (item.id === draggingState.id) {
          return {
            ...item,
            x: Math.max(0, Math.min(pageInfo.originalWidth - 20, draggingState.initialItemX + deltaX)),
            y: Math.max(0, Math.min(pageInfo.originalHeight - 20, draggingState.initialItemY + deltaY)),
          };
        }
        return item;
      });
      setAnnotations({ ...annotations, [currentPageIndex]: updatedList });
    } else if (resizingState) {
      const deltaX = (e.clientX - resizingState.startX) * scaleFactor;
      const deltaY = (e.clientY - resizingState.startY) * scaleFactor;

      const updatedList = (annotations[currentPageIndex] || []).map((item) => {
        if (item.id === resizingState.id) {
          let newX = resizingState.initialX;
          let newY = resizingState.initialY;
          let newW = resizingState.initialW;
          let newH = resizingState.initialH;

          if (resizingState.handle.includes('e')) newW = Math.max(20, resizingState.initialW + deltaX);
          if (resizingState.handle.includes('s')) newH = Math.max(14, resizingState.initialH + deltaY);
          if (resizingState.handle.includes('w')) {
            newW = Math.max(20, resizingState.initialW - deltaX);
            newX = resizingState.initialX + deltaX;
          }
          if (resizingState.handle.includes('n')) {
            newH = Math.max(14, resizingState.initialH - deltaY);
            newY = resizingState.initialY + deltaY;
          }

          return { ...item, x: newX, y: newY, width: newW, height: newH };
        }
        return item;
      });
      setAnnotations({ ...annotations, [currentPageIndex]: updatedList });
    }
  };

  const handleGlobalPointerUp = () => {
    if (draggingState || resizingState) {
      pushToHistory(annotations);
      setDraggingState(null);
      setResizingState(null);
    }
  };

  // Edit existing text item
  const handleEditTextItem = (item: AnnotationItem) => {
    if (!baseCanvasRef.current || !pdfState) return;
    const clientRect = baseCanvasRef.current.getBoundingClientRect();
    const pageInfo = pdfState.pages[currentPageIndex];
    const scaleRatio = clientRect && pageInfo ? clientRect.width / pageInfo.originalWidth : 1;

    const screenX = clientRect ? clientRect.left + (item.x + (item.width || 60) / 2) * scaleRatio : window.innerWidth / 2;
    const screenY = clientRect ? clientRect.top + item.y * scaleRatio : window.innerHeight / 2;

    setInPlaceEditor({
      isOpen: true,
      isNew: false,
      itemId: item.id,
      x: item.x,
      y: item.y,
      width: item.width || 80,
      height: item.height || 28,
      text: item.text || '',
      fontSize: item.fontSize || 16,
      fontFamily: item.fontFamily || 'Inter, system-ui, sans-serif',
      color: item.color || '#000000',
      fillColor: item.fillColor || 'transparent',
      isBold: !!item.isBold,
      isItalic: !!item.isItalic,
      align: item.align || 'left',
      screenX,
      screenY,
    });
  };

  // Delete & Duplicate handlers
  const handleDeleteSelected = () => {
    if (!selectedAnnotationId) return;
    const updated = {
      ...annotations,
      [currentPageIndex]: (annotations[currentPageIndex] || []).filter((a) => a.id !== selectedAnnotationId),
    };
    setAnnotations(updated);
    pushToHistory(updated);
    setSelectedAnnotationId(null);
  };

  const handleDuplicateSelected = () => {
    if (!selectedItem) return;
    const newId = `ann_${selectedItem.type}_${Date.now()}`;
    const duplicate: AnnotationItem = {
      ...selectedItem,
      id: newId,
      x: selectedItem.x + 15,
      y: selectedItem.y + 15,
    };
    const updated = {
      ...annotations,
      [currentPageIndex]: [...(annotations[currentPageIndex] || []), duplicate],
    };
    setAnnotations(updated);
    pushToHistory(updated);
    setSelectedAnnotationId(newId);
  };

  // Signature Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile || !pdfState) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      const pageInfo = pdfState.pages[currentPageIndex];
      const imgId = 'ann_img_' + Date.now();
      const newImgItem: AnnotationItem = {
        id: imgId,
        type: 'image',
        pageIndex: currentPageIndex,
        x: pageInfo ? pageInfo.originalWidth / 2 - 80 : 100,
        y: pageInfo ? pageInfo.originalHeight / 2 - 40 : 100,
        width: 160,
        height: 80,
        imageDataUrl: dataUrl,
        opacity: 1.0,
      };

      const updated = {
        ...annotations,
        [currentPageIndex]: [...(annotations[currentPageIndex] || []), newImgItem],
      };
      setAnnotations(updated);
      pushToHistory(updated);
      setSelectedAnnotationId(imgId);
      setActiveTool('select');
    };
    reader.readAsDataURL(imgFile);
  };

  // Rotate / Delete Page
  const handleRotatePage = (clockwise = true) => {
    if (!pdfState) return;
    const delta = clockwise ? 90 : -90;
    const updatedPages = pdfState.pages.map((p, idx) => {
      if (idx === currentPageIndex) {
        return { ...p, rotation: (p.rotation + delta + 360) % 360 };
      }
      return p;
    });
    setPdfState({ ...pdfState, pages: updatedPages });
  };

  const handleDeletePage = () => {
    if (!pdfState) return;
    const activePages = pdfState.pages.filter((p) => !p.deleted);
    if (activePages.length <= 1) {
      alert(isEnglish ? 'Cannot delete the only remaining page.' : 'Son kalan sayfayı silemezsiniz.');
      return;
    }

    const updatedPages = pdfState.pages.map((p, idx) => {
      if (idx === currentPageIndex) {
        return { ...p, deleted: true };
      }
      return p;
    });
    setPdfState({ ...pdfState, pages: updatedPages });

    const nextActive = updatedPages.findIndex((p, idx) => !p.deleted && idx > currentPageIndex);
    if (nextActive !== -1) {
      setCurrentPageIndex(nextActive);
    } else {
      const prevActive = updatedPages.findLastIndex((p) => !p.deleted);
      if (prevActive !== -1) setCurrentPageIndex(prevActive);
    }
  };

  // Export PDF (Lossless Vector & High-Res Overlay)
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

  // Export Current Page as Image
  const handleDownloadCurrentPageImage = () => {
    if (!baseCanvasRef.current || !pdfState || !file) return;

    const pageInfo = pdfState.pages[currentPageIndex];
    if (!pageInfo) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = baseCanvasRef.current.width * 2;
    exportCanvas.height = baseCanvasRef.current.height * 2;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);
    ctx.drawImage(baseCanvasRef.current, 0, 0);

    if (overlayCanvasRef.current) {
      ctx.drawImage(overlayCanvasRef.current, 0, 0);
    }

    const currentScale = baseCanvasRef.current.width / pageInfo.originalWidth;
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
  const currentScaleRatio = baseCanvasRef.current && activePageInfo
    ? baseCanvasRef.current.width / activePageInfo.originalWidth
    : zoomScale;

  const pageObjectAnnotations = (annotations[currentPageIndex] || []).filter(
    (item) => ['text', 'image', 'rect', 'circle', 'redact'].includes(item.type)
  );

  return (
    <div
      className="w-full max-w-[1640px] mx-auto px-3 sm:px-6 lg:px-8 py-5 flex flex-col flex-1 select-none"
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
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr from-red-600 via-rose-500 to-indigo-600 shadow-md">
              <FileText size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-text">
                  {isEnglish ? 'PDF Editor & In-Place Text Replacer' : 'PDF Düzenleyici & Metin Değiştirici'}
                </h1>
                <span className="text-[10.5px] font-bold text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 shadow-sm">
                  {isEnglish ? 'Ultra HD 300 DPI' : 'Ultra HD 300 DPI'}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {isEnglish
                  ? 'Replace text in place without losing quality, add signatures, redact data directly in browser.'
                  : 'Metinleri görüntü kalitesi bozulmadan tam yerinde değiştirin, imzaları sürükleyin, verileri gizleyin.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Bar */}
        {pdfState && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => signatureInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all"
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
              title={isEnglish ? 'Export page as PNG' : 'Sayfayı PNG Kaydet'}
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

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs flex items-center justify-center transition-colors"
              title={isEnglish ? 'Open New PDF' : 'Yeni PDF Aç'}
            >
              <Upload size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      {/* Main Workspace Area */}
      {!pdfState ? (
        // Upload Empty State
        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-zinc-300 hover:border-red-500/60 rounded-3xl p-8 bg-zinc-50/50 hover:bg-red-50/10 transition-all">
          <input
            type="file"
            id="pdf-upload-input"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="pdf-upload-input"
            className="flex flex-col items-center justify-center cursor-pointer text-center max-w-md w-full"
          >
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 mb-5 shadow-sm">
              <FileText size={38} strokeWidth={1.75} />
            </div>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">
              {isEnglish ? 'Choose a PDF file to Edit' : 'Düzenlemek için bir PDF seçin'}
            </h2>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              {isEnglish
                ? 'Modify text directly in-place without distortion, add electronic signatures, erase or redact content. 100% private, runs offline in your browser.'
                : 'Metinleri bozulmadan doğrudan yerinde değiştirin, e-imza ekleyin, silin veya sansürleyin. %100 gizli, dosyalarınız sunucuya gitmez.'}
            </p>
            <span className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md hover:brightness-105 transition-all">
              {loading ? (isEnglish ? 'Reading PDF...' : 'PDF Okunuyor...') : (isEnglish ? 'Browse File' : 'Dosya Seçin')}
            </span>
          </label>
        </div>
      ) : (
        // Active PDF Editor Workspace
        <div className="flex-1 flex flex-col lg:flex-row gap-4 items-stretch">
          {/* Left Sidebar: Page Thumbnails & Page Management */}
          <div className="w-full lg:w-48 bg-white rounded-3xl border border-zinc-200/80 p-3.5 flex flex-col gap-3 shadow-sm max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-zinc-700">
                {isEnglish ? 'Pages' : 'Sayfalar'} ({activePages.length})
              </span>
              <button
                onClick={handleDeletePage}
                className="text-red-500 hover:text-red-700 text-xs p-1 rounded hover:bg-red-50"
                title={isEnglish ? 'Delete Current Page' : 'Bu Sayfayı Sil'}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {pdfState.pages.map((p, idx) => {
                if (p.deleted) return null;
                const isActive = idx === currentPageIndex;
                const pageAnnsCount = (annotations[idx] || []).length;

                return (
                  <button
                    key={p.pageIndex}
                    onClick={() => {
                      setCurrentPageIndex(idx);
                      setSelectedAnnotationId(null);
                      setInPlaceEditor(null);
                      setNativeTextPopup(null);
                    }}
                    className={`group relative flex flex-col items-center rounded-2xl border-2 p-2 transition-all text-left ${
                      isActive
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50'
                    }`}
                  >
                    <div className="w-full aspect-[1/1.4] bg-white rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 font-bold text-xs relative overflow-hidden">
                      <span>{p.pageNumber}</span>
                      {pageAnnsCount > 0 && (
                        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-600 mt-1.5">
                      {isEnglish ? 'Page' : 'Sayfa'} {p.pageNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Workspace */}
          <div className="flex-1 flex flex-col gap-3">
            {/* MAIN TOOLBAR */}
            <div className="bg-white rounded-2xl border border-zinc-200/90 p-2 flex items-center justify-between gap-2 shadow-sm flex-wrap">
              {/* Tool Selector Buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                {/* 1. Select / Move */}
                <button
                  onClick={() => {
                    setActiveTool('select');
                    setInPlaceEditor(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTool === 'select'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Select & Move' : 'Seç & Taşı'}
                >
                  <MousePointer size={14} />
                  <span>{isEnglish ? 'Select' : 'Seç / Taşı'}</span>
                </button>

                {/* 2. In-Place Text Precision Replacer */}
                <button
                  onClick={() => {
                    setActiveTool('replace');
                    setSelectedAnnotationId(null);
                    setInPlaceEditor(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTool === 'replace'
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                      : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100'
                  }`}
                  title={isEnglish ? 'Precision Text Replacement' : 'Hassas Metin Değiştir'}
                >
                  <Edit3 size={14} />
                  <span>{isEnglish ? 'Replace Text' : 'Metin Değiştir / Düzelt'}</span>
                </button>

                {/* 3. Add New Text */}
                <button
                  onClick={() => {
                    setActiveTool('text');
                    setSelectedAnnotationId(null);
                    setInPlaceEditor(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTool === 'text'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Add New Text' : 'Yeni Metin Ekle'}
                >
                  <Type size={14} />
                  <span>{isEnglish ? 'Add Text' : 'Metin Ekle'}</span>
                </button>

                <div className="h-5 w-px bg-zinc-200 mx-1 hidden sm:block" />

                {/* 4. Whiteout / Eraser */}
                <button
                  onClick={() => {
                    setActiveTool('whiteout');
                    setSelectedAnnotationId(null);
                    setInPlaceEditor(null);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTool === 'whiteout'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Whiteout / Erase original text' : 'Beyazlatıcı / Orijinal Yazıyı Kapat'}
                >
                  <Eraser size={14} />
                  <span className="hidden sm:inline">{isEnglish ? 'Whiteout' : 'Beyazlat / Sil'}</span>
                </button>

                {/* 5. Pen */}
                <button
                  onClick={() => {
                    setActiveTool('pen');
                    setSelectedAnnotationId(null);
                    setInPlaceEditor(null);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTool === 'pen'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Pen' : 'Kalem'}
                >
                  <Pen size={14} />
                </button>

                {/* 6. Highlighter */}
                <button
                  onClick={() => {
                    setActiveTool('highlighter');
                    setSelectedAnnotationId(null);
                    setInPlaceEditor(null);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTool === 'highlighter'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Highlighter' : 'Vurgulayıcı'}
                >
                  <Highlighter size={14} className="text-amber-500" />
                </button>

                {/* 7. Redact */}
                <button
                  onClick={() => {
                    setActiveTool('redact');
                    setSelectedAnnotationId(null);
                    setInPlaceEditor(null);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTool === 'redact'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Blackout / Redact' : 'Sansürle / Gizle'}
                >
                  <ShieldAlert size={14} className="text-zinc-900" />
                </button>

                {/* 8. Shapes */}
                <button
                  onClick={() => {
                    setActiveTool('rect');
                    setSelectedAnnotationId(null);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTool === 'rect'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Rectangle' : 'Kutu'}
                >
                  <Square size={14} />
                </button>

                <button
                  onClick={() => {
                    setActiveTool('circle');
                    setSelectedAnnotationId(null);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTool === 'circle'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Circle' : 'Daire'}
                >
                  <Circle size={14} />
                </button>

                <button
                  onClick={() => {
                    setActiveTool('arrow');
                    setSelectedAnnotationId(null);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTool === 'arrow'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={isEnglish ? 'Arrow' : 'Ok'}
                >
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Undo / Redo & Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={undo}
                  disabled={historyIdx <= 0}
                  className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                  title={isEnglish ? 'Undo' : 'Geri Al'}
                >
                  <Undo2 size={15} />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIdx >= history.length - 1}
                  className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                  title={isEnglish ? 'Redo' : 'İleri Al'}
                >
                  <Redo2 size={15} />
                </button>

                <div className="h-4 w-px bg-zinc-200 mx-1" />

                <button
                  onClick={() => setZoomScale((z) => Math.max(0.7, z - 0.2))}
                  className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors"
                  title={isEnglish ? 'Zoom Out' : 'Uzaklaştır'}
                >
                  <ZoomOut size={15} />
                </button>
                <span className="text-xs font-bold text-zinc-600 min-w-[38px] text-center">
                  {(zoomScale * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors"
                  title={isEnglish ? 'Zoom In' : 'Yakınlaştır'}
                >
                  <ZoomIn size={15} />
                </button>
              </div>
            </div>

            {/* Quick Context Tip Banner when Tool is Active */}
            {activeTool === 'replace' && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2 flex items-center justify-between text-xs text-blue-900 font-medium animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>
                    {isEnglish
                      ? '🎯 Drag a box over the text or number on the PDF to replace it in-place with zero quality loss.'
                      : '🎯 PDF üzerindeki değiştirmek istediğiniz kelime veya sayının üzerini kutu içine alın, anında kusursuzca değişsin.'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTool('select')}
                  className="text-blue-700 hover:text-blue-900 font-bold"
                >
                  {isEnglish ? 'Cancel' : 'Vazgeç'}
                </button>
              </div>
            )}

            {/* STAGE WORKSPACE CANVAS */}
            <div
              ref={containerRef}
              onClick={(e) => {
                // If clicked outside canvas/objects, clear selection
                if (e.target === containerRef.current) {
                  setSelectedAnnotationId(null);
                  setInPlaceEditor(null);
                  setNativeTextPopup(null);
                }
              }}
              className="flex-1 bg-zinc-100/90 rounded-3xl border border-zinc-200/80 p-6 flex flex-col items-center justify-start overflow-auto min-h-[640px] relative shadow-inner"
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
                  onMouseUp={checkNativeTextSelection}
                  className={`textLayer ${activeTool === 'select' ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 5,
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                  }}
                />

                {/* 3. Freehand Drawing & Tool Overlay Canvas */}
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className={`absolute inset-0 z-10 ${
                    activeTool === 'select'
                      ? 'pointer-events-none'
                      : activeTool === 'replace'
                      ? 'cursor-crosshair pointer-events-auto'
                      : activeTool === 'text'
                      ? 'cursor-text pointer-events-auto'
                      : 'cursor-crosshair pointer-events-auto'
                  }`}
                />

                {/* 4. Interactive Object Layer (High-Resolution Visual Rendering) */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  {pageObjectAnnotations.map((item) => {
                    const isSelected = item.id === selectedAnnotationId;
                    const scaledX = item.x * currentScaleRatio;
                    const scaledY = item.y * currentScaleRatio;
                    const scaledW = (item.width || 100) * currentScaleRatio;
                    const scaledH = (item.height || 30) * currentScaleRatio;

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
                            ? 'ring-2 ring-blue-500 shadow-xl cursor-move bg-white/5'
                            : 'cursor-pointer hover:ring-1 hover:ring-blue-300'
                        }`}
                        style={{
                          left: `${scaledX}px`,
                          top: `${scaledY}px`,
                          width: `${scaledW}px`,
                          height: `${scaledH}px`,
                        }}
                      >
                        {/* Text Object Rendering */}
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
                                textAlign: item.align || 'left',
                              }}
                            >
                              {item.text || ''}
                            </div>
                          </div>
                        )}

                        {/* Image / Signature Rendering */}
                        {item.type === 'image' && item.imageDataUrl && (
                          <img
                            src={item.imageDataUrl}
                            alt="Signature"
                            className="w-full h-full object-contain pointer-events-none select-none"
                            draggable={false}
                          />
                        )}

                        {/* Whiteout / Redact Block Rendering */}
                        {item.type === 'redact' && (
                          <div
                            className="w-full h-full rounded-sm"
                            style={{ backgroundColor: item.color || '#000000' }}
                          />
                        )}

                        {/* Shapes Rendering */}
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

                        {/* Floating Action Menu over Selected Object */}
                        {isSelected && (
                          <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white rounded-xl px-2.5 py-1 flex items-center gap-2 shadow-2xl z-40 text-xs whitespace-nowrap"
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedAnnotationId(null)}
                              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                              title={isEnglish ? 'Done / Finish Editing' : '✓ Tamam / Onayla'}
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
                                  title={isEnglish ? 'Edit' : 'Düzenle'}
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
                {nativeTextPopup && activeTool === 'select' && (
                  <div
                    className="fixed z-50 bg-zinc-950/95 backdrop-blur text-white rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 border border-zinc-700 animate-fadeIn"
                    style={{
                      left: `${nativeTextPopup.screenX}px`,
                      top: `${nativeTextPopup.screenY - 38}px`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <button
                      onClick={handleLaunchInPlaceFromNative}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <Edit3 size={13} />
                      <span>{isEnglish ? 'Replace Text' : 'Metni Değiştir'}</span>
                    </button>
                    <button
                      onClick={handleRedactNativeText}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-all"
                    >
                      <ShieldAlert size={13} />
                      <span>{isEnglish ? 'Censor' : 'Sansürle'}</span>
                    </button>
                    <button
                      onClick={() => setNativeTextPopup(null)}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="Kapat"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Page Navigator */}
              <div className="sticky bottom-4 mt-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 shadow-xl flex items-center gap-3 z-30">
                <button
                  onClick={() => {
                    setCurrentPageIndex((p) => Math.max(0, p - 1));
                    setSelectedAnnotationId(null);
                    setNativeTextPopup(null);
                    setInPlaceEditor(null);
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
                    setNativeTextPopup(null);
                    setInPlaceEditor(null);
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

      {/* ── IN-PLACE PRECISION TEXT REPLACEMENT POPOVER / MODAL ── */}
      {inPlaceEditor?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-zinc-200 space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {inPlaceEditor.isNew
                      ? (isEnglish ? 'In-Place Text Precision Replacer' : 'Yerinde Hassas Metin Değiştirici')
                      : (isEnglish ? 'Edit Text Content' : 'Metni Düzenle')}
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {isEnglish ? '300 DPI Crisp Vector Output' : '300 DPI Net Baskı & Görüntü Kalitesi'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInPlaceEditor(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                <span>{isEnglish ? 'New Text / Numbers:' : 'Yeni Metin / Sayı:'}</span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {isEnglish ? 'Press Enter to Apply' : 'Enter: Uygula | Shift+Enter: Alt Satır'}
                </span>
              </label>
              <textarea
                autoFocus
                rows={2}
                value={inPlaceEditor.text}
                onChange={(e) => setInPlaceEditor({ ...inPlaceEditor, text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleApplyInPlaceText();
                  } else if (e.key === 'Escape') {
                    setInPlaceEditor(null);
                  }
                }}
                placeholder={isEnglish ? 'Type replacement text here...' : 'Yeni metni veya tutarı buraya yazın...'}
                className="w-full px-3.5 py-2.5 border-2 border-blue-500/80 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 font-medium resize-none shadow-inner"
                style={{
                  fontFamily: inPlaceEditor.fontFamily,
                  color: inPlaceEditor.color,
                  fontWeight: inPlaceEditor.isBold ? 'bold' : 'normal',
                  fontStyle: inPlaceEditor.isItalic ? 'italic' : 'normal',
                  textAlign: inPlaceEditor.align,
                }}
              />
            </div>

            {/* Typography Controls: Font & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">
                  {isEnglish ? 'Font Family:' : 'Yazı Tipi:'}
                </label>
                <select
                  value={inPlaceEditor.fontFamily}
                  onChange={(e) => setInPlaceEditor({ ...inPlaceEditor, fontFamily: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 bg-white"
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
                  {isEnglish ? 'Font Size:' : 'Punto (Boyut):'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setInPlaceEditor({ ...inPlaceEditor, fontSize: Math.max(8, inPlaceEditor.fontSize - 1) })}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                  >
                    <Minus size={13} />
                  </button>
                  <input
                    type="number"
                    value={inPlaceEditor.fontSize}
                    onChange={(e) => setInPlaceEditor({ ...inPlaceEditor, fontSize: Number(e.target.value) || 16 })}
                    className="w-16 px-1.5 py-1 border border-zinc-200 rounded-lg text-xs font-bold text-center"
                  />
                  <button
                    onClick={() => setInPlaceEditor({ ...inPlaceEditor, fontSize: Math.min(90, inPlaceEditor.fontSize + 1) })}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Styling, Color & Background Mask */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-3 gap-2 flex-wrap">
              {/* Color */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-600 mr-1">
                  {isEnglish ? 'Color:' : 'Renk:'}
                </span>
                {COLOR_PALETTE.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    onClick={() => setInPlaceEditor({ ...inPlaceEditor, color: c })}
                    className={`w-5 h-5 rounded-full border border-black/10 flex items-center justify-center transition-transform ${
                      inPlaceEditor.color === c ? 'scale-125 ring-2 ring-blue-500 shadow-md' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {inPlaceEditor.color === c && (
                      <Check size={10} className="text-white" />
                    )}
                  </button>
                ))}
              </div>

              {/* Bold / Italic / Align */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setInPlaceEditor({ ...inPlaceEditor, isBold: !inPlaceEditor.isBold })}
                  className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                    inPlaceEditor.isBold ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => setInPlaceEditor({ ...inPlaceEditor, isItalic: !inPlaceEditor.isItalic })}
                  className={`px-2.5 py-1 rounded-lg italic font-serif text-xs ${
                    inPlaceEditor.isItalic ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}
                  title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => {
                    const aligns: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
                    const nextAlign = aligns[(aligns.indexOf(inPlaceEditor.align) + 1) % 3];
                    setInPlaceEditor({ ...inPlaceEditor, align: nextAlign });
                  }}
                  className="p-1 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  title="Align"
                >
                  {inPlaceEditor.align === 'center' ? <AlignCenter size={14} /> : inPlaceEditor.align === 'right' ? <AlignRight size={14} /> : <AlignLeft size={14} />}
                </button>
              </div>
            </div>

            {/* Background Masking Option (Whiteout under text) */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-zinc-800 block">
                  {isEnglish ? 'Whiteout Mask' : 'Alt Metni Kapat (Whiteout)'}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {isEnglish ? 'Hides the old original text seamlessly.' : 'Eski yazının alttan görünmesini engeller.'}
                </span>
              </div>
              <button
                onClick={() =>
                  setInPlaceEditor({
                    ...inPlaceEditor,
                    fillColor: inPlaceEditor.fillColor === '#ffffff' ? 'transparent' : '#ffffff',
                  })
                }
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  inPlaceEditor.fillColor === '#ffffff'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {inPlaceEditor.fillColor === '#ffffff'
                  ? (isEnglish ? 'Active' : 'Açık')
                  : (isEnglish ? 'Off' : 'Kapalı')}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setInPlaceEditor(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                {isEnglish ? 'Cancel' : 'İptal'}
              </button>
              <button
                onClick={handleApplyInPlaceText}
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Check size={14} />
                <span>{isEnglish ? '✓ Apply & Done' : '✓ Uygula & Tamamla'}</span>
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
