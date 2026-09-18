import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Zap, ArrowLeft, Heart, Layers } from 'lucide-react';
import SEO from '../components/SEO';

export default function AboutUs() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const title = isEnglish
    ? 'About Us — iLoveNS Privacy-First Digital Tools'
    : 'Hakkımızda — iLoveNS Gizlilik Öncelikli Dijital Araçlar';
  const description = isEnglish
    ? 'Learn about iLoveNS: our mission to provide high-speed, 100% private, browser-based PDF and image processing tools without any server uploads.'
    : 'iLoveNS hakkında: Misyonumuz, kullanıcı dosyalarını sunucuya aktarmadan 100% tarayıcıda çalışan, hızlı ve güvenli PDF ve görsel araçları sunmaktır.';

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonicalPath={isEnglish ? '/en/about' : '/about'}
        breadcrumbs={[
          { name: isEnglish ? 'Home' : 'Ana Sayfa', url: isEnglish ? '/en' : '/' },
          { name: isEnglish ? 'About Us' : 'Hakkımızda', url: isEnglish ? '/en/about' : '/about' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          to={basePath || '/'}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          {isEnglish ? 'Back to Home' : 'Ana Sayfaya Dön'}
        </Link>

        {/* Hero Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              {isEnglish ? 'About iLoveNS' : 'Hakkımızda'}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isEnglish
                ? 'Building the fastest, most private digital utility suite on the web.'
                : 'Webin en hızlı ve en güvenli tarayıcı tabanlı araç platformu.'}
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-purple-200/50 mb-10">
          <h2 className="text-xl font-extrabold text-zinc-900 mb-3">
            {isEnglish ? 'Our Mission: Privacy Meets Performance' : 'Misyonumuz: Gizlilik ve Yüksek Performans'}
          </h2>
          <p className="text-zinc-700 text-sm sm:text-base leading-relaxed">
            {isEnglish
              ? 'Most traditional online PDF and image tools upload your private documents to external cloud servers, which raises serious privacy risks and takes unnecessary upload time. iLoveNS is built on the revolutionary philosophy of 100% Client-Side Computing: your files never leave your device.'
              : 'Geleneksel online PDF ve görsel dönüştürme sitelerinin büyük çoğunluğu, yüklediğiniz kişisel veya kurumsal belgeleri kendi sunucularına aktarır. iLoveNS ise %100 İstemci Taraflı (Client-Side) mimari üzerine kurulmuştur: Dosyalarınız cihazınızdan asla ayrılmaz, sunucuya aktarılmaz ve anında işlenir.'}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 border border-zinc-200/80 bg-white rounded-3xl shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-zinc-900 text-base">
              {isEnglish ? 'Zero Server Upload' : 'Sıfır Sunucu Yükleme'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isEnglish
                ? 'Documents and images are parsed and modified locally in browser memory.'
                : 'Belgeler ve fotoğraflar sadece tarayıcınızın geçici belleğinde işlenir.'}
            </p>
          </div>

          <div className="card p-6 border border-zinc-200/80 bg-white rounded-3xl shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-zinc-900 text-base">
              {isEnglish ? 'Instant Speed' : 'Işık Hızında İşlem'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isEnglish
                ? 'No network lag or file transfer queues. Your modern CPU renders changes in milliseconds.'
                : 'Dosya yükleme ve indirme beklemesi olmadan, işlemcinizin gücüyle milisaniyeler içinde sonuç.'}
            </p>
          </div>

          <div className="card p-6 border border-zinc-200/80 bg-white rounded-3xl shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h3 className="font-bold text-zinc-900 text-base">
              {isEnglish ? 'Next-Gen Stack' : 'Modern Teknoloji'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isEnglish
                ? 'Powered by WebAssembly, PDF-lib, PDF.js, Canvas 2D, and HTML5 technology.'
                : 'WebAssembly, PDF-lib, PDF.js ve modern HTML5 standartları ile güçlendirilmiştir.'}
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="card p-6 sm:p-10 space-y-6 text-zinc-700 text-sm leading-relaxed border border-zinc-200/80 shadow-sm bg-white rounded-3xl">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Layers size={20} className="text-indigo-600" />
            <span>{isEnglish ? 'Continuous Innovation' : 'Geliştirme & İnovasyon'}</span>
          </h3>
          <p>
            {isEnglish
              ? 'iLoveNS is continuously evolving with new tools including PDF editing, format conversion, EXIF data stripping, image compression, meme generation, and facial censorship tools. We are dedicated to providing user-friendly, professional, and accessible tools worldwide.'
              : 'iLoveNS; PDF düzenleme, resim sıkıştırma, format dönüştürme, EXIF temizleme, yüz sansürleme, filigran ekleme ve renk paleti çıkarıcı gibi araçlarıyla sürekli güncellenmektedir. Amacımız tüm kullanıcılara reklamsız hissettiren temiz, modern ve son derece hızlı bir deneyim sunmaktır.'}
          </p>
          <div className="pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-400">
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            <span>{isEnglish ? 'Developed with passion for open web standards.' : 'Açık web standartlarına duyulan sevgiyle geliştirilmiştir.'}</span>
          </div>
        </div>
      </div>
    </>
  );
}
