import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import BirthChart from "./BirthChart";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AstrologyReading = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    birth_date: "",
    birth_time: "",
    birth_place: ""
  });
  const [zodiacSigns, setZodiacSigns] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [reading, setReading] = useState(null);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `astrology_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    loadZodiacSigns();
  }, []);

  const loadZodiacSigns = async () => {
    try {
      const response = await axios.get(`${API}/zodiac-signs`);
      setZodiacSigns(response.data);
    } catch (err) {
      console.error("Load zodiac signs error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.birth_date) {
      setError("Doğum tarihi gereklidir");
      return false;
    }
    if (!formData.birth_time) {
      setError("Doğum saati gereklidir");
      return false;
    }
    if (!formData.birth_place) {
      setError("Doğum yeri gereklidir");
      return false;
    }
    return true;
  };

  const generateReading = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/astrology-reading`, {
        ...formData,
        session_id: sessionId
      });

      setReading(response.data);
    } catch (err) {
      console.error("Astrology reading error:", err);
      setError(
        err.response?.data?.detail || 
        "Astroloji okuma sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetReading = () => {
    setReading(null);
    setError("");
    setFormData({
      birth_date: "",
      birth_time: "",
      birth_place: ""
    });
  };

  const getZodiacInfo = (zodiacKey) => {
    return zodiacSigns[zodiacKey] || {};
  };

  return (
    <div className="min-h-screen relative pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Futuristic Header */}
          <div className="text-center mb-12 relative">
            <div className="glass-morph rounded-3xl p-8 border border-spiritual-violet/20 relative overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-10"></div>
              
              <h1 className="text-6xl font-bold text-white mb-4 font-serif relative z-10">
                <span className="animate-float text-5xl mr-4">⭐</span>
                <span className="bg-gradient-to-r from-spiritual-violet via-spiritual-amber to-spiritual-violet bg-clip-text text-transparent animate-holographic neon-text">
                  Astroloji
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-6 animate-neon-flicker">
                Doğum bilgilerinizle yıldızlardan mesajınızı alın
              </p>
              
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-spiritual-violet to-transparent mx-auto rounded-full animate-holographic"></div>
            </div>
          </div>

          {!reading ? (
            <div className="glass-morph border border-spiritual-violet/20 rounded-3xl p-8 relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-spiritual-amber rounded-full animate-twinkle"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-8 text-center neon-text">
                  Doğum Bilgilerinizi Girin
                </h3>
                
                {/* Birth Information Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Birth Date */}
                  <div className="space-y-2">
                    <label htmlFor="birth_date" className="block text-spiritual-amber font-semibold text-lg">
                      Doğum Tarihi
                    </label>
                    <input
                      type="date"
                      id="birth_date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 glass-morph-dark border border-spiritual-violet/30 rounded-xl text-white focus:border-spiritual-violet focus:outline-none focus:ring-2 focus:ring-spiritual-violet/50 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Birth Time */}
                  <div className="space-y-2">
                    <label htmlFor="birth_time" className="block text-spiritual-amber font-semibold text-lg">
                      Doğum Saati
                    </label>
                    <input
                      type="time"
                      id="birth_time"
                      name="birth_time"
                      value={formData.birth_time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 glass-morph-dark border border-spiritual-violet/30 rounded-xl text-white focus:border-spiritual-violet focus:outline-none focus:ring-2 focus:ring-spiritual-violet/50 transition-all duration-300"
                    />
                  </div>
                </div>
                
                {/* Birth Place */}
                <div className="space-y-2 mb-8">
                  <label htmlFor="birth_place" className="block text-spiritual-amber font-semibold text-lg">
                    Doğum Yeri
                  </label>
                  <input
                    type="text"
                    id="birth_place"
                    name="birth_place"
                    value={formData.birth_place}
                    onChange={handleInputChange}
                    placeholder="Şehir, Ülke (örn: İstanbul, Türkiye)"
                    className="w-full px-4 py-3 glass-morph-dark border border-spiritual-violet/30 rounded-xl text-white placeholder-gray-400 focus:border-spiritual-violet focus:outline-none focus:ring-2 focus:ring-spiritual-violet/50 transition-all duration-300"
                  />
                </div>

                {/* Generate Button */}
                <div className="text-center">
                  <button
                    onClick={generateReading}
                    disabled={isLoading}
                    className="px-10 py-4 holographic-btn text-white font-bold text-xl rounded-full hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto shadow-2xl relative overflow-hidden"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Yıldızlar Okunuyor...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl animate-glow-pulse">⭐</span>
                        <span>Astroloji Haritası Oluştur</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 glass-morph-dark border border-spiritual-rose/50 rounded-xl text-spiritual-rose text-center animate-glow-pulse">
                  <span className="neon-text">{error}</span>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: '🗓️', title: 'Doğum Tarihi', desc: 'Tam doğum tarihinizi girin', color: 'spiritual-amber' },
                  { step: '🕐', title: 'Doğum Saati', desc: 'Mümkün olduğunca kesin saati belirtin', color: 'spiritual-violet' },
                  { step: '🌍', title: 'Doğum Yeri', desc: 'Doğduğunuz şehir ve ülkeyi yazın', color: 'spiritual-cyan' }
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
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-spiritual-amber rounded-full animate-twinkle"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`
                      }}
                    ></div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h2 className="text-4xl font-bold text-white neon-text flex items-center">
                    <span className="text-3xl animate-glow-pulse mr-3">⭐</span>
                    Astroloji Haritanız
                  </h2>
                  <button
                    onClick={resetReading}
                    className="px-6 py-3 glass-morph-dark text-white rounded-full hover:bg-spiritual-cyan/20 hover:border-spiritual-cyan/50 transition-all duration-300 border border-gray-600/30 hover:scale-110"
                  >
                    Yeni Okuma
                  </button>
                </div>

                {/* Birth Information Display */}
                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-semibold text-white mb-4 neon-text spiritual-amber">
                    Doğum Bilgileri
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-morph-dark rounded-xl p-4 border border-spiritual-violet/20 text-center">
                      <p className="text-spiritual-amber font-semibold mb-1">Doğum Tarihi</p>
                      <p className="text-white">{new Date(reading.birth_date).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div className="glass-morph-dark rounded-xl p-4 border border-spiritual-violet/20 text-center">
                      <p className="text-spiritual-amber font-semibold mb-1">Doğum Saati</p>
                      <p className="text-white">{reading.birth_time}</p>
                    </div>
                    <div className="glass-morph-dark rounded-xl p-4 border border-spiritual-violet/20 text-center">
                      <p className="text-spiritual-amber font-semibold mb-1">Doğum Yeri</p>
                      <p className="text-white">{reading.birth_place}</p>
                    </div>
                  </div>
                </div>

                {/* Birth Chart Visualization */}
                {reading.birth_chart && (
                  <div className="mb-8 relative z-10">
                    <BirthChart 
                      birthChart={reading.birth_chart} 
                      zodiacSigns={zodiacSigns}
                    />
                  </div>
                )}

                {/* Zodiac Sign Display */}
                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-semibold text-white mb-4 neon-text spiritual-violet">
                    Burç Bilgisi
                  </h3>
                  
                  <div className="glass-morph-dark rounded-xl p-6 border border-spiritual-violet/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-spiritual-violet/10 via-spiritual-amber/10 to-spiritual-violet/10 animate-holographic"></div>
                    
                    <div className="relative z-10 text-center">
                      <h4 className="text-3xl font-bold text-spiritual-amber mb-2">
                        {getZodiacInfo(reading.zodiac_sign).name || "Bilinmiyor"}
                      </h4>
                      <p className="text-gray-300 mb-4">
                        {getZodiacInfo(reading.zodiac_sign).dates || ""}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-spiritual-cyan font-semibold">Element</p>
                          <p className="text-white">{getZodiacInfo(reading.zodiac_sign).element || "Bilinmiyor"}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-spiritual-cyan font-semibold">Yönetici Gezegen</p>
                          <p className="text-white">{getZodiacInfo(reading.zodiac_sign).ruling_planet || "Bilinmiyor"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-semibold text-white mb-4 neon-text spiritual-purple">
                    Astroloji Yorumu
                  </h3>
                  <div className="glass-morph-dark rounded-2xl p-6 border border-spiritual-purple/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-spiritual-purple/5 via-spiritual-amber/5 to-spiritual-cyan/5 animate-holographic"></div>
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
                    <p className="flex items-center space-x-2">
                      <span>⭐</span>
                      <span>Burç: {getZodiacInfo(reading.zodiac_sign).name || "Bilinmiyor"}</span>
                    </p>
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

export default AstrologyReading;