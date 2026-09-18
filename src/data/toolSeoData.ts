import type { FAQItem } from '../components/SEO';

export interface ToolSEOInfo {
  id: string;
  titleTr: string;
  titleEn: string;
  metaDescTr: string;
  metaDescEn: string;
  keywordsTr: string[];
  keywordsEn: string[];
  headingTr: string;
  headingEn: string;
  subheadingTr: string;
  subheadingEn: string;
  featuresTr: { title: string; desc: string }[];
  featuresEn: { title: string; desc: string }[];
  howToTr: { step: string; title: string; desc: string }[];
  howToEn: { step: string; title: string; desc: string }[];
  faqsTr: FAQItem[];
  faqsEn: FAQItem[];
  privacyGuaranteeTr: string;
  privacyGuaranteeEn: string;
}

export const TOOL_SEO_DATA: Record<string, ToolSEOInfo> = {
  'pdf-editor': {
    id: 'pdf-editor',
    titleTr: 'Online PDF Düzenleyici — Ücretsiz, Güvenli ve Tarayıcı Tabanlı PDF Editörü | iLoveNS',
    titleEn: 'Free Online PDF Editor — Edit Text, Sign, Annotate & Redact PDF in Browser | iLoveNS',
    metaDescTr: 'En iyi online ve yapay zeka uyumlu PDF düzenleme aracı. PDF dosyalarınıza metin ekleyin, imza atın, sansürleyin, sayfaları silin veya döndürün. %100 gizli, sunucusuz.',
    metaDescEn: 'The best free browser-based PDF editor. Add text, insert freehand signature, highlight, redact confidential information, rotate or delete pages with zero server uploads.',
    keywordsTr: [
      'pdf düzenleme aracı',
      'yapay zekaya pdf düzenleme aracı',
      'online pdf düzenleyici',
      'ücretsiz pdf editör',
      'pdf metin ekleme',
      'pdf yazı değiştirme',
      'pdf imza atma',
      'pdf sansürleme',
      'pdf sayfa silme',
      'pdf sayfa döndürme',
      'tarayıcıda pdf düzenleme',
      'güvenli pdf editörü',
    ],
    keywordsEn: [
      'pdf editor online',
      'free pdf editor',
      'edit pdf in browser',
      'add text to pdf',
      'sign pdf online',
      'redact pdf',
      'annotate pdf',
      'client-side pdf editor',
      'secure pdf editor without upload',
    ],
    headingTr: 'Yapay Zeka Destekli & Profesyonel Online PDF Düzenleme Aracı',
    headingEn: 'Professional Online PDF Editor & Annotation Tool',
    subheadingTr: 'Belgelerinizi üçüncü taraf sunuculara yüklemeden doğrudan tarayıcınızda güvenle düzenleyin, imzalayın ve biçimlendirin.',
    subheadingEn: 'Edit, annotate, digitally sign, and redact your confidential PDF documents directly in your web browser with 100% privacy.',
    featuresTr: [
      {
        title: 'Doğrudan Metin Ekleme ve Yazı Değiştirme',
        desc: 'PDF sayfalarınızın üzerine istediğiniz yazı tipi (font), boyut, renk ve hizalama ayarlarıyla yeni metinler ekleyin veya mevcut metinleri kapatıp güncelleyin.',
      },
      {
        title: 'Serbest Çizim & Islak İmza Entegrasyonu',
        desc: 'Sözleşme ve resmi belgelerinize dokunmatik ekran, fare veya kalemle anında kişisel dijital imzanızı yerleştirin.',
      },
      {
        title: 'Hassas Veri Sansürleme (Redaction & Whiteout)',
        desc: 'TC Kimlik no, kredi kartı, banka IBAN veya gizli adres bilgilerinizi tek tıkla kalıcı opak maskelerle sansürleyin.',
      },
      {
        title: 'Sayfa Yönetimi (Döndür, Sil, Çoğalt, Taşı)',
        desc: 'PDF sayfalarınızı 90° açılarla döndürün, gereksiz sayfaları silin, sayfaların sırasını sürükleyerek değiştirin.',
      },
      {
        title: '%100 İstemci Taraflı Gizlilik (Sıfır Sunucu Yükleme)',
        desc: 'Dosyalarınız hiçbir uzak sunucuya veya buluta yüklenmez. Tüm işleme cihazınızın RAM ve CPU gücüyle yerel olarak yapılır.',
      },
    ],
    featuresEn: [
      {
        title: 'Direct Text Editing & Insertion',
        desc: 'Add text anywhere with customizable fonts, sizes, colors, and alignments, or whiteout existing text seamlessly.',
      },
      {
        title: 'Freehand Signature & Drawing',
        desc: 'Sign contracts, NDAs, and agreements instantly using your mouse, trackpad, or touchscreen.',
      },
      {
        title: 'Confidential Redaction & Whiteout',
        desc: 'Permanently hide and redact sensitive information like ID numbers, credit cards, or personal data.',
      },
      {
        title: 'Comprehensive Page Management',
        desc: 'Reorder pages, rotate sideways documents, delete redundant pages, or duplicate key slides effortlessly.',
      },
      {
        title: '100% Client-Side Local Privacy',
        desc: 'Your files never touch external servers. Processing executes entirely inside your browser using WebAssembly & JS.',
      },
    ],
    howToTr: [
      {
        step: '1',
        title: 'PDF Dosyanızı Seçin veya Sürükleyin',
        desc: 'Düzenlemek istediğiniz PDF belgesini yükleme kutusuna sürükleyip bırakın veya cihazınızdan seçin.',
      },
      {
        step: '2',
        title: 'Araç Çubuğundan İşleminizi Seçin',
        desc: 'Metin ekleme, kalem/imza, fosforlu vurgulayıcı, sansür kutusu veya sayfa yönetim araçlarından birini tıklayın.',
      },
      {
        step: '3',
        title: 'Belgenizi Düzenleyin ve İndirin',
        desc: 'İşlemlerinizi tamamladıktan sonra "PDF İndir" butonuna tıklayarak yüksek kaliteli çıktınızı anında kaydedin.',
      },
    ],
    howToEn: [
      {
        step: '1',
        title: 'Upload or Drop Your PDF File',
        desc: 'Drag & drop your PDF file onto the workspace or click to select from your device.',
      },
      {
        step: '2',
        title: 'Select Annotation or Editing Tool',
        desc: 'Choose from text insertion, signature pad, highlighter, shape markers, or page management tools.',
      },
      {
        step: '3',
        title: 'Preview & Download Instantly',
        desc: 'Click "Download PDF" to instantly generate and save your customized document in high resolution.',
      },
    ],
    faqsTr: [
      {
        question: 'iLoveNS PDF düzenleme aracı tamamen ücretsiz mi?',
        answer: 'Evet, iLoveNS PDF Düzenleyici tamamen ücretsizdir. Hiçbir gizli ücret, abonelik veya sayfa başı kısıtlama bulunmaz.',
      },
      {
        question: 'PDF dosyam internete veya bir sunucuya yükleniyor mu?',
        answer: 'Kesinlikle hayır! iLoveNS, WebAssembly ve modern tarayıcı teknolojilerini kullanır. Dosyalarınız bilgisayarınızdan veya telefonunuzdan asla ayrılmaz, sunucuya gönderilmez.',
      },
      {
        question: 'PDF belgelerime nasıl imza ekleyebilirim?',
        answer: 'Üst araç çubuğundaki "İmza" veya "Kalem" aracını seçerek fareniz veya dokunmatik ekranınızla imzanızı çizebilir ve belgenin istediğiniz yerine boyutlandırarak yerleştirebilirsiniz.',
      },
      {
        question: 'Büyük boyutlu veya çok sayfalı PDF dosyaları destekleniyor mu?',
        answer: 'Evet, yüzlerce sayfalık PDF belgelerini bile bellek dostu motorumuz sayesinde donma olmadan hızlıca görüntüleyebilir ve düzenleyebilirsiniz.',
      },
      {
        question: 'PDF üzerindeki hassas bilgileri (TC Kimlik, IBAN vb.) nasıl gizlerim?',
        answer: 'Araç çubuğundaki "Sansürle" veya "Opak Maske" aracını seçip gizlemek istediğiniz bilginin üzerine dikdörtgen çizerek veriyi kalıcı olarak kapatabilirsiniz.',
      },
    ],
    faqsEn: [
      {
        question: 'Is the iLoveNS PDF Editor really 100% free?',
        answer: 'Yes! All PDF editing features are completely free with no watermark, no page limits, and no registration required.',
      },
      {
        question: 'Are my uploaded PDF documents secure and private?',
        answer: 'Your privacy is guaranteed because files are processed entirely in your web browser. Nothing is uploaded to any remote server or stored in the cloud.',
      },
      {
        question: 'How do I add a signature to my PDF document?',
        answer: 'Click on the Signature tool in the toolbar, draw your signature using a mouse or touchpad, and place it anywhere on your PDF.',
      },
      {
        question: 'Can I reorder or delete pages from my PDF file?',
        answer: 'Yes, the page sidebar lets you rotate, delete, or rearrange pages instantly before downloading your edited PDF.',
      },
    ],
    privacyGuaranteeTr: 'Güvenlik Taahhüdü: iLoveNS, belgelerinizin gizliliğini en üst düzeyde korur. PDF dosyalarınız sunucularımıza gitmez, tüm işlem tarayıcınızda yerel çalışır.',
    privacyGuaranteeEn: 'Privacy Commitment: iLoveNS guarantees zero server uploads. All processing takes place locally inside your browser memory.',
  },

  'compress': {
    id: 'compress',
    titleTr: 'Online Görsel Sıkıştırma — Kaliteden Ödün Vermeden Resim Boyutu Küçült | iLoveNS',
    titleEn: 'Compress Images Online — Reduce JPG, PNG & WebP File Size Free | iLoveNS',
    metaDescTr: 'JPG, PNG ve WebP görsellerinizi kaliteden ödün vermeden %90\'a kadar sıkıştırın. Ücretsiz, sınırsız ve 100% tarayıcıda çalışan resim boyutu küçültme aracı.',
    metaDescEn: 'Compress JPG, PNG, and WebP images up to 90% without losing quality. 100% browser-based, instant, and private image compression tool.',
    keywordsTr: ['görsel sıkıştırma', 'resim boyutu küçültme', 'fotoğraf sıkıştır', 'online image compressor', 'jpeg sıkıştırma', 'png boyut küçültme', 'webp sıkıştırma'],
    keywordsEn: ['compress image', 'reduce image size', 'compress jpg', 'compress png', 'online image optimizer', 'lossless photo compression'],
    headingTr: 'Akıllı Görsel ve Fotoğraf Sıkıştırma Aracı',
    headingEn: 'Smart & Instant Image Compression Tool',
    subheadingTr: 'Görsellerinizin görsel netliğini korurken dosya boyutunu saniyeler içinde küçültün.',
    subheadingEn: 'Shrink your image file size by up to 90% while keeping crisp pixel clarity.',
    featuresTr: [
      { title: 'Akıllı Kalite Algoritması', desc: 'İnsan gözünün fark edemeyeceği detayları optimize ederek maksimum tasarruf sağlar.' },
      { title: 'Tüm Popüler Formatlar', desc: 'JPG, JPEG, PNG ve yeni nesil WebP formatlarını tam destekler.' },
      { title: 'Anında Önizleme & Boyut Karşılaştırma', desc: 'Sıkıştırma öncesi ve sonrası dosya boyutunu ve tasarruf oranını anında görün.' },
    ],
    featuresEn: [
      { title: 'Smart Quality Algorithm', desc: 'Optimizes pixel density for maximum compression without visible degradation.' },
      { title: 'All Major Formats', desc: 'Full support for JPG, PNG, and next-gen WebP formats.' },
      { title: 'Realtime Size Comparison', desc: 'View original vs compressed file size and percentage saved instantly.' },
    ],
    howToTr: [
      { step: '1', title: 'Görselinizi Seçin', desc: 'Sıkıştırmak istediğiniz fotoğrafı sürükleyip bırakın.' },
      { step: '2', title: 'Kalite Ayarını Belirleyin', desc: 'Kaydırıcıyı kullanarak istediğiniz kalite oranını seçin.' },
      { step: '3', title: 'Sıkıştırın ve İndirin', desc: '"Sıkıştır ve İndir" butonuna basarak hafifletilmiş görselinizi kaydedin.' },
    ],
    howToEn: [
      { step: '1', title: 'Select Your Image', desc: 'Drag & drop the image you want to compress.' },
      { step: '2', title: 'Adjust Quality Slider', desc: 'Set your desired compression strength.' },
      { step: '3', title: 'Compress & Save', desc: 'Download your optimized lightweight image instantly.' },
    ],
    faqsTr: [
      { question: 'Görsel sıkıştırma resim kalitesini bozar mı?', answer: 'iLoveNS akıllı sıkıştırma motoru kullanır. %80 kalite ayarında bile insan gözüyle fark edilemeyecek kadar net sonuçlar elde edilir.' },
      { question: 'Maksimum dosya boyutu sınırı var mı?', answer: 'İşlemler doğrudan cihazınızda yapıldığı için dosya boyutu veya adet sınırlaması yoktur.' },
    ],
    faqsEn: [
      { question: 'Does compression reduce image quality?', answer: 'Our intelligent optimizer reduces file size significantly while retaining crisp visual fidelity.' },
      { question: 'Is there a file size limit?', answer: 'Because all processing happens on your device, there are no strict server-imposed file limits.' },
    ],
    privacyGuaranteeTr: 'Görselleriniz hiçbir sunucuya yüklenmez, doğrudan cihazınızın tarayıcısında sıkıştırılır.',
    privacyGuaranteeEn: 'Your images are never sent to external servers; compression runs locally in your browser.',
  },

  'convert': {
    id: 'convert',
    titleTr: 'Online Format Dönüştürücü — JPG, PNG, WebP Format Dönüştürme | iLoveNS',
    titleEn: 'Free Online Image Format Converter — JPG, PNG, WebP Converter | iLoveNS',
    metaDescTr: 'Görsellerinizi anında JPG, PNG ve WebP formatlarına dönüştürün. Şeffaflık korumalı, hızlı ve tamamen ücretsiz.',
    metaDescEn: 'Convert images between JPG, PNG, and WebP formats instantly with transparency support. Free and secure.',
    keywordsTr: ['format dönüştür', 'jpg png dönüştürme', 'webp dönüştürücü', 'resim formatı değiştirme', 'online image converter'],
    keywordsEn: ['image converter', 'jpg to png', 'png to webp', 'convert photo format', 'free image conversion'],
    headingTr: 'Hızlı & Kayıpsız Görsel Format Dönüştürücü',
    headingEn: 'Fast & Lossless Image Format Converter',
    subheadingTr: 'Görsellerinizi saniyeler içinde farklı dosya türlerine dönüştürün.',
    subheadingEn: 'Convert your graphics and photos between popular web formats in one click.',
    featuresTr: [
      { title: 'Şeffaflık (Alpha) Desteği', desc: 'PNG ve WebP formatlarında şeffaf arka planları kusursuz korur.' },
      { title: 'Yüksek Hız', desc: 'Tarayıcı motoru sayesinde internet yükleme beklemesi olmadan anında sonuç.' },
    ],
    featuresEn: [
      { title: 'Alpha Transparency Support', desc: 'Maintains transparent backgrounds when converting between PNG and WebP.' },
      { title: 'Instant Processing', desc: 'Local conversion ensures lightning speed without waiting for uploads.' },
    ],
    howToTr: [
      { step: '1', title: 'Resmi Yükleyin', desc: 'Dönüştürmek istediğiniz dosyayı seçin.' },
      { step: '2', title: 'Hedef Formatı Seçin', desc: 'JPG, PNG veya WebP formatlarından birini belirleyin.' },
      { step: '3', title: 'Dönüştürün & İndirin', desc: 'Tek tıkla yeni formatındaki görselinizi indirin.' },
    ],
    howToEn: [
      { step: '1', title: 'Upload Image', desc: 'Choose the file you want to convert.' },
      { step: '2', title: 'Pick Target Format', desc: 'Select JPG, PNG, or WebP.' },
      { step: '3', title: 'Download', desc: 'Save your newly formatted image instantly.' },
    ],
    faqsTr: [
      { question: 'PNG dosyasını JPG yaparsam şeffaf alanlara ne olur?', answer: 'JPG formatı şeffaflığı desteklemediği için şeffaf alanlar otomatik olarak temiz beyaz arka planla doldurulur.' },
    ],
    faqsEn: [
      { question: 'What happens to transparency when converting to JPG?', answer: 'Since JPG does not support alpha channels, transparent areas are automatically rendered with a clean white background.' },
    ],
    privacyGuaranteeTr: 'Görselleriniz gizlidir ve sunucuya aktarılmadan yerel olarak dönüştürülür.',
    privacyGuaranteeEn: 'Your images remain private and are converted locally without server transfers.',
  },

  'resize': {
    id: 'resize',
    titleTr: 'Görsel Yeniden Boyutlandırma — Piksel Bazlı Resim Boyutlandırma | iLoveNS',
    titleEn: 'Resize Image Online — Free Pixel Dimension & Scale Tool | iLoveNS',
    metaDescTr: 'Fotoğraflarınızı piksel hassasiyetinde yeniden boyutlandırın. En-boy oranını kilitleyin, sosyal medya ve web için optimize edin.',
    metaDescEn: 'Resize photos with pixel-perfect precision. Lock aspect ratio and scale for web, e-commerce, and social media.',
    keywordsTr: ['resim boyutlandır', 'görsel yeniden boyutlandırma', 'piksel küçült', 'fotoğraf ebat değiştirme', 'resize image online'],
    keywordsEn: ['resize image', 'image resizer', 'change photo resolution', 'scale image pixels'],
    headingTr: 'Hassas Görsel ve Fotoğraf Boyutlandırma',
    headingEn: 'Precision Image & Photo Resizer',
    subheadingTr: 'Genişlik ve yükseklik değerlerini piksel cinsinden dilediğiniz gibi ayarlayın.',
    subheadingEn: 'Set exact width and height dimensions with optional aspect ratio lock.',
    featuresTr: [
      { title: 'En-Boy Oranı Kilidi', desc: 'Resminizin basık veya yayvan görünmesini engelleyen akıllı oran koruyucu.' },
      { title: 'Bulanıklığı Önleyen Yeniden Örnekleme', desc: 'Boyutlandırırken keskinliği ve renk doğruluğunu korur.' },
    ],
    featuresEn: [
      { title: 'Smart Aspect Ratio Lock', desc: 'Prevents distortion by maintaining proportions automatically.' },
      { title: 'High-Fidelity Resampling', desc: 'Preserves sharp edges and accurate colors when scaling.' },
    ],
    howToTr: [
      { step: '1', title: 'Resmi Seçin', desc: 'Boyutlandırmak istediğiniz görseli yükleyin.' },
      { step: '2', title: 'Piksel Değerlerini Girin', desc: 'İstediğiniz genişlik ve yükseklik ölçülerini belirleyin.' },
      { step: '3', title: 'İndirin', desc: 'Yeniden boyutlandırılmış dosyanızı kaydedin.' },
    ],
    howToEn: [
      { step: '1', title: 'Select File', desc: 'Drop your image into the tool.' },
      { step: '2', title: 'Enter Dimensions', desc: 'Type width and height in pixels.' },
      { step: '3', title: 'Download', desc: 'Save your scaled image.' },
    ],
    faqsTr: [
      { question: 'En-boy oranını nasıl korurum?', answer: '"Oranı Kilitle" seçeneği işaretliyken genişliği değiştirdiğinizde yükseklik otomatik olarak orantılı hesaplanır.' },
    ],
    faqsEn: [
      { question: 'How do I keep the image from distorting?', answer: 'Enable "Lock Ratio" and the secondary dimension will calculate automatically in proportion.' },
    ],
    privacyGuaranteeTr: 'Tüm boyutlandırma işlemi tarayıcınızda gerçekleşir.',
    privacyGuaranteeEn: 'All scaling takes place directly in your web browser.',
  },

  'watermark': {
    id: 'watermark',
    titleTr: 'Fotoğrafa Filigran Ekleme — Telif ve Metin Damgası Yerleştir | iLoveNS',
    titleEn: 'Add Watermark to Images Online — Protect Your Photos Free | iLoveNS',
    metaDescTr: 'Fotoğraflarınıza özel metin filigranı ve telif damgası ekleyin. 5 farklı konum, şeffaflık ve yazı boyutu kontrolü.',
    metaDescEn: 'Add custom text watermarks and copyright stamps to your photos. Choose from 5 positions with customizable opacity.',
    keywordsTr: ['filigran ekle', 'fotoğrafa yazı damgala', 'telif hakkı ekleme', 'online watermark', 'resme imza ekle'],
    keywordsEn: ['add watermark', 'watermark photos', 'copyright stamp image', 'online watermark tool'],
    headingTr: 'Fotoğraf ve Görsel Filigran Ekleme Aracı',
    headingEn: 'Photo & Image Watermarking Tool',
    subheadingTr: 'Telif haklarınızı korumak için fotoğraflarınıza şık metin damgaları yerleştirin.',
    subheadingEn: 'Protect your creative work with custom watermarks in custom positions.',
    featuresTr: [
      { title: '5 Farklı Konumlandırma', desc: 'Sağ alt, sol alt, sağ üst, sol üst ve merkez konum seçenekleri.' },
      { title: 'Özelleştirilebilir Tipografi', desc: 'Metin, renk ve görünürlük ayarlarını kontrol edin.' },
    ],
    featuresEn: [
      { title: '5 Placement Options', desc: 'Bottom-right, bottom-left, top-right, top-left, and center.' },
      { title: 'Custom Typography', desc: 'Fine-tune text, color, and positioning.' },
    ],
    howToTr: [
      { step: '1', title: 'Fotoğrafınızı Yükleyin', desc: 'Filigran eklemek istediğiniz resmi seçin.' },
      { step: '2', title: 'Metin ve Konumu Belirleyin', desc: 'Telif metnini girin ve istediğiniz köşeyi seçin.' },
      { step: '3', title: 'Kaydedin', desc: 'Damgalanmış görselinizi indirin.' },
    ],
    howToEn: [
      { step: '1', title: 'Upload Image', desc: 'Drop the photo you wish to protect.' },
      { step: '2', title: 'Type Text & Position', desc: 'Input your copyright name and select anchor position.' },
      { step: '3', title: 'Save', desc: 'Download your watermarked photo.' },
    ],
    faqsTr: [
      { question: 'Filigran orijinal fotoğrafı bozar mı?', answer: 'Orijinal dosyanıza dokunulmaz, yeni damgalı bir kopya olarak indirilir.' },
    ],
    faqsEn: [
      { question: 'Does watermarking overwrite my original photo?', answer: 'No, your original file stays safe on your device and a new copy is generated.' },
    ],
    privacyGuaranteeTr: 'Fotoğraflarınız sunucuya gönderilmez, filigran yerel olarak basılır.',
    privacyGuaranteeEn: 'Your photos remain on your device; watermarking is processed in your browser.',
  },

  'heic-to-jpg': {
    id: 'heic-to-jpg',
    titleTr: 'HEIC to JPG Dönüştürücü — iPhone Fotoğraflarını JPG Yap | iLoveNS',
    titleEn: 'HEIC to JPG Converter — Convert iPhone Photos to JPG Online | iLoveNS',
    metaDescTr: 'Apple iPhone HEIC formatındaki fotoğraflarınızı anında standart JPG/JPEG formatına dönüştürün. Ücretsiz ve sunucusuz.',
    metaDescEn: 'Convert Apple HEIC photos from iPhone/iPad to universally compatible JPG format online with zero uploads.',
    keywordsTr: ['heic to jpg', 'iphone fotoğrafı jpg yapma', 'heic dönüştürücü', 'heic jpeg çevir'],
    keywordsEn: ['heic to jpg', 'convert iphone heic to jpg', 'heic converter online', 'free heic to jpeg'],
    headingTr: 'iPhone HEIC Formatından JPG Formatına Dönüştürücü',
    headingEn: 'Instant HEIC to JPG Photo Converter',
    subheadingTr: 'Apple cihazlarınızdan aktarılan HEIC fotoğraflarını her cihazda açılan standart JPG formatına çevirin.',
    subheadingEn: 'Turn iOS HEIC photos into universally supported JPG images in seconds.',
    featuresTr: [
      { title: 'Tam Renk Doğruluğu', desc: 'iPhone kamera renk profilini ve yüksek çözünürlüğü korur.' },
      { title: 'Toplu Dönüştürme Desteği', desc: 'Birden fazla HEIC dosyasını sırayla hızlıca dönüştürün.' },
    ],
    featuresEn: [
      { title: 'Full Color Fidelity', desc: 'Preserves iOS color profiles and full resolution.' },
      { title: 'Zero Cloud Uploads', desc: 'Processes directly using client-side decoding libraries.' },
    ],
    howToTr: [
      { step: '1', title: 'HEIC Dosyasını Bırakın', desc: 'iPhone veya Mac cihazınızdaki .heic dosyasını seçin.' },
      { step: '2', title: 'Dönüştürmeyi Başlatın', desc: 'Otomatik dönüştürme saniyeler içinde tamamlanır.' },
      { step: '3', title: 'JPG Olarak İndirin', desc: 'Evrensel JPG dosyanızı kaydedin.' },
    ],
    howToEn: [
      { step: '1', title: 'Drop HEIC Photo', desc: 'Select your iPhone .heic file.' },
      { step: '2', title: 'Instant Conversion', desc: 'The tool decodes and converts locally.' },
      { step: '3', title: 'Download JPG', desc: 'Save your ready-to-share JPG file.' },
    ],
    faqsTr: [
      { question: 'Neden HEIC fotoğraflarımı dönüştürmeliyim?', answer: 'HEIC formatı bazı eski Windows sürümleri, web siteleri veya e-posta servisleri tarafından desteklenmez. JPG her platformla %100 uyumludur.' },
    ],
    faqsEn: [
      { question: 'Why should I convert HEIC to JPG?', answer: 'HEIC format is not supported by older Windows versions or some websites. JPG works everywhere.' },
    ],
    privacyGuaranteeTr: 'Kişisel fotoğraflarınız cihazınızdan ayrılmaz.',
    privacyGuaranteeEn: 'Your private photos never leave your device.',
  },

  'exif-remover': {
    id: 'exif-remover',
    titleTr: 'EXIF Temizleyici — Fotoğraf Meta Verilerini ve GPS Konumunu Sil | iLoveNS',
    titleEn: 'EXIF Remover — Strip Photo Metadata & GPS Location Online | iLoveNS',
    metaDescTr: 'Fotoğraflarınızdaki gizli GPS konumu, kamera modeli, çekim tarihi ve cihaz seri numaralarını anında temizleyin. Güvenli paylaşım.',
    metaDescEn: 'Remove sensitive EXIF metadata, GPS coordinates, timestamps, and device info from photos before sharing online.',
    keywordsTr: ['exif temizleme', 'fotoğraf konum silme', 'meta veri temizleyici', 'gps verisi sil', 'gizli bilgi temizle'],
    keywordsEn: ['exif remover', 'strip photo metadata', 'remove gps from photo', 'photo privacy cleaner'],
    headingTr: 'Fotoğraf EXIF ve Konum Verisi Temizleme Aracı',
    headingEn: 'Photo EXIF & Privacy Metadata Stripper',
    subheadingTr: 'Sosyal medyada veya internette fotoğraf paylaşmadan önce gizli konumunuzu ve kişisel meta verilerinizi temizleyin.',
    subheadingEn: 'Protect your privacy by wiping embedded GPS coordinates and device specs from your images.',
    featuresTr: [
      { title: 'GPS Konumunu Sıfırlar', desc: 'Evinizin veya konumunuzun koordinatlarını fotoğraftan kalıcı olarak siler.' },
      { title: 'Kamera ve Cihaz Bilgilerini Kaldırır', desc: 'Cihaz seri numarası, lens ve çekim tarihi bilgilerini temizler.' },
    ],
    featuresEn: [
      { title: 'Wipes GPS Coordinates', desc: 'Permanently removes geographical coordinates from the image header.' },
      { title: 'Clears Hardware Details', desc: 'Strips camera serials, lens specs, and date stamps.' },
    ],
    howToTr: [
      { step: '1', title: 'Fotoğrafı Seçin', desc: 'Temizlemek istediğiniz görseli yükleyin.' },
      { step: '2', title: 'Meta Verileri İnceleyin ve Silin', desc: 'Mevcut verileri görüp tek tıkla temizleyin.' },
      { step: '3', title: 'Güvenle İndirin', desc: 'Gizliliği korunmuş yeni görselinizi kaydedin.' },
    ],
    howToEn: [
      { step: '1', title: 'Choose Photo', desc: 'Upload the photo containing metadata.' },
      { step: '2', title: 'Inspect & Strip', desc: 'Review detected metadata and strip it.' },
      { step: '3', title: 'Download Clean Photo', desc: 'Save your privacy-safe photo.' },
    ],
    faqsTr: [
      { question: 'Fotoğraflarda hangi gizli bilgiler bulunur?', answer: 'Akıllı telefonlarla çekilen fotoğraflar genellikle enlem-boylam (GPS), çekildiği gün ve saat, telefonun modeli gibi özel bilgileri barındırır.' },
    ],
    faqsEn: [
      { question: 'What hidden data do photos contain?', answer: 'Photos taken with smartphones often embed exact GPS coordinates, camera model, date/time, and aperture settings.' },
    ],
    privacyGuaranteeTr: 'Meta veri temizliği 100% cihazınızda gerçekleştirilir.',
    privacyGuaranteeEn: 'EXIF stripping is executed 100% locally on your machine.',
  },
};
