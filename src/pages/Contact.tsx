import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Send, CheckCircle2, ArrowLeft, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function Contact() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const basePath = isEnglish ? '/en' : '';

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, submit to backend or email service.
    setSubmitted(true);
  };

  const title = isEnglish
    ? 'Contact Us & Support — iLoveNS'
    : 'İletişim & Destek — iLoveNS';
  const description = isEnglish
    ? 'Get in touch with the iLoveNS team for feedback, tool feature requests, business inquiries, or technical support.'
    : 'iLoveNS ekibi ile iletişime geçin. Geri bildirimleriniz, yeni araç talepleriniz ve teknik destek için bize ulaşın.';

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonicalPath={isEnglish ? '/en/contact' : '/contact'}
        breadcrumbs={[
          { name: isEnglish ? 'Home' : 'Ana Sayfa', url: isEnglish ? '/en' : '/' },
          { name: isEnglish ? 'Contact' : 'İletişim', url: isEnglish ? '/en/contact' : '/contact' },
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
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Mail size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              {isEnglish ? 'Contact Us' : 'İletişim'}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isEnglish
                ? 'We would love to hear your feedback, ideas, and feature requests.'
                : 'Görüşleriniz, önerileriniz veya araç talepleriniz için bize mesaj gönderin.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Column */}
          <div className="space-y-6 md:col-span-1">
            <div className="card p-6 border border-zinc-200/80 bg-white rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-zinc-900 font-bold text-sm">
                <MessageSquare size={18} className="text-indigo-600" />
                <span>{isEnglish ? 'Direct Email' : 'Doğrudan E-Posta'}</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {isEnglish
                  ? 'Feel free to email us directly for general queries or bug reports.'
                  : 'Genel sorularınız veya hata bildirimleriniz için doğrudan e-posta yazabilirsiniz.'}
              </p>
              <a
                href="mailto:support@ilovens.com"
                className="text-xs font-bold text-indigo-600 hover:underline break-all block"
              >
                support@ilovens.com
              </a>
            </div>

            <div className="card p-6 border border-zinc-200/80 bg-white rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-3 text-zinc-900 font-bold text-sm">
                <HelpCircle size={18} className="text-indigo-600" />
                <span>{isEnglish ? 'Feedback & Tools' : 'Öneri & Araç Talebi'}</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {isEnglish
                  ? 'Have an idea for a new image or PDF tool? We are always expanding!'
                  : 'Yeni bir PDF veya görsel aracı fikriniz mi var? Sürekli yeni araçlar ekliyoruz!'}
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-2">
            <div className="card p-6 sm:p-8 border border-zinc-200/80 bg-white rounded-3xl shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {isEnglish ? 'Thank you! Message Sent.' : 'Teşekkürler! Mesajınız İletildi.'}
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    {isEnglish
                      ? 'We have received your message and will get back to you as soon as possible.'
                      : 'Mesajınızı aldık, en kısa sürede size geri dönüş yapacağız.'}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline pt-2 inline-block"
                  >
                    {isEnglish ? 'Send another message' : 'Yeni bir mesaj gönder'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        {isEnglish ? 'Your Name' : 'Adınız Soyadınız'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isEnglish ? 'John Doe' : 'Ahmet Yılmaz'}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        {isEnglish ? 'Email Address' : 'E-Posta Adresiniz'}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ornek@domain.com"
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      {isEnglish ? 'Subject' : 'Konu'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={isEnglish ? 'Bug Report / Feature Request' : 'Öneri / Hata Bildirimi / Genel'}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      {isEnglish ? 'Message' : 'Mesajınız'}
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={isEnglish ? 'How can we help you?' : 'Bize iletmek istediğiniz detayları yazın...'}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send size={16} />
                    <span>{isEnglish ? 'Send Message' : 'Mesajı Gönder'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
