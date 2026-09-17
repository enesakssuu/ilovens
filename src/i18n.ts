import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      nav: {
        brand: 'iLoveNS',
        tagline: 'Görsel Araçları',
        switchLang: 'English',
      },
      home: {
        hero: 'Görselleriniz İçin',
        heroAccent: 'Her Şey Burada.',
        heroSub: 'Sıkıştır, yeniden boyutlandır, dönüştür ve filigran ekle. Ücretsiz, hızlı ve yerel. Tüm işlemler tarayıcında gerçekleşir.',
        tools: 'Araçlar',
        compress: {
          title: 'Görseli Sıkıştır',
          desc: 'Kaliteyi koruyarak dosya boyutunu küçült.',
        },
        resize: {
          title: 'Görseli Yeniden Boyutlandır',
          desc: 'Piksel cinsinden tam boyut kontrolü.',
        },
        convert: {
          title: 'Format Dönüştür',
          desc: 'JPG, PNG, WebP arasında geçiş yap.',
        },
        watermark: {
          title: 'Filigran Ekle',
          desc: 'Görsellerine metin filigranı yerleştir.',
        },
        badge: 'Ücretsiz & Sunucusuz',
        badgeSub: 'Görselleriniz hiçbir zaman bizim sunucularımıza gönderilmez.',
      },
      dropzone: {
        title: 'Görselinizi Buraya Bırakın',
        subtitle: 'ya da dosya seçmek için tıklayın',
        hint: 'JPG, PNG, WebP, GIF desteklenir',
        change: 'Dosyayı Değiştir',
        dragging: 'Dosyayı Bırakın!',
      },
      compress: {
        title: 'Görseli Sıkıştır',
        subtitle: 'Kalite seviyesini ayarlayarak dosya boyutunu küçültün.',
        qualityLabel: 'Kalite',
        before: 'Orijinal Boyut',
        after: 'Sıkıştırılmış Boyut',
        saving: 'Tasarruf',
        btn: 'Sıkıştır ve İndir',
        processing: 'İşleniyor...',
      },
      resize: {
        title: 'Yeniden Boyutlandır',
        subtitle: 'Piksel cinsinden genişlik ve yüksekliği girin.',
        widthLabel: 'Genişlik (px)',
        heightLabel: 'Yükseklik (px)',
        lockRatio: 'Oranı Kilitle',
        btn: 'Boyutlandır ve İndir',
        processing: 'İşleniyor...',
      },
      convert: {
        title: 'Format Dönüştür',
        subtitle: 'Görselinizi farklı bir formata dönüştürün.',
        targetFormat: 'Hedef Format',
        btn: 'Dönüştür ve İndir',
        processing: 'İşleniyor...',
      },
      watermark: {
        title: 'Filigran Ekle',
        subtitle: 'Görselinize metin filigranı ekleyin.',
        textLabel: 'Filigran Metni',
        textPlaceholder: 'Örn: © 2025 Şirketim',
        positionLabel: 'Konum',
        positions: {
          bottomRight: 'Sağ Alt',
          bottomLeft: 'Sol Alt',
          topRight: 'Sağ Üst',
          topLeft: 'Sol Üst',
          center: 'Merkez',
        },
        btn: 'Filigran Ekle ve İndir',
        processing: 'İşleniyor...',
      },
      pdf: {
        title: 'PDF Düzenleyici',
        subtitle: 'Metin ekle, imza at, vurgula, sansürle ve sayfaları yönet.',
        addText: 'Metin Ekle',
        sign: 'İmza Ekle',
        redact: 'Sansürle',
        downloadPdf: 'PDF İndir',
      },
      common: {
        back: 'Ana Sayfa',
        download: 'İndir',
        preview: 'Önizleme',
        original: 'Orijinal',
        result: 'Sonuç',
      },
    },
  },
  en: {
    translation: {
      nav: {
        brand: 'iLoveNS',
        tagline: 'Image Tools',
        switchLang: 'Türkçe',
      },
      home: {
        hero: 'Everything For',
        heroAccent: 'Your Images.',
        heroSub: 'Compress, resize, convert, and watermark. Free, fast and local. All processing happens in your browser.',
        tools: 'Tools',
        compress: {
          title: 'Compress Image',
          desc: 'Reduce file size while preserving quality.',
        },
        resize: {
          title: 'Resize Image',
          desc: 'Full pixel-precise dimension control.',
        },
        convert: {
          title: 'Convert Format',
          desc: 'Switch between JPG, PNG, and WebP.',
        },
        watermark: {
          title: 'Add Watermark',
          desc: 'Stamp text watermarks onto your images.',
        },
        badge: 'Free & Serverless',
        badgeSub: 'Your images are never sent to our servers.',
      },
      dropzone: {
        title: 'Drop Your Image Here',
        subtitle: 'or click to browse files',
        hint: 'JPG, PNG, WebP, GIF supported',
        change: 'Change File',
        dragging: 'Release to Upload!',
      },
      compress: {
        title: 'Compress Image',
        subtitle: 'Adjust the quality slider to reduce file size.',
        qualityLabel: 'Quality',
        before: 'Original Size',
        after: 'Compressed Size',
        saving: 'Savings',
        btn: 'Compress & Download',
        processing: 'Processing...',
      },
      resize: {
        title: 'Resize Image',
        subtitle: 'Enter the desired width and height in pixels.',
        widthLabel: 'Width (px)',
        heightLabel: 'Height (px)',
        lockRatio: 'Lock Ratio',
        btn: 'Resize & Download',
        processing: 'Processing...',
      },
      convert: {
        title: 'Convert Format',
        subtitle: 'Convert your image to a different format.',
        targetFormat: 'Target Format',
        btn: 'Convert & Download',
        processing: 'Processing...',
      },
      watermark: {
        title: 'Add Watermark',
        subtitle: 'Add a text watermark to your image.',
        textLabel: 'Watermark Text',
        textPlaceholder: 'e.g. © 2025 MyCompany',
        positionLabel: 'Position',
        positions: {
          bottomRight: 'Bottom Right',
          bottomLeft: 'Bottom Left',
          topRight: 'Top Right',
          topLeft: 'Top Left',
          center: 'Center',
        },
        btn: 'Add Watermark & Download',
        processing: 'Processing...',
      },
      pdf: {
        title: 'PDF Editor',
        subtitle: 'Add text, sign, highlight, redact confidential data and manage pages.',
        addText: 'Add Text',
        sign: 'Add Signature',
        redact: 'Redact',
        downloadPdf: 'Download PDF',
      },
      common: {
        back: 'Home',
        download: 'Download',
        preview: 'Preview',
        original: 'Original',
        result: 'Result',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
