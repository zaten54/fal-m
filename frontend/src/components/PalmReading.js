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
    <div className="min-h-screen bg-apple-gray-50 pt-apple-3xl">
      <div className="apple-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-apple-3xl apple-fade-in">
            <h1 className="apple-text-display mb-apple-md">
              <span className="text-apple-green text-apple-4xl mr-4 animate-float-subtle">✋</span>
              <span className="bg-gradient-to-r from-apple-green to-apple-blue bg-clip-text text-transparent">
                El Falı
              </span>
            </h1>
            <p className="apple-text-headline text-apple-gray-600 mb-apple-lg max-w-2xl mx-auto">
              Elinizin fotoğrafını yükleyin, AI ile çizgilerinizi okuyalım
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-apple-green to-apple-blue mx-auto rounded-full"></div>
          </div>

          {!reading ? (
            <div className="apple-card-elevated mb-apple-xl apple-slide-up">
              {/* Hand Type Selection */}
              <div className="mb-apple-lg text-center">
                <h3 className="apple-text-headline mb-apple-md">Hangi elinizi okutmak istiyorsunuz?</h3>
                <div className="flex justify-center space-x-apple-md">
                  <button
                    onClick={() => setHandType("right")}
                    className={`px-apple-lg py-apple-md rounded-apple font-apple font-medium apple-transition ${
                      handType === "right"
                        ? "bg-apple-green text-white shadow-apple"
                        : "bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200"
                    }`}
                  >
                    Sağ El
                  </button>
                  <button
                    onClick={() => setHandType("left")}
                    className={`px-apple-lg py-apple-md rounded-apple font-apple font-medium apple-transition ${
                      handType === "left"
                        ? "bg-apple-green text-white shadow-apple"
                        : "bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200"
                    }`}
                  >
                    Sol El
                  </button>
                </div>
              </div>
              
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-apple-lg p-apple-3xl text-center apple-transition ${
                  dragActive
                    ? "border-apple-green bg-apple-green/5"
                    : "border-apple-gray-300 hover:border-apple-green"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {previewImage ? (
                  <div className="space-y-apple-lg">
                    <div className="relative inline-block">
                      <img
                        src={previewImage}
                        alt="El fotoğrafı"
                        className="max-w-sm max-h-64 mx-auto rounded-apple-lg shadow-apple-lg"
                      />
                    </div>
                    
                    <div className="text-center mb-apple-md">
                      <span className="px-apple-md py-apple-sm bg-apple-green/10 border border-apple-green/20 text-apple-green rounded-apple text-apple-sm font-apple font-medium">
                        {handType === "right" ? "Sağ El" : "Sol El"} Seçildi
                      </span>
                    </div>
                    
                    <div className="flex justify-center space-x-apple-md">
                      <button
                        onClick={analyzePalm}
                        disabled={isLoading}
                        className="apple-button-primary px-apple-xl py-apple-md text-apple-lg apple-hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Analiz Ediliyor...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">✋</span>
                            <span>El Falımı Oku</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={resetReading}
                        className="apple-button-secondary"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-apple-lg">
                    <div className="text-6xl text-apple-green mb-apple-lg">✋</div>
                    <div>
                      <h3 className="apple-text-headline mb-apple-md">
                        El Fotoğrafı Yükleyin
                      </h3>
                      <p className="apple-text-body mb-apple-lg max-w-2xl mx-auto">
                        Elinizin avuç içinin net bir fotoğrafını çekin. Çizgiler belirgin şekilde görünmelidir.
                      </p>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="apple-button-primary px-apple-xl py-apple-md text-apple-lg apple-hover-lift flex items-center space-x-2 mx-auto"
                      >
                        <span className="text-xl">📁</span>
                        <span>Fotoğraf Seç</span>
                      </button>
                      
                      <p className="apple-text-caption mt-apple-md">
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
                <div className="mt-apple-lg p-apple-md bg-red-50 border border-red-200 rounded-apple text-red-600 text-center">
                  {error}
                </div>
              )}

              {/* Instructions */}
              <div className="mt-apple-3xl grid grid-cols-1 md:grid-cols-3 gap-apple-lg">
                {[
                  { step: '1', title: 'El Seçimi', desc: 'Dominant elinizi (sağ veya sol) seçin', color: 'apple-green' },
                  { step: '2', title: 'Fotoğraf Çekimi', desc: 'Avuç içinizin net bir fotoğrafını çekin', color: 'apple-blue' },
                  { step: '3', title: 'Analiz', desc: 'AI çizgilerinizi analiz ederek fal yorumu yapar', color: 'apple-purple' }
                ].map((instruction, index) => (
                  <div key={index} className="text-center apple-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className={`w-12 h-12 bg-${instruction.color}/10 rounded-full flex items-center justify-center mx-auto mb-apple-md text-${instruction.color} font-apple font-bold text-apple-lg`}>
                      {instruction.step}
                    </div>
                    <h4 className={`apple-text-headline mb-apple-sm text-${instruction.color}`}>
                      {instruction.title}
                    </h4>
                    <p className="apple-text-body">
                      {instruction.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Reading Results */
            <div className="space-y-apple-xl">
              <div className="apple-card-elevated apple-scale-in">
                <div className="flex justify-between items-center mb-apple-xl">
                  <h2 className="apple-text-display text-apple-green flex items-center">
                    <span className="text-apple-3xl mr-3">✋</span>
                    El Falı Sonucu
                  </h2>
                  <button
                    onClick={resetReading}
                    className="apple-button-secondary"
                  >
                    Yeni Okuma
                  </button>
                </div>

                {/* Hand Type Display */}
                <div className="mb-apple-lg text-center">
                  <span className="px-apple-md py-apple-sm bg-apple-green/10 border border-apple-green/20 text-apple-green rounded-apple font-apple font-medium">
                    {reading.hand_type === "right" ? "Sağ El" : "Sol El"} Analizi
                  </span>
                </div>

                {/* Lines Found */}
                {reading.lines_found && reading.lines_found.length > 0 && (
                  <div className="mb-apple-xl">
                    <h3 className="apple-text-headline mb-apple-md text-apple-blue">
                      Tespit Edilen Çizgiler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {reading.lines_found.map((line, index) => (
                        <span
                          key={index}
                          className="px-apple-md py-apple-sm bg-apple-blue/10 border border-apple-blue/20 text-apple-blue rounded-apple text-apple-sm font-apple font-medium"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interpretation */}
                <div className="mb-apple-xl">
                  <h3 className="apple-text-headline mb-apple-md text-apple-purple">
                    El Falı Yorumu
                  </h3>
                  <div className="bg-apple-purple/5 border border-apple-purple/10 rounded-apple-lg p-apple-lg">
                    <p className="apple-text-body whitespace-pre-wrap leading-relaxed">
                      {reading.interpretation}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-center apple-text-caption text-apple-gray-500 border-t border-apple-gray-200 pt-apple-lg">
                  <div className="flex justify-center items-center space-x-apple-lg">
                    <span>
                      Okuma Tarihi: {new Date(reading.timestamp).toLocaleString('tr-TR')}
                    </span>
                    {reading.confidence_score && (
                      <span>
                        Güvenilirlik: {(reading.confidence_score * 100).toFixed(0)}%
                      </span>
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