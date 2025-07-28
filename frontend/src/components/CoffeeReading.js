import React, { useState, useRef } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CoffeeReading = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reading, setReading] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [sessionId, setSessionId] = useState("");

  // Generate session ID on component mount
  React.useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  const analyzeCoffee = async () => {
    if (!selectedFile) {
      setError("Lütfen önce bir kahve fincanı resmi seçin");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(selectedFile);
      
      // Send to backend
      const response = await axios.post(`${API}/coffee-reading`, {
        image_base64: base64Image,
        session_id: sessionId
      });

      setReading(response.data);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err.response?.data?.detail || 
        "Fal analizi sırasında bir hata oluştu. Lütfen tekrar deneyin."
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 font-serif">
              ☕ <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Kahve Falı</span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Kahve fincanınızın fotoğrafını yükleyin, AI ile falınızı okuyalım
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"></div>
          </div>

          {!reading ? (
            <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-amber-400 bg-amber-400/10"
                    : "border-gray-600 hover:border-amber-400 hover:bg-amber-400/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {previewImage ? (
                  <div className="space-y-6">
                    <img
                      src={previewImage}
                      alt="Kahve fincanı"
                      className="max-w-sm max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={analyzeCoffee}
                        disabled={isLoading}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Analiz Ediliyor...</span>
                          </>
                        ) : (
                          <>
                            <span>🔮</span>
                            <span>Falımı Oku</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={resetReading}
                        className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-6xl text-gray-400">📸</div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2">Kahve Fincanı Fotoğrafı Yükleyin</h3>
                      <p className="text-gray-400 mb-6">
                        Kahvenizi içtikten sonra fincanınızın içindeki telvelerin fotoğrafını çekin ve buraya yükleyin
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2 mx-auto"
                      >
                        <span>📁</span>
                        <span>Dosya Seç</span>
                      </button>
                      <p className="text-sm text-gray-500 mt-4">
                        Veya dosyayı buraya sürükleyip bırakın
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
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              {/* Instructions */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Kahvenizi İçin</h4>
                  <p className="text-gray-400 text-sm">Türk kahvenizi keyifle için ve fincanın dibinde telve bırakın</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Fotoğraf Çekin</h4>
                  <p className="text-gray-400 text-sm">Fincanın içindeki telve desenlerinin net fotoğrafını çekin</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Falınızı Okuyun</h4>
                  <p className="text-gray-400 text-sm">AI analizimiz ile detaylı fal yorumunuzu alın</p>
                </div>
              </div>
            </div>
          ) : (
            /* Reading Results */
            <div className="space-y-8">
              <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-white">🔮 Falınız Hazır!</h2>
                  <button
                    onClick={resetReading}
                    className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Yeni Fal
                  </button>
                </div>

                {/* Symbols Found */}
                {reading.symbols_found && reading.symbols_found.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Tespit Edilen Semboller</h3>
                    <div className="flex flex-wrap gap-2">
                      {reading.symbols_found.map((symbol, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-sm"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interpretation */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Fal Yorumu</h3>
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {reading.interpretation}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-center text-gray-400 text-sm border-t border-gray-700 pt-4">
                  <p>Fal Tarihi: {new Date(reading.timestamp).toLocaleString('tr-TR')}</p>
                  {reading.confidence_score && (
                    <p>Güvenilirlik: {(reading.confidence_score * 100).toFixed(0)}%</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoffeeReading;