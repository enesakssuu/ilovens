import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileCheck, AlertCircle, ArrowLeft, Scale } from 'lucide-react';
import SEO from '../components/SEO';

export default function TermsOfService() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const title = isEnglish
    ? 'Terms of Service — iLoveNS'
    : 'Kullanım Şartları — iLoveNS';
  const description = isEnglish
    ? 'Read the terms and conditions for using iLoveNS free PDF and image processing tools.'
    : 'iLoveNS ücretsiz online PDF ve görsel işleme araçları kullanım koşulları ve yasal şartlar.';

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonicalPath={isEnglish ? '/en/terms' : '/terms'}
        breadcrumbs={[
          { name: isEnglish ? 'Home' : 'Ana Sayfa', url: isEnglish ? '/en' : '/' },
          { name: isEnglish ? 'Terms of Service' : 'Kullanım Şartları', url: isEnglish ? '/en/terms' : '/terms' },
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
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-2xl flex items-center justify-center">
            <Scale size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              {isEnglish ? 'Terms of Service' : 'Kullanım Şartları'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {isEnglish ? 'Last Updated: September 2026' : 'Son Güncelleme: Eylül 2026'}
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="card p-6 sm:p-10 space-y-8 text-zinc-700 text-sm leading-relaxed border border-zinc-200/80 shadow-sm bg-white rounded-3xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileCheck size={18} className="text-blue-600" />
              <span>{isEnglish ? '1. Acceptance of Terms' : '1. Şartların Kabulü'}</span>
            </h2>
            <p>
              {isEnglish
                ? 'By accessing and utilizing iLoveNS ("the Service"), you agree to be bound by these Terms of Service and all applicable laws. If you disagree with any part of these terms, you may not use our services.'
                : 'iLoveNS ("Hizmet") web sitesini ve araçlarını kullanarak bu Kullanım Şartları\'nı ve yürürlükteki tüm yasal düzenlemeleri kabul etmiş sayılırsınız. Bu şartların herhangi birini kabul etmiyorsanız siteyi kullanmamalısınız.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Scale size={18} className="text-blue-600" />
              <span>{isEnglish ? '2. Permitted Use & Intellectual Property' : '2. İzin Verilen Kullanım ve Fikri Mülkiyet'}</span>
            </h2>
            <p>
              {isEnglish
                ? 'iLoveNS grants you a personal, worldwide, royalty-free, non-assignable and non-exclusive license to use the tools. You retain 100% full ownership, rights, and copyright to all files, documents, and images processed through the Service.'
                : 'iLoveNS, web tabanlı araçları kişisel ve ticari projelerinizde ücretsiz kullanmanız için yetki verir. İşlediğiniz tüm PDF belgeleri ve görsellerin fikri mülkiyet ve telif hakları tamamen size aittir; iLoveNS dosyalarınız üzerinde hiçbir hak iddia etmez.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              <span>{isEnglish ? '3. Disclaimer of Warranties & Limitation of Liability' : '3. Sorumluluk Reddi'}</span>
            </h2>
            <p>
              {isEnglish
                ? 'The Service is provided "as is" and "as available" without warranty of any kind, express or implied. While we strive to provide reliable and high-precision tools, iLoveNS shall not be liable for any direct, indirect, incidental, or consequential loss resulting from the use or inability to use the Service.'
                : 'Hizmet "olduğu gibi" ve "mevcut olduğu şekilde" sağlanır. iLoveNS, araçların kesintisiz veya hatasız çalışacağına dair garanti vermez. Kullanıcılar önemli belgelerini işlemeden önce her zaman yedeklerini almalıdır.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">
              {isEnglish ? '4. Modifications to Terms' : '4. Şartlarda Değişiklik'}
            </h2>
            <p>
              {isEnglish
                ? 'We reserve the right to modify or replace these Terms at any time. Continued use of the Service following any changes constitutes acceptance of those changes.'
                : 'iLoveNS, bu koşulları dilediği zaman güncelleme hakkını saklı tutar. Değişiklikler sitede yayınlandığı andan itibaren geçerli olur.'}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
