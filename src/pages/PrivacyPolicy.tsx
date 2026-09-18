import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const title = isEnglish
    ? 'Privacy Policy — iLoveNS'
    : 'Gizlilik Politikası — iLoveNS';
  const description = isEnglish
    ? 'Learn about iLoveNS privacy practices. We process files 100% locally in your browser with zero server uploads and comply with Google AdSense, GDPR, and KVKK.'
    : 'iLoveNS gizlilik politikası. Dosyalarınız sunucularımıza yüklenmeden 100% tarayıcınızda yerel işlenir. Google AdSense, KVKK ve GDPR uyumlu yasal aydınlatma.';

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonicalPath={isEnglish ? '/en/privacy-policy' : '/privacy-policy'}
        breadcrumbs={[
          { name: isEnglish ? 'Home' : 'Ana Sayfa', url: isEnglish ? '/en' : '/' },
          { name: isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası', url: isEnglish ? '/en/privacy-policy' : '/privacy-policy' },
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
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              {isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {isEnglish ? 'Last Updated: September 2026' : 'Son Güncelleme: Eylül 2026'}
            </p>
          </div>
        </div>

        {/* Core Guarantee Highlight Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-blue-50/30 border border-emerald-200/80 mb-10 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
            <h3 className="font-bold text-emerald-900 text-base">
              {isEnglish ? '100% Client-Side Private Processing Guarantee' : '%100 Tarayıcı Tabanlı Yerel Gizlilik Taahhüdü'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-emerald-800/90 leading-relaxed">
            {isEnglish
              ? 'At iLoveNS, your files (PDF documents, photos, images, graphics) are never transmitted to or stored on our servers. All compression, editing, format conversion, and watermarking happen entirely inside your device’s browser memory (Client-Side HTML5 / WebAssembly).'
              : 'iLoveNS platformunda yüklediğiniz PDF belgeleri, fotoğraflar ve görseller hiçbir zaman uzak sunucularımıza yüklenmez veya veritabanlarımızda depolanmaz. Tüm işlemler (sıkıştırma, dönüştürme, PDF düzenleme, sansürleme) tamamen cihazınızın tarayıcısında (HTML5 & WebAssembly) yerel olarak çalışır.'}
          </p>
        </div>

        {/* Content Sections */}
        <div className="card p-6 sm:p-10 space-y-8 text-zinc-700 text-sm leading-relaxed border border-zinc-200/80 shadow-sm bg-white rounded-3xl">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Lock size={18} className="text-indigo-600" />
              <span>{isEnglish ? '1. Information We Do NOT Collect' : '1. Toplamadığımız Veriler'}</span>
            </h2>
            <p>
              {isEnglish
                ? 'We do not collect, view, copy, or distribute any user content, including but not limited to: uploaded PDF files, images, personal photographs, text annotations, digital signatures, or confidential metadata. Once you close or refresh your browser tab, memory is cleared.'
                : 'iLoveNS, düzenlediğiniz PDF dosyalarının içeriğini, fotoğraflarınızı, eklediğiniz metinleri, dijital imzalarınızı ve görsellerinizi asla toplamaz, kaydetmez veya üçüncü şahıslarla paylaşmaz. Tarayıcı sekmesini kapattığınızda tüm veriler cihazınızın geçici belleğinden silinir.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <EyeOff size={18} className="text-indigo-600" />
              <span>{isEnglish ? '2. Cookies and Third-Party Advertising (Google AdSense)' : '2. Çerezler ve Üçüncü Taraf Reklam Ortakları (Google AdSense)'}</span>
            </h2>
            <p>
              {isEnglish
                ? 'We may use third-party advertising companies such as Google AdSense to serve ads when you visit our website. Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to serve relevant ads based on users\' prior visits to this website and other sites across the internet.'
                : 'Sitemizi ziyaret ettiğinizde reklam hizmeti sunmak için Google AdSense dahil üçüncü taraf reklam şirketlerinden faydalanabiliriz. Google, üçüncü taraf satıcı sıfatıyla sitemizde reklam yayınlamak için çerezlerden (DART çerezi dahil) yararlanır.'}
            </p>
            <p>
              {isEnglish
                ? 'Users may opt out of personalized advertising by visiting Google Ads Settings (https://www.google.com/settings/ads) or through www.aboutads.info.'
                : 'Kullanıcılar, Google Reklam Ayarları (https://www.google.com/settings/ads) sayfasını ziyaret ederek kişiselleştirilmiş reklamcılık için DART çerezi kullanımını devre dışı bırakabilirler.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              <span>{isEnglish ? '3. Log Files & Anonymous Analytics' : '3. Günlük Dosyaları ve Anonim İstatistikler'}</span>
            </h2>
            <p>
              {isEnglish
                ? 'Like many web platforms, we may log standard anonymous diagnostic technical information such as browser type, operating system, referring pages, and aggregate tool usage counts. These logs do not contain personally identifiable information (PII).'
                : 'Diğer birçok web sitesi gibi sistem kararlılığını sağlamak amacıyla tarayıcı türü, işletim sistemi, yönlendiren sayfalar ve anonim araç kullanım istatistikleri kaydedilebilir. Bu bilgiler hiçbir kişisel veriyle eşleştirilmez.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              <span>{isEnglish ? '4. GDPR and KVKK Compliance' : '4. KVKK ve GDPR Uyumluluğu'}</span>
            </h2>
            <p>
              {isEnglish
                ? 'Under the General Data Protection Regulation (GDPR) and the Turkish Law on the Protection of Personal Data (KVKK), you have the right to request information, manage cookie preferences, or contact our Data Controller for any privacy inquiries.'
                : '6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Genel Veri Koruma Yönetmeliği (GDPR) kapsamında kullanıcılarımız tüm yasal haklarına sahiptir. Çerez tercihlerinizi dilediğiniz zaman tarayıcı ayarlarınızdan yönetebilirsiniz.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">
              {isEnglish ? '5. Contact Information' : '5. İletişim'}
            </h2>
            <p>
              {isEnglish
                ? 'For any questions or concerns regarding our privacy practices, please contact us via our Contact page or by emailing support@ilovens.com.'
                : 'Gizlilik politikamızla ilgili soru, görüş ve talepleriniz için İletişim sayfamızdan veya support@ilovens.com e-posta adresimizden bize ulaşabilirsiniz.'}
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
