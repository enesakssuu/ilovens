import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import AdminDashboard from './pages/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Support #/admin, #admin, ?/admin fallback URLs strictly to /admin
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (hash.includes('admin') || search.includes('admin')) {
      if (!pathname.includes('admin')) {
        navigate('/admin', { replace: true });
      }
    }
  }, [pathname, navigate]);

  return null;
}

function LangWrapper() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    const resolvedLang = lang === 'en' ? 'en' : 'tr';
    if (i18n.language !== resolvedLang) {
      i18n.changeLanguage(resolvedLang);
    }
  }, [lang, i18n]);

  return (
    <div className="min-h-screen flex flex-col">
      <MeshBackground />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
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
  { path: 'admin', element: <AdminDashboard /> },
];

export default function App() {
  return (
    <BrowserRouter basename="/ilovens">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LangWrapper />}>
          <Route index element={<Home />} />
          {toolRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>

        <Route path="/en" element={<LangWrapper />}>
          <Route index element={<Home />} />
          {toolRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>

        {/* Direct admin route */}
        <Route path="/admin" element={<LangWrapper />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
