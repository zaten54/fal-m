import React, { useState, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PalmReading = () => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [handType, setHandType] = useState("right");
  const [isLoading, setIsLoading] = useState(false);
  const [reading, setReading] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [sessionId, setSessionId] = useState("");

  // Generate session ID on component mount
  React.useEffect(() => {
    const newSessionId = `palm_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Lütfen geçerli bir resim dosyası seçin");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/...;base64, prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const analyzePalm = async () => {
    if (!selectedFile) {
      setError("Lütfen önce bir el fotoğrafı seçin");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(selectedFile);
      
      // Send to backend
      const response = await axios.post(`${API}/palm-reading`, {
        image_base64: base64Image,
        hand_type: handType,
        session_id: sessionId
      });

      setReading(response.data);
    } catch (err) {
      console.error("Palm analysis error:", err);
      setError(
        err.response?.data?.detail || 
        "El falı analizi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetReading = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setReading(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen relative pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Futuristic Header */}
          <div className="text-center mb-12 relative">
            <div className="glass-morph rounded-3xl p-8 border border-spiritual-blue/20 relative overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-10"></div>
              
              <h1 className="text-6xl font-bold text-white mb-4 font-serif relative z-10">
                <span className="animate-float text-5xl mr-4">✋</span>
                <span className="bg-gradient-to-r from-spiritual-cyan via-spiritual-emerald to-spiritual-cyan bg-clip-text text-transparent animate-holographic neon-text">
                  El Falı
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-6 animate-neon-flicker">
                Elinizin fotoğrafını yükleyin, AI ile çizgilerinizi okuyalım
              </p>
              
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-spiritual-cyan to-transparent mx-auto rounded-full animate-holographic"></div>
            </div>
          </div>

          {!reading ? (
            <div className="glass-morph border border-spiritual-cyan/20 rounded-3xl p-8 relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-spiritual-emerald rounded-full animate-twinkle"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  ></div>
                ))}
              </div>
              
              {/* Hand Type Selection */}
              <div className="mb-6 text-center relative z-10">
                <h3 className="text-xl font-semibold text-white mb-4">Hangi elinizi okutmak istiyorsunuz?</h3>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setHandType("right")}
                    className={`px-6 py-3 rounded-full transition-all duration-300 ${
                      handType === "right"
                        ? "bg-spiritual-cyan/20 border-spiritual-cyan/50 text-spiritual-cyan neon-text"
                        : "bg-gray-800/20 border-gray-600/30 text-gray-400 hover:text-white"
                    } border`}
                  >
                    Sağ El
                  </button>
                  <button
                    onClick={() => setHandType("left")}
                    className={`px-6 py-3 rounded-full transition-all duration-300 ${
                      handType === "left"
                        ? "bg-spiritual-cyan/20 border-spiritual-cyan/50 text-spiritual-cyan neon-text"
                        : "bg-gray-800/20 border-gray-600/30 text-gray-400 hover:text-white"
                    } border`}
                  >
                    Sol El
                  </button>
                </div>
              </div>
              
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-spiritual-cyan bg-spiritual-cyan/10 shadow-2xl shadow-spiritual-cyan/20"
                    : "border-spiritual-emerald/50 hover:border-spiritual-cyan hover:bg-spiritual-cyan/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {/* Holographic Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-spiritual-cyan/20 via-spiritual-emerald/20 to-spiritual-cyan/20 animate-holographic opacity-50"></div>
                
                {previewImage ? (
                  <div className="space-y-6 relative z-10">
                    <div className="relative inline-block">
                      <img
                        src={previewImage}
                        alt="El fotoğrafı"
                        className="max-w-sm max-h-64 mx-auto rounded-xl shadow-2xl border border-spiritual-emerald/30"
                      />
                      {/* Glowing Frame */}
                      <div className="absolute inset-0 rounded-xl border-2 border-spiritual-emerald/50 animate-glow-pulse"></div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <span className="px-4 py-2 bg-spiritual-cyan/20 border border-spiritual-cyan/30 text-spiritual-cyan rounded-full text-sm">
                        {handType === "right" ? "Sağ El" : "Sol El"} Seçildi
                      </span>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={analyzePalm}
                        disabled={isLoading}
                        className="px-8 py-4 holographic-btn text-white font-bold text-lg rounded-full hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-2xl relative overflow-hidden"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            <span>Analiz Ediliyor...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl animate-glow-pulse">✋</span>
                            <span>El Falımı Oku</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={resetReading}
                        className="px-6 py-4 glass-morph-dark text-white rounded-full hover:bg-spiritual-rose/20 hover:border-spiritual-rose/50 transition-all duration-300 border border-gray-600/30"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 relative z-10">
                    <div className="text-8xl text-spiritual-emerald animate-float mb-6">✋</div>
                    <div>
                      <h3 className="text-3xl font-semibold text-white mb-4 neon-text">
                        El Fotoğrafı Yükleyin
                      </h3>
                      <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Elinizin avuç içinin net bir fotoğrafını çekin. Çizgiler belirgin şekilde görünmelidir.
                      </p>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-10 py-4 holographic-btn text-white font-bold text-xl rounded-full hover:scale-110 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-2xl relative overflow-hidden"
                      >
                        <span className="text-2xl">📁</span>
                        <span>Fotoğraf Seç</span>
                      </button>
                      
                      <p className="text-sm text-gray-400 mt-6 animate-pulse">
                        Veya fotoğrafı buraya sürükleyip bırakın
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="mt-6 p-4 glass-morph-dark border border-spiritual-rose/50 rounded-xl text-spiritual-rose text-center animate-glow-pulse">
                  <span className="neon-text">{error}</span>
                </div>
              )}

              {/* Futuristic Instructions */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: '1️⃣', title: 'El Seçimi', desc: 'Dominant elinizi (sağ veya sol) seçin', color: 'spiritual-cyan' },
                  { step: '2️⃣', title: 'Fotoğraf Çekimi', desc: 'Avuç içinizin net bir fotoğrafını çekin', color: 'spiritual-emerald' },
                  { step: '3️⃣', title: 'Analiz', desc: 'AI çizgilerinizi analiz ederek fal yorumu yapar', color: 'spiritual-purple' }
                ].map((instruction, index) => (
                  <div key={index} className="text-center group">
                    <div className={`w-16 h-16 glass-morph rounded-full flex items-center justify-center mx-auto mb-4 border border-${instruction.color}/30 group-hover:animate-glow-pulse transition-all duration-500`}>
                      <span className="text-3xl animate-float">{instruction.step}</span>
                    </div>
                    <h4 className={`text-white font-semibold mb-2 text-lg neon-text ${instruction.color}`}>
                      {instruction.title}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {instruction.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Futuristic Reading Results */
            <div className="space-y-8">
              <div className="glass-morph border border-spiritual-emerald/20 rounded-3xl p-8 relative overflow-hidden">
                {/* Success Animation Background */}
                <div className="absolute inset-0">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-spiritual-emerald rounded-full animate-twinkle"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`
                      }}
                    ></div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h2 className="text-4xl font-bold text-white neon-text flex items-center">
                    <span className="text-3xl animate-glow-pulse mr-3">✋</span>
                    El Falı Sonucu
                  </h2>
                  <button
                    onClick={resetReading}
                    className="px-6 py-3 glass-morph-dark text-white rounded-full hover:bg-spiritual-cyan/20 hover:border-spiritual-cyan/50 transition-all duration-300 border border-gray-600/30 hover:scale-110"
                  >
                    Yeni Okuma
                  </button>
                </div>

                {/* Hand Type Display */}
                <div className="mb-6 text-center relative z-10">
                  <span className="px-4 py-2 bg-spiritual-cyan/20 border border-spiritual-cyan/30 text-spiritual-cyan rounded-full">
                    {reading.hand_type === "right" ? "Sağ El" : "Sol El"} Analizi
                  </span>
                </div>

                {/* Lines Found */}
                {reading.lines_found && reading.lines_found.length > 0 && (
                  <div className="mb-8 relative z-10">
                    <h3 className="text-2xl font-semibold text-white mb-4 neon-text spiritual-amber">
                      Tespit Edilen Çizgiler
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {reading.lines_found.map((line, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 glass-morph border border-spiritual-emerald/30 text-spiritual-emerald rounded-full text-sm hover:animate-glow-pulse transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interpretation */}
                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-semibold text-white mb-4 neon-text spiritual-purple">
                    El Falı Yorumu
                  </h3>
                  <div className="glass-morph-dark rounded-2xl p-6 border border-spiritual-purple/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-spiritual-emerald/5 via-spiritual-cyan/5 to-spiritual-purple/5 animate-holographic"></div>
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap relative z-10 text-lg">
                      {reading.interpretation}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-center text-gray-400 text-sm border-t border-spiritual-emerald/20 pt-6 relative z-10">
                  <div className="flex justify-center items-center space-x-6">
                    <p className="flex items-center space-x-2">
                      <span>🕐</span>
                      <span>Okuma Tarihi: {new Date(reading.timestamp).toLocaleString('tr-TR')}</span>
                    </p>
                    {reading.confidence_score && (
                      <p className="flex items-center space-x-2">
                        <span>⭐</span>
                        <span>Güvenilirlik: {(reading.confidence_score * 100).toFixed(0)}%</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PalmReading;