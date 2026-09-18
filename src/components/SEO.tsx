import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath?: string;
  toolType?: string;
  faqs?: FAQItem[];
  breadcrumbs?: BreadcrumbItem[];
  ogImage?: string;
  pageType?: 'website' | 'article' | 'WebApplication';
}

export default function SEO({
  title,
  description,
  keywords = [],
  canonicalPath,
  toolType = 'UtilitiesApplication',
  faqs = [],
  breadcrumbs = [],
  ogImage = 'https://enesakssuu.github.io/ilovens/logo-icon.png',
  pageType = 'website',
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    // 1. Set Title
    document.title = title;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMeta('description', description);
    if (keywords.length > 0) {
      setMeta('keywords', keywords.join(', '));
    }
    setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('author', 'iLoveNS');

    // 3. Canonical Link
    const currentOrigin = window.location.origin;
    const path = canonicalPath || location.pathname;
    const fullCanonicalUrl = `${currentOrigin}/ilovens${path === '/' ? '' : path.startsWith('/') ? path : '/' + path}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullCanonicalUrl);

    // 4. OpenGraph Tags
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', fullCanonicalUrl, true);
    setMeta('og:type', pageType === 'WebApplication' ? 'website' : pageType, true);
    setMeta('og:site_name', 'iLoveNS', true);
    setMeta('og:image', ogImage, true);

    // 5. Twitter Card Tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // 6. Structured Data (JSON-LD)
    const jsonLdId = 'seo-structured-data-jsonld';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = jsonLdId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemas: Record<string, any>[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'iLoveNS',
        url: 'https://enesakssuu.github.io/ilovens/',
        logo: 'https://enesakssuu.github.io/ilovens/logo-icon.png',
        description: 'Ücretsiz, hızlı ve 100% tarayıcı tabanlı PDF ve görsel işleme araçları platformu.',
        sameAs: [
          'https://github.com/enesakssuu/ilovens',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: title.split('—')[0].trim(),
        url: fullCanonicalUrl,
        applicationCategory: toolType,
        operatingSystem: 'All (Web Browser, Windows, macOS, Linux, iOS, Android)',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: description,
        featureList: [
          '100% Client-Side Private Processing (No Server Uploads)',
          'High Performance & Zero Data Storage',
          'Free & Unlimited Usage',
        ],
      },
    ];

    // FAQ Schema
    if (faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    // Breadcrumb Schema
    if (breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((bc, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: bc.name,
          item: bc.url.startsWith('http') ? bc.url : `${currentOrigin}/ilovens${bc.url.startsWith('/') ? bc.url : '/' + bc.url}`,
        })),
      });
    }

    scriptTag.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : { '@context': 'https://schema.org', '@graph': schemas });

    return () => {
      // Clean up structured data on unmount if necessary
    };
  }, [title, description, keywords, canonicalPath, toolType, faqs, breadcrumbs, ogImage, pageType, location.pathname]);

  return null;
}
