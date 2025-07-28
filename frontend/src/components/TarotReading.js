import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TarotReading = () => {
  const { t } = useLanguage();
  const [tarotCards, setTarotCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reading, setReading] = useState(null);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [showDeck, setShowDeck] = useState(false);
  const [cardAnimations, setCardAnimations] = useState([]);

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `tarot_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    loadTarotCards();
  }, []);

  const loadTarotCards = async () => {
    try {
      const response = await axios.get(`${API}/tarot-cards`);
      setTarotCards(response.data);
    } catch (err) {
      console.error("Load tarot cards error:", err);
      setError("Tarot kartları yüklenemedi. Lütfen tekrar deneyin.");
    }
  };

  const startReading = () => {
    setShowDeck(true);
    setSelectedCards([]);
    setReading(null);
    setError("");
  };

  const selectCard = (card) => {
    if (selectedCards.length < 3 && !selectedCards.find(c => c.id === card.id)) {
      const newSelectedCards = [...selectedCards, card];
      setSelectedCards(newSelectedCards);
      
      // Animate card selection
      setCardAnimations(prev => [...prev, card.id]);
      setTimeout(() => {
        setCardAnimations(prev => prev.filter(id => id !== card.id));
      }, 1000);
      
      if (newSelectedCards.length === 3) {
        setTimeout(() => {
          performReading(newSelectedCards);
        }, 500);
      }
    }
  };

  const performReading = async (cards) => {
    setIsLoading(true);
    setShowDeck(false);
    
    try {
      const response = await axios.post(`${API}/tarot-reading`, {
        spread_type: "three_card",
        session_id: sessionId
      });

      setReading(response.data);
    } catch (err) {
      console.error("Tarot reading error:", err);
      setError(
        err.response?.data?.detail || 
        "Tarot okuma sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetReading = () => {
    setSelectedCards([]);
    setReading(null);
    setError("");
    setShowDeck(false);
  };

  const CardBack = ({ onClick, isSelected, cardId, isAnimating }) => (
    <div
      onClick={onClick}
      className={`relative w-24 h-36 md:w-32 md:h-48 cursor-pointer transition-all duration-500 hover:scale-110 ${
        isSelected ? 'ring-4 ring-spiritual-amber animate-glow-pulse' : ''
      } ${isAnimating ? 'animate-bounce' : ''}`}
    >
      {/* Card Back Design */}
      <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-xl border-2 border-spiritual-cyan/30 relative overflow-hidden">
        {/* Mystical Pattern */}
        <div className="absolute inset-2 border border-spiritual-amber/40 rounded-lg flex items-center justify-center">
          <div className="text-spiritual-amber text-2xl animate-float">
            🔮
          </div>
        </div>
        
        {/* Holographic Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Corner Decorations */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-spiritual-cyan/50"></div>
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-spiritual-cyan/50"></div>
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-spiritual-cyan/50"></div>
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-spiritual-cyan/50"></div>
      </div>
      
      {/* Selection Glow */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl bg-spiritual-amber/20 animate-pulse"></div>
      )}
    </div>
  );

  const positions = ["Geçmiş", "Şimdi", "Gelecek"];

  return (
    <div className="min-h-screen relative pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Futuristic Header */}
          <div className="text-center mb-12 relative">
            <div className="glass-morph rounded-3xl p-8 border border-spiritual-purple/20 relative overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-10"></div>
              
              <h1 className="text-6xl font-bold text-white mb-4 font-serif relative z-10">
                <span className="animate-float text-5xl mr-4">🃏</span>
                <span className="bg-gradient-to-r from-spiritual-purple via-spiritual-rose to-spiritual-purple bg-clip-text text-transparent animate-holographic neon-text">
                  Tarot
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-6 animate-neon-flicker">
                Kartları seçin ve geleceğinizi keşfedin
              </p>
              
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-spiritual-purple to-transparent mx-auto rounded-full animate-holographic"></div>
            </div>
          </div>

          {!reading && !showDeck && (
            <div className="text-center mb-12">
              <div className="glass-morph rounded-2xl p-8 border border-spiritual-purple/20 max-w-2xl mx-auto">
                <div 
                  className="w-48 h-48 mx-auto mb-8 bg-cover bg-center rounded-xl border border-spiritual-purple/30 relative overflow-hidden"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1671013033034-5ea58e9c5008?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMGNhcmRzfGVufDB8fHx8MTc1MzcwMzE1OXww&ixlib=rb-4.1.0&q=85')`
                  }}
                >
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl animate-float">🔮</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4 neon-text">
                  Tarot Okumaya Başlayın
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  3 kart seçerek geçmişiniz, şimdiki durumunuz ve geleceğiniz hakkında rehberlik alın
                </p>
                
                <button
                  onClick={startReading}
                  className="px-10 py-4 holographic-btn text-white font-bold text-xl rounded-full hover:scale-110 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-2xl relative overflow-hidden"
                >
                  <span className="text-2xl animate-glow-pulse">🃏</span>
                  <span>Kartları Karıştır</span>
                </button>
              </div>
            </div>
          )}

          {showDeck && !reading && (
            <div className="mb-12">
              <div className="glass-morph rounded-2xl p-8 border border-spiritual-purple/20">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    3 Kart Seçin ({selectedCards.length}/3)
                  </h3>
                  <p className="text-gray-300">
                    Sezgilerinizi dinleyerek 3 kart seçin
                  </p>
                </div>
                
                {/* Selected Cards Display */}
                {selectedCards.length > 0 && (
                  <div className="flex justify-center gap-4 mb-8">
                    {selectedCards.map((card, index) => (
                      <div key={card.id} className="text-center">
                        <div className="w-20 h-30 bg-gradient-to-br from-spiritual-amber/20 to-spiritual-rose/20 border border-spiritual-amber/30 rounded-lg flex items-center justify-center mb-2">
                          <span className="text-2xl">{index + 1}</span>
                        </div>
                        <p className="text-sm text-spiritual-amber">{positions[index]}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Card Deck */}
                <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-4 max-h-96 overflow-y-auto">
                  {tarotCards.map((card) => (
                    <CardBack
                      key={card.id}
                      cardId={card.id}
                      onClick={() => selectCard(card)}
                      isSelected={selectedCards.find(c => c.id === card.id)}
                      isAnimating={cardAnimations.includes(card.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-20">
              <div className="glass-morph rounded-2xl p-12 border border-spiritual-purple/20 max-w-md mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-spiritual-purple mx-auto mb-6"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Kartlar Okunuyor...</h3>
                <p className="text-gray-300">AI kartlarınızı analiz ediyor</p>
              </div>
            </div>
          )}

          {reading && (
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
                    <span className="text-3xl animate-glow-pulse mr-3">🃏</span>
                    Tarot Okuma Sonucu
                  </h2>
                  <button
                    onClick={resetReading}
                    className="px-6 py-3 glass-morph-dark text-white rounded-full hover:bg-spiritual-cyan/20 hover:border-spiritual-cyan/50 transition-all duration-300 border border-gray-600/30 hover:scale-110"
                  >
                    Yeni Okuma
                  </button>
                </div>

                {/* Cards Display */}
                {reading.cards_drawn && reading.cards_drawn.length > 0 && (
                  <div className="mb-8 relative z-10">
                    <h3 className="text-2xl font-semibold text-white mb-6 neon-text spiritual-amber text-center">
                      Seçilen Kartlar
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {reading.cards_drawn.map((cardData, index) => (
                        <div key={index} className="text-center">
                          <div className="glass-morph-dark rounded-xl p-4 border border-spiritual-purple/20 relative overflow-hidden hover:scale-105 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-spiritual-purple/10 via-spiritual-cyan/5 to-spiritual-amber/10 animate-holographic"></div>
                            
                            <div className="relative z-10">
                              <h4 className="text-lg font-bold text-spiritual-amber mb-2">
                                {positions[index]}
                              </h4>
                              <h5 className="text-xl font-semibold text-white mb-2">
                                {cardData.card.name_tr}
                              </h5>
                              <p className="text-sm text-gray-400 mb-3">
                                ({cardData.card.name})
                              </p>
                              <p className="text-sm text-spiritual-cyan">
                                {cardData.reversed ? "Ters" : "Düz"}
                              </p>
                              <div className="mt-4 p-3 bg-black/20 rounded-lg">
                                <p className="text-sm text-gray-300">
                                  {cardData.reversed ? cardData.card.meaning_reversed : cardData.card.meaning_upright}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interpretation */}
                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-semibold text-white mb-4 neon-text spiritual-purple">
                    Tarot Yorumu
                  </h3>
                  <div className="glass-morph-dark rounded-2xl p-6 border border-spiritual-purple/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-spiritual-purple/5 via-spiritual-cyan/5 to-spiritual-amber/5 animate-holographic"></div>
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
                      <span>🃏</span>
                      <span>Spread: {reading.spread_type === 'three_card' ? '3 Kart' : reading.spread_type}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 glass-morph-dark border border-spiritual-rose/50 rounded-xl text-spiritual-rose text-center animate-glow-pulse">
              <span className="neon-text">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarotReading;