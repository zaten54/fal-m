import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  tr: {
    // Navigation
    home: "Ana Sayfa",
    coffeeReading: "Kahve Falı",
    tarot: "Tarot",
    palmReading: "El Falı",
    astrology: "Astroloji",
    comingSoon: "Yakında",
    
    // Home Page
    title: "falım",
    subtitle: "AI destekli fal uygulaması ile geleceğinizi keşfedin",
    description: "Kahve falı, tarot, el falı ve astroloji - Yapay zeka ile desteklenen geleneksel fal yorumları",
    startCoffeeReading: "Kahve Falına Başla",
    
    // Coffee Reading
    coffeeReadingTitle: "Kahve Falı",
    coffeeReadingSubtitle: "Kahve fincanınızın fotoğrafını yükleyin, AI ile falınızı okuyalım",
    uploadPhoto: "Kahve Fincanı Fotoğrafı Yükleyin",
    uploadDescription: "Kahvenizi içtikten sonra fincanınızın içindeki telvelerin fotoğrafını çekin ve buraya yükleyin",
    selectFile: "Dosya Seç",
    dragDropText: "Veya dosyayı buraya sürükleyip bırakın",
    readMyFortune: "Falımı Oku",
    analyzing: "Analiz Ediliyor...",
    change: "Değiştir",
    newReading: "Yeni Fal",
    
    // Reading Results
    fortuneReady: "Falınız Hazır!",
    symbolsFound: "Tespit Edilen Semboller",
    interpretation: "Fal Yorumu",
    readingDate: "Fal Tarihi",
    reliability: "Güvenilirlik",
    
    // Instructions
    step1Title: "Kahvenizi İçin",
    step1Desc: "Türk kahvenizi keyifle için ve fincanın dibinde telve bırakın",
    step2Title: "Fotoğraf Çekin",
    step2Desc: "Fincanın içindeki telve desenlerinin net fotoğrafını çekin",
    step3Title: "Falınızı Okuyun",
    step3Desc: "AI analizimiz ile detaylı fal yorumunuzu alın",
    
    // Features
    whyOurApp: "Neden falım?",
    aiAnalysis: "AI Destekli Analiz",
    aiAnalysisDesc: "Gemini Vision AI ile görsel analiz ve geleneksel fal yorumlarının birleşimi",
    traditionalKnowledge: "Geleneksel Bilgi",
    traditionalKnowledgeDesc: "Yüzyıllardır süregelen fal geleneklerini modern teknoloji ile buluşturuyoruz",
    privacySecurity: "Gizlilik & Güvenlik",
    privacySecurityDesc: "Verileriniz güvende - kişisel fal okumalarınız sadece size özel",
    
    // Errors
    selectValidImage: "Lütfen geçerli bir resim dosyası seçin",
    selectImageFirst: "Lütfen önce bir kahve fincanı resmi seçin",
    analysisError: "Fal analizi sırasında bir hata oluştu. Lütfen tekrar deneyin."
  },
  
  en: {
    // Navigation
    home: "Home",
    coffeeReading: "Coffee Reading",
    tarot: "Tarot",
    palmReading: "Palm Reading",
    astrology: "Astrology",
    comingSoon: "Coming Soon",
    
    // Home Page
    title: "Fortune",
    subtitle: "Discover your future with AI-powered fortune telling",
    description: "Coffee reading, tarot, palm reading and astrology - Traditional fortune interpretations powered by artificial intelligence",
    startCoffeeReading: "Start Coffee Reading",
    
    // Coffee Reading
    coffeeReadingTitle: "Coffee Reading",
    coffeeReadingSubtitle: "Upload a photo of your coffee cup and let AI read your fortune",
    uploadPhoto: "Upload Coffee Cup Photo",
    uploadDescription: "After drinking your coffee, take a clear photo of the coffee grounds inside your cup and upload it here",
    selectFile: "Select File",
    dragDropText: "Or drag and drop the file here",
    readMyFortune: "Read My Fortune",
    analyzing: "Analyzing...",
    change: "Change",
    newReading: "New Reading",
    
    // Reading Results
    fortuneReady: "Your Fortune is Ready!",
    symbolsFound: "Symbols Found",
    interpretation: "Fortune Interpretation",
    readingDate: "Reading Date",
    reliability: "Reliability",
    
    // Instructions
    step1Title: "Drink Your Coffee",
    step1Desc: "Enjoy your Turkish coffee and leave coffee grounds at the bottom of the cup",
    step2Title: "Take Photo",
    step2Desc: "Take a clear photo of the coffee ground patterns inside the cup",
    step3Title: "Read Your Fortune",
    step3Desc: "Get detailed fortune interpretation with our AI analysis",
    
    // Features
    whyOurApp: "Why Our Fortune App?",
    aiAnalysis: "AI-Powered Analysis",
    aiAnalysisDesc: "Combination of Gemini Vision AI visual analysis and traditional fortune interpretations",
    traditionalKnowledge: "Traditional Knowledge",
    traditionalKnowledgeDesc: "We bring together centuries-old fortune traditions with modern technology",
    privacySecurity: "Privacy & Security",
    privacySecurityDesc: "Your data is safe - your personal fortune readings are private to you only",
    
    // Errors
    selectValidImage: "Please select a valid image file",
    selectImageFirst: "Please select a coffee cup image first",
    analysisError: "An error occurred during fortune analysis. Please try again."
  },
  
  de: {
    // Navigation
    home: "Startseite",
    coffeeReading: "Kaffeesatz Lesen",
    tarot: "Tarot",
    palmReading: "Handlesen",
    astrology: "Astrologie",
    comingSoon: "Demnächst",
    
    // Home Page
    title: "Wahrsagen",
    subtitle: "Entdecken Sie Ihre Zukunft mit KI-gestützter Wahrsagerei",
    description: "Kaffeesatz lesen, Tarot, Handlesen und Astrologie - Traditionelle Wahrsage-Interpretationen mit künstlicher Intelligenz",
    startCoffeeReading: "Kaffeesatz Lesen Starten",
    
    // Coffee Reading
    coffeeReadingTitle: "Kaffeesatz Lesen",
    coffeeReadingSubtitle: "Laden Sie ein Foto Ihrer Kaffeetasse hoch und lassen Sie die KI Ihr Schicksal lesen",
    uploadPhoto: "Kaffeetassen-Foto Hochladen",
    uploadDescription: "Nachdem Sie Ihren Kaffee getrunken haben, machen Sie ein klares Foto vom Kaffeesatz in Ihrer Tasse",
    selectFile: "Datei Auswählen",
    dragDropText: "Oder ziehen Sie die Datei hierher",
    readMyFortune: "Mein Schicksal Lesen",
    analyzing: "Analysiere...",
    change: "Ändern",
    newReading: "Neue Lesung",
    
    // Reading Results
    fortuneReady: "Ihr Schicksal ist bereit!",
    symbolsFound: "Gefundene Symbole",
    interpretation: "Schicksals-Interpretation",
    readingDate: "Lesungsdatum",
    reliability: "Zuverlässigkeit",
    
    // Instructions
    step1Title: "Kaffee Trinken",
    step1Desc: "Genießen Sie Ihren türkischen Kaffee und lassen Sie Kaffeesatz am Boden",
    step2Title: "Foto Machen",
    step2Desc: "Machen Sie ein klares Foto der Kaffeesatz-Muster in der Tasse",
    step3Title: "Schicksal Lesen",
    step3Desc: "Erhalten Sie detaillierte Schicksals-Interpretation mit unserer KI-Analyse",
    
    // Features
    whyOurApp: "Warum Unsere Wahrsage-App?",
    aiAnalysis: "KI-Gestützte Analyse",
    aiAnalysisDesc: "Kombination aus Gemini Vision KI-Bildanalyse und traditionellen Wahrsage-Interpretationen",
    traditionalKnowledge: "Traditionelles Wissen",
    traditionalKnowledgeDesc: "Wir verbinden jahrhundertealte Wahrsage-Traditionen mit moderner Technologie",
    privacySecurity: "Datenschutz & Sicherheit",
    privacySecurityDesc: "Ihre Daten sind sicher - Ihre persönlichen Wahrsagungen sind nur für Sie bestimmt",
    
    // Errors
    selectValidImage: "Bitte wählen Sie eine gültige Bilddatei",
    selectImageFirst: "Bitte wählen Sie zuerst ein Kaffeetassen-Bild",
    analysisError: "Ein Fehler ist bei der Schicksals-Analyse aufgetreten. Bitte versuchen Sie es erneut."
  },
  
  fr: {
    // Navigation
    home: "Accueil",
    coffeeReading: "Lecture de Café",
    tarot: "Tarot",
    palmReading: "Chiromancie",
    astrology: "Astrologie",
    comingSoon: "Bientôt",
    
    // Home Page
    title: "Divination",
    subtitle: "Découvrez votre avenir avec la divination assistée par IA",
    description: "Lecture de café, tarot, chiromancie et astrologie - Interprétations divinatoires traditionnelles alimentées par l'intelligence artificielle",
    startCoffeeReading: "Commencer Lecture de Café",
    
    // Coffee Reading
    coffeeReadingTitle: "Lecture de Café",
    coffeeReadingSubtitle: "Téléchargez une photo de votre tasse de café et laissez l'IA lire votre destin",
    uploadPhoto: "Télécharger Photo de Tasse",
    uploadDescription: "Après avoir bu votre café, prenez une photo claire du marc de café dans votre tasse",
    selectFile: "Sélectionner Fichier",
    dragDropText: "Ou glissez-déposez le fichier ici",
    readMyFortune: "Lire Mon Destin",
    analyzing: "Analyse...",
    change: "Changer",
    newReading: "Nouvelle Lecture",
    
    // Reading Results
    fortuneReady: "Votre Destin est Prêt!",
    symbolsFound: "Symboles Trouvés",
    interpretation: "Interprétation du Destin",
    readingDate: "Date de Lecture",
    reliability: "Fiabilité",
    
    // Instructions
    step1Title: "Buvez Votre Café",
    step1Desc: "Savourez votre café turc et laissez le marc au fond de la tasse",
    step2Title: "Prenez Photo",
    step2Desc: "Prenez une photo claire des motifs de marc de café dans la tasse",
    step3Title: "Lisez Votre Destin",
    step3Desc: "Obtenez une interprétation détaillée du destin avec notre analyse IA",
    
    // Features
    whyOurApp: "Pourquoi Notre App de Divination?",
    aiAnalysis: "Analyse Assistée par IA",
    aiAnalysisDesc: "Combinaison de l'analyse visuelle Gemini Vision IA et des interprétations divinatoires traditionnelles",
    traditionalKnowledge: "Savoir Traditionnel",
    traditionalKnowledgeDesc: "Nous associons les traditions divinatoires séculaires à la technologie moderne",
    privacySecurity: "Confidentialité & Sécurité",
    privacySecurityDesc: "Vos données sont en sécurité - vos lectures personnelles ne sont destinées qu'à vous",
    
    // Errors
    selectValidImage: "S'il vous plaît sélectionnez un fichier image valide",
    selectImageFirst: "S'il vous plaît sélectionnez d'abord une image de tasse de café",
    analysisError: "Une erreur s'est produite lors de l'analyse du destin. Veuillez réessayer."
  },
  
  es: {
    // Navigation
    home: "Inicio",
    coffeeReading: "Lectura de Café",
    tarot: "Tarot",
    palmReading: "Quiromancia",
    astrology: "Astrología",
    comingSoon: "Próximamente",
    
    // Home Page
    title: "Adivinación",
    subtitle: "Descubre tu futuro con adivinación asistida por IA",
    description: "Lectura de café, tarot, quiromancia y astrología - Interpretaciones adivinatorias tradicionales potenciadas por inteligencia artificial",
    startCoffeeReading: "Comenzar Lectura de Café",
    
    // Coffee Reading
    coffeeReadingTitle: "Lectura de Café",
    coffeeReadingSubtitle: "Sube una foto de tu taza de café y deja que la IA lea tu fortuna",
    uploadPhoto: "Subir Foto de Taza de Café",
    uploadDescription: "Después de beber tu café, toma una foto clara de los posos de café dentro de tu taza",
    selectFile: "Seleccionar Archivo",
    dragDropText: "O arrastra y suelta el archivo aquí",
    readMyFortune: "Leer Mi Fortuna",
    analyzing: "Analizando...",
    change: "Cambiar",
    newReading: "Nueva Lectura",
    
    // Reading Results
    fortuneReady: "¡Tu Fortuna está Lista!",
    symbolsFound: "Símbolos Encontrados",
    interpretation: "Interpretación de la Fortuna",
    readingDate: "Fecha de Lectura",
    reliability: "Confiabilidad",
    
    // Instructions
    step1Title: "Bebe Tu Café",
    step1Desc: "Disfruta tu café turco y deja posos en el fondo de la taza",
    step2Title: "Toma Foto",
    step2Desc: "Toma una foto clara de los patrones de posos de café dentro de la taza",
    step3Title: "Lee Tu Fortuna",
    step3Desc: "Obtén interpretación detallada de fortuna con nuestro análisis de IA",
    
    // Features
    whyOurApp: "¿Por Qué Nuestra App de Adivinación?",
    aiAnalysis: "Análisis Asistido por IA",
    aiAnalysisDesc: "Combinación de análisis visual Gemini Vision IA e interpretaciones adivinatorias tradicionales",
    traditionalKnowledge: "Conocimiento Tradicional",
    traditionalKnowledgeDesc: "Unimos tradiciones adivinatorias centenarias con tecnología moderna",
    privacySecurity: "Privacidad y Seguridad",
    privacySecurityDesc: "Tus datos están seguros - tus lecturas personales son solo para ti",
    
    // Errors
    selectValidImage: "Por favor selecciona un archivo de imagen válido",
    selectImageFirst: "Por favor selecciona primero una imagen de taza de café",
    analysisError: "Ocurrió un error durante el análisis de fortuna. Por favor intenta de nuevo."
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('tr');
  
  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };
  
  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };
  
  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];
  
  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      languages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};