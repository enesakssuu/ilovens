import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ShieldCheck, Zap, HelpCircle, CheckCircle2, Award } from 'lucide-react';
import { TOOL_SEO_DATA } from '../data/toolSeoData';
import SEO from './SEO';

interface ToolSEOContentProps {
  toolId: string;
}

export default function ToolSEOContent({ toolId }: ToolSEOContentProps) {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const data = TOOL_SEO_DATA[toolId];
  if (!data) return null;

  const title = isEnglish ? data.titleEn : data.titleTr;
  const description = isEnglish ? data.metaDescEn : data.metaDescTr;
  const keywords = isEnglish ? data.keywordsEn : data.keywordsTr;
  const heading = isEnglish ? data.headingEn : data.headingTr;
  const subheading = isEnglish ? data.subheadingEn : data.subheadingTr;
  const features = isEnglish ? data.featuresEn : data.featuresTr;
  const howTo = isEnglish ? data.howToEn : data.howToTr;
  const faqs = isEnglish ? data.faqsEn : data.faqsTr;
  const privacyGuarantee = isEnglish ? data.privacyGuaranteeEn : data.privacyGuaranteeTr;

  const breadcrumbs = [
    { name: isEnglish ? 'Home' : 'Ana Sayfa', url: isEnglish ? '/en' : '/' },
    { name: isEnglish ? 'Tools' : 'Araçlar', url: isEnglish ? '/en' : '/' },
    { name: title.split('—')[0].trim(), url: isEnglish ? `/en/${toolId}` : `/${toolId}` },
  ];

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        canonicalPath={isEnglish ? `/en/${toolId}` : `/${toolId}`}
        faqs={faqs}
        breadcrumbs={breadcrumbs}
        pageType="WebApplication"
      />

      <section className="mt-16 pt-12 border-t border-zinc-200/70 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Main Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
            <Award size={13} />
            <span>{isEnglish ? 'Privacy-First Web Utility' : 'Güvenli & Hızlı Tarayıcı Aracı'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-snug">
            {heading}
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base mt-2 leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-1">{feat.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How-To Step By Step */}
        <div className="bg-gradient-to-br from-zinc-50 via-white to-zinc-50 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 mb-12">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span>{isEnglish ? 'How to Use in 3 Simple Steps' : '3 Kolay Adımda Nasıl Kullanılır?'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {howTo.map((item) => (
              <div key={item.step} className="relative">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center mb-3 shadow">
                  {item.step}
                </div>
                <h4 className="text-sm font-bold text-zinc-900 mb-1">{item.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Zero-Upload Assurance Banner */}
        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/70 p-5 flex items-start sm:items-center gap-3 mb-12">
          <ShieldCheck size={24} className="text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
            {privacyGuarantee}
          </p>
        </div>

        {/* Sıkça Sorulan Sorular (FAQ) Accordion */}
        {faqs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle size={20} className="text-brand-purple" />
              <h3 className="text-xl font-bold text-zinc-900">
                {isEnglish ? 'Frequently Asked Questions (FAQ)' : 'Sıkça Sorulan Sorular'}
              </h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-900 hover:text-indigo-600 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
                          isOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 bg-zinc-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
