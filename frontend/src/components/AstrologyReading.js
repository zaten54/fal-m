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
    <div className="min-h-screen bg-apple-gray-50 pt-apple-3xl">
      <div className="apple-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-apple-3xl apple-fade-in">
            <h1 className="apple-text-display mb-apple-md">
              <span className="text-apple-yellow text-apple-4xl mr-4 animate-float-subtle">⭐</span>
              <span className="bg-gradient-to-r from-apple-yellow via-apple-orange to-apple-red bg-clip-text text-transparent">
                Astroloji
              </span>
            </h1>
            <p className="apple-text-headline text-apple-gray-600 mb-apple-lg max-w-2xl mx-auto">
              Doğum bilgilerinizle yıldızlardan mesajınızı alın
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-apple-yellow to-apple-red mx-auto rounded-full"></div>
          </div>

          {!reading ? (
            <div className="apple-card-elevated apple-slide-up">
              <h3 className="apple-text-display text-center mb-apple-xl">
                Doğum Bilgilerinizi Girin
              </h3>
              
              {/* Birth Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-apple-lg mb-apple-xl">
                {/* Birth Date */}
                <div className="space-y-2">
                  <label htmlFor="birth_date" className="block text-apple-yellow font-apple font-semibold text-apple-lg">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className="apple-input"
                  />
                </div>
                
                {/* Birth Time */}
                <div className="space-y-2">
                  <label htmlFor="birth_time" className="block text-apple-yellow font-apple font-semibold text-apple-lg">
                    Doğum Saati
                  </label>
                  <input
                    type="time"
                    id="birth_time"
                    name="birth_time"
                    value={formData.birth_time}
                    onChange={handleInputChange}
                    className="apple-input"
                  />
                </div>
              </div>
              
              {/* Birth Place */}
              <div className="space-y-2 mb-apple-xl">
                <label htmlFor="birth_place" className="block text-apple-yellow font-apple font-semibold text-apple-lg">
                  Doğum Yeri
                </label>
                <input
                  type="text"
                  id="birth_place"
                  name="birth_place"
                  value={formData.birth_place}
                  onChange={handleInputChange}
                  placeholder="Şehir, Ülke (örn: İstanbul, Türkiye)"
                  className="apple-input"
                />
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={generateReading}
                  disabled={isLoading}
                  className="apple-button-primary px-apple-xl py-apple-md text-apple-lg apple-hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Yıldızlar Okunuyor...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">⭐</span>
                      <span>Astroloji Haritası Oluştur</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-apple-lg p-apple-md bg-red-50 border border-red-200 rounded-apple text-red-600 text-center">
                  {error}
                </div>
              )}

              {/* Instructions */}
              <div className="mt-apple-3xl grid grid-cols-1 md:grid-cols-3 gap-apple-lg">
                {[
                  { step: '📅', title: 'Doğum Tarihi', desc: 'Tam doğum tarihinizi girin', color: 'apple-yellow' },
                  { step: '🕐', title: 'Doğum Saati', desc: 'Mümkün olduğunca kesin saati belirtin', color: 'apple-orange' },
                  { step: '🌍', title: 'Doğum Yeri', desc: 'Doğduğunuz şehir ve ülkeyi yazın', color: 'apple-red' }
                ].map((instruction, index) => (
                  <div key={index} className="text-center apple-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className={`w-16 h-16 bg-${instruction.color}/10 rounded-apple flex items-center justify-center mx-auto mb-apple-md apple-hover-lift apple-transition`}>
                      <span className="text-apple-2xl">{instruction.step}</span>
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
                    <span className="text-apple-3xl mr-3">⭐</span>
                    Astroloji Haritanız
                  </h2>
                  <button
                    onClick={resetReading}
                    className="apple-button-secondary"
                  >
                    Yeni Okuma
                  </button>
                </div>

                {/* Birth Information Display */}
                <div className="mb-apple-xl">
                  <h3 className="apple-text-headline mb-apple-md text-apple-orange">
                    Doğum Bilgileri
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-apple-md">
                    <div className="apple-card text-center">
                      <p className="apple-text-caption text-apple-orange font-apple font-semibold mb-1">Doğum Tarihi</p>
                      <p className="apple-text-body">{new Date(reading.birth_date).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div className="apple-card text-center">
                      <p className="apple-text-caption text-apple-orange font-apple font-semibold mb-1">Doğum Saati</p>
                      <p className="apple-text-body">{reading.birth_time}</p>
                    </div>
                    <div className="apple-card text-center">
                      <p className="apple-text-caption text-apple-orange font-apple font-semibold mb-1">Doğum Yeri</p>
                      <p className="apple-text-body">{reading.birth_place}</p>
                    </div>
                  </div>
                </div>

                {/* Birth Chart Visualization */}
                {reading.birth_chart && (
                  <div className="mb-apple-xl">
                    <BirthChart 
                      birthChart={reading.birth_chart} 
                      zodiacSigns={zodiacSigns}
                    />
                  </div>
                )}

                {/* Zodiac Sign Display */}
                <div className="mb-apple-xl">
                  <h3 className="apple-text-headline mb-apple-md text-apple-purple">
                    Burç Bilgisi
                  </h3>
                  
                  <div className="apple-card bg-apple-purple/5 border border-apple-purple/10">
                    <div className="text-center">
                      <h4 className="apple-text-display text-apple-purple mb-apple-sm">
                        {getZodiacInfo(reading.zodiac_sign).name || "Bilinmiyor"}
                      </h4>
                      <p className="apple-text-body text-apple-gray-600 mb-apple-md">
                        {getZodiacInfo(reading.zodiac_sign).dates || ""}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-apple-md">
                        <div className="text-center">
                          <p className="apple-text-caption text-apple-blue font-apple font-semibold">Element</p>
                          <p className="apple-text-body">{getZodiacInfo(reading.zodiac_sign).element || "Bilinmiyor"}</p>
                        </div>
                        <div className="text-center">
                          <p className="apple-text-caption text-apple-blue font-apple font-semibold">Yönetici Gezegen</p>
                          <p className="apple-text-body">{getZodiacInfo(reading.zodiac_sign).ruling_planet || "Bilinmiyor"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="mb-apple-xl">
                  <h3 className="apple-text-headline mb-apple-md text-apple-blue">
                    Astroloji Yorumu
                  </h3>
                  <div className="bg-apple-blue/5 border border-apple-blue/10 rounded-apple-lg p-apple-lg">
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
                    <span>
                      Burç: {getZodiacInfo(reading.zodiac_sign).name || "Bilinmiyor"}
                    </span>
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