import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FalnameReading = () => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  
  const [step, setStep] = useState("introduction"); // introduction, intention, result
  const [intention, setIntention] = useState("");
  const [falnameResult, setFalnameResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // Session ID oluştur
    if (user) {
      setSessionId(`${user.id}_${Date.now()}`);
    }
  }, [user]);

  const handleIntentionSubmit = async () => {
    if (!intention.trim()) {
      setError("Lütfen bir niyet girin");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError("");

      const response = await axios.post(
        `${API}/falname-reading`,
        {
          intention: intention.trim(),
          session_id: sessionId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setFalnameResult(response.data);
      setStep("result");

    } catch (error) {
      console.error("Falname analysis error:", error);
      setError(
        error.response?.data?.detail ||
        "Falname analizi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetFalname = () => {
    setStep("introduction");
    setIntention("");
    setFalnameResult(null);
    setError("");
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 pt-apple-3xl pb-apple-2xl">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b45309' fill-opacity='1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="apple-container max-w-4xl relative">
        
        {/* INTRODUCTION STEP */}
        {step === "introduction" && (
          <div className="text-center">
            {/* Header */}
            <div className="mb-apple-2xl">
              <div className="inline-flex items-center space-x-4 mb-apple-lg">
                <div className="text-6xl">📜</div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    Falname
                  </h1>
                  <p className="text-xl text-amber-700 font-medium">
                    İlahi Kehanetler Kitabı
                  </p>
                </div>
              </div>
            </div>

            {/* Introduction Card */}
            <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 rounded-2xl p-apple-2xl shadow-2xl max-w-2xl mx-auto mb-apple-xl">
              <div className="text-center mb-apple-xl">
                <div className="text-4xl mb-apple-md">🕯️</div>
                <h2 className="text-2xl font-bold text-amber-900 mb-apple-lg" style={{ fontFamily: 'Georgia, serif' }}>
                  Falname'ye Hoş Geldiniz
                </h2>
                <div className="prose prose-amber max-w-none">
                  <p className="text-lg leading-relaxed text-amber-800 mb-apple-md">
                    Bu eski gelenekle, Kur'an ayetlerinden ya da kadim şiirlerden esinlenmiş bir kehanet alacaksınız.
                  </p>
                  <p className="text-lg leading-relaxed text-amber-700">
                    <strong>Lütfen bir niyet tutun.</strong>
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setStep("intention")}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-apple-lg px-apple-2xl rounded-xl apple-transition shadow-lg text-lg"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                ✨ Niyetimi Tuttum
              </button>
            </div>

            {/* Info Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-amber-200 rounded-xl p-apple-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-amber-900 mb-apple-sm flex items-center justify-center">
                <span className="mr-2">ℹ️</span>
                Falname Nedir?
              </h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                Falname, Osmanlı döneminden günümüze gelen kadim bir fal geleneğidir. 
                Kutsal metinlerden ve klasik şiirlerden alınan ilhamla, kişinin ruh haline ve niyetine uygun 
                manevi rehberlik sunar. Her kehanet, sabır, tevekkül ve iç huzur için bir yol göstericidir.
              </p>
            </div>
          </div>
        )}

        {/* INTENTION STEP */}
        {step === "intention" && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 rounded-2xl p-apple-2xl shadow-2xl">
              <div className="text-4xl mb-apple-lg">🤲</div>
              <h2 className="text-2xl font-bold text-amber-900 mb-apple-lg" style={{ fontFamily: 'Georgia, serif' }}>
                Niyetinizi Paylaşın
              </h2>
              <p className="text-amber-700 mb-apple-xl leading-relaxed">
                Kalbinizdeki soruyu, dileğinizi ya da merak ettiğiniz konuyu yazın. 
                Bu, size özel kehanetinizi şekillendirecektir.
              </p>
              
              <div className="text-left mb-apple-lg">
                <label className="block text-amber-800 font-semibold mb-apple-sm">
                  Niyetiniz:
                </label>
                <textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="Örn: Aşk hayatım hakkında rehberlik istiyorum..."
                  className="w-full h-32 px-apple-md py-apple-sm border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 apple-transition resize-none bg-amber-50/50"
                  style={{ fontFamily: 'Georgia, serif' }}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-apple-md py-apple-sm rounded-lg mb-apple-md">
                  {error}
                </div>
              )}

              <div className="flex space-x-apple-md">
                <button
                  onClick={() => setStep("introduction")}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-apple-md px-apple-lg rounded-xl apple-transition"
                >
                  ← Geri Dön
                </button>
                <button
                  onClick={handleIntentionSubmit}
                  disabled={isAnalyzing || !intention.trim()}
                  className={`flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-apple-md px-apple-lg rounded-xl apple-transition shadow-lg ${
                    (isAnalyzing || !intention.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kehanet Hazırlanıyor...
                    </span>
                  ) : (
                    "🔮 Kehanet Al"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULT STEP */}
        {step === "result" && falnameResult && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm border-2 border-amber-200 rounded-2xl p-apple-2xl shadow-2xl">
              {/* Header */}
              <div className="text-center mb-apple-xl">
                <div className="text-5xl mb-apple-md">📜</div>
                <h2 className="text-3xl font-bold text-amber-900 mb-apple-sm" style={{ fontFamily: 'Georgia, serif' }}>
                  Sizin İçin Kehanet
                </h2>
                <p className="text-amber-600 text-sm">
                  {formatTimestamp(falnameResult.timestamp)}
                </p>
              </div>

              {/* Intention Display */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-apple-md mb-apple-xl">
                <h4 className="font-semibold text-amber-900 mb-apple-xs">Niyetiniz:</h4>
                <p className="text-amber-800 italic" style={{ fontFamily: 'Georgia, serif' }}>
                  "{falnameResult.intention}"
                </p>
              </div>

              {/* Verse/Poem Section */}
              <div className="mb-apple-xl">
                <div className="flex items-center mb-apple-md">
                  <span className="text-2xl mr-3">📜</span>
                  <h3 className="text-xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                    Ayet / Kehanet
                  </h3>
                </div>
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-500 p-apple-lg rounded-r-xl">
                  <p className="text-lg leading-relaxed text-amber-900 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    {falnameResult.verse_or_poem}
                  </p>
                </div>
              </div>

              {/* Interpretation Section */}
              <div className="mb-apple-xl">
                <div className="flex items-center mb-apple-md">
                  <span className="text-2xl mr-3">🕯️</span>
                  <h3 className="text-xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                    Yorum
                  </h3>
                </div>
                <div className="bg-white/50 border border-amber-200 rounded-xl p-apple-lg">
                  <p className="text-amber-800 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                    {falnameResult.interpretation}
                  </p>
                </div>
              </div>

              {/* Advice Section */}
              <div className="mb-apple-xl">
                <div className="flex items-center mb-apple-md">
                  <span className="text-2xl mr-3">🌿</span>
                  <h3 className="text-xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                    Tavsiye
                  </h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-apple-lg">
                  <p className="text-green-800 leading-relaxed font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    {falnameResult.advice}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-apple-md">
                <button
                  onClick={resetFalname}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-apple-md px-apple-lg rounded-xl apple-transition shadow-lg"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  🔄 Yeni Fal Çek
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-apple-md px-apple-lg rounded-xl apple-transition shadow-lg"
                >
                  🖨️ Yazdır
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FalnameReading;