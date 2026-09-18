import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Cookie, Shield, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function CookiePolicy() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const title = isEnglish
    ? 'Cookie Policy — iLoveNS'
    : 'Çerez Politikası — iLoveNS';
  const description = isEnglish
    ? 'Understand how cookies are used on iLoveNS, including third-party advertising cookies from Google AdSense and analytics.'
    : 'iLoveNS çerez politikası. Google AdSense reklam çerezleri, oturum tercihleri ve çerez yönetimi hakkında aydınlatma.';

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonicalPath={isEnglish ? '/en/cookies' : '/cookies'}
        breadcrumbs={[
          { name: isEnglish ? 'Home' : 'Ana Sayfa', url: isEnglish ? '/en' : '/' },
          { name: isEnglish ? 'Cookie Policy' : 'Çerez Politikası', url: isEnglish ? '/en/cookies' : '/cookies' },
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
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center">
            <Cookie size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              {isEnglish ? 'Cookie Policy' : 'Çerez Politikası'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {isEnglish ? 'Last Updated: September 2026' : 'Son Güncelleme: Eylül 2026'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="card p-6 sm:p-10 space-y-8 text-zinc-700 text-sm leading-relaxed border border-zinc-200/80 shadow-sm bg-white rounded-3xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Cookie size={18} className="text-amber-600" />
              <span>{isEnglish ? '1. What are Cookies?' : '1. Çerez Nedir?'}</span>
            </h2>
            <p>
              {isEnglish
                ? 'Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently, deliver enhanced user preferences (such as your chosen language), and provide reporting information.'
                : 'Çerezler (cookies), ziyaret ettiğiniz web siteleri tarafından cihazınıza kaydedilen küçük metin dosyalarıdır. Web sitelerinin daha verimli çalışmasını sağlamak, dil gibi kullanıcı tercihlerini hatırlamak ve analitik raporlar oluşturmak için yaygın olarak kullanılır.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Shield size={18} className="text-amber-600" />
              <span>{isEnglish ? '2. Types of Cookies We Use' : '2. Kullandığımız Çerez Türleri'}</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>{isEnglish ? 'Essential & Preference Cookies: ' : 'Zorunlu ve Tercih Çerezleri: '}</strong>
                {isEnglish
                  ? 'Used to remember your UI theme or language (Turkish / English) selection.'
                  : 'Sitede yaptığınız dil (Türkçe / İngilizce) ve temel arayüz tercihlerinizi hatırlamak için kullanılır.'}
              </li>
              <li>
                <strong>{isEnglish ? 'Advertising & Monetization Cookies (Google AdSense): ' : 'Reklam Çerezleri (Google AdSense): '}</strong>
                {isEnglish
                  ? 'Google uses cookies to serve ads based on prior visits. These include Google DART cookies to serve interest-based ads.'
                  : 'Google ve yetkili iş ortakları, önceki ziyaretlerinize dayanarak ilgi alanlarınıza uygun reklamlar göstermek için çerezleri (Google DART çerezi dahil) kullanabilir.'}
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">
              {isEnglish ? '3. How to Manage and Disable Cookies' : '3. Çerezleri Nasıl Yönetebilir veya Kapatabilirsiniz?'}
            </h2>
            <p>
              {isEnglish
                ? 'You can control and manage cookies in various ways via your browser settings (Chrome, Safari, Firefox, Edge). Please note that removing or blocking cookies may impact your user experience.'
                : 'Kullandığınız internet tarayıcısının (Chrome, Safari, Firefox, Edge vb.) ayarlar menüsünden çerezleri dilediğiniz zaman silebilir, engelleyebilir veya bildirim alacak şekilde yapılandırabilirsiniz.'}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
