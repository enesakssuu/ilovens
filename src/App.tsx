import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MeshBackground from './components/MeshBackground';
import Home from './pages/Home';
import CompressTool from './pages/CompressTool';
import ResizeTool from './pages/ResizeTool';
import ConvertTool from './pages/ConvertTool';
import WatermarkTool from './pages/WatermarkTool';
import CropTool from './pages/CropTool';
import RotateTool from './pages/RotateTool';
import SvgOptimizeTool from './pages/SvgOptimizeTool';
import ExifRemoverTool from './pages/ExifRemoverTool';
import HeicToJpgTool from './pages/HeicToJpgTool';
import HtmlToImageTool from './pages/HtmlToImageTool';
import MemeTool from './pages/MemeTool';
import BlurFaceTool from './pages/BlurFaceTool';
import ColorPaletteTool from './pages/ColorPaletteTool';
import PhotoEditorTool from './pages/PhotoEditorTool';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const toolRoutes = [
  { path: 'compress', element: <CompressTool /> },
  { path: 'resize', element: <ResizeTool /> },
  { path: 'crop', element: <CropTool /> },
  { path: 'rotate', element: <RotateTool /> },
  { path: 'svg-optimize', element: <SvgOptimizeTool /> },
  { path: 'exif-remover', element: <ExifRemoverTool /> },
  { path: 'convert', element: <ConvertTool /> },
  { path: 'heic-to-jpg', element: <HeicToJpgTool /> },
  { path: 'html-to-image', element: <HtmlToImageTool /> },
  { path: 'watermark', element: <WatermarkTool /> },
  { path: 'meme', element: <MemeTool /> },
  { path: 'blur-face', element: <BlurFaceTool /> },
  { path: 'color-palette', element: <ColorPaletteTool /> },
  { path: 'photo-editor', element: <PhotoEditorTool /> },
];

const validPaths = new Set([
  '/', '/en',
  ...toolRoutes.map((r) => `/${r.path}`),
  ...toolRoutes.map((r) => `/en/${r.path}`),
]);

function LangWrapper() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  const cleanPath = pathname.replace(/\/$/, '') || '/';
  const is404 = !validPaths.has(cleanPath);

  useEffect(() => {
    const isEn = pathname.startsWith('/en');
    const resolvedLang = isEn ? 'en' : 'tr';
    if (i18n.language !== resolvedLang) {
      i18n.changeLanguage(resolvedLang);
    }
  }, [pathname, i18n]);

  return (
    <div className="min-h-screen flex flex-col">
      <MeshBackground />
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!is404 && <Footer />}
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter basename="/ilovens">
      <ScrollToTop />
      <Routes>
        <Route element={<LangWrapper />}>
          {/* Turkish (Default) Routes */}
          <Route path="/" element={<Home />} />
          {toolRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}

          {/* English Routes */}
          <Route path="/en" element={<Home />} />
          {toolRoutes.map((r) => (
            <Route key={`en-${r.path}`} path={`en/${r.path}`} element={r.element} />
          ))}

          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
