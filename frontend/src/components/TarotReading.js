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
      className={`relative w-20 h-32 md:w-24 md:h-36 cursor-pointer apple-transition apple-hover-lift ${
        isSelected ? 'ring-2 ring-apple-purple' : ''
      } ${isAnimating ? 'animate-bounce' : ''}`}
    >
      {/* Card Back Design */}
      <div className="w-full h-full bg-gradient-to-br from-apple-purple/20 to-apple-blue/20 rounded-apple border border-apple-purple/30 flex items-center justify-center shadow-apple">
        <div className="text-apple-purple text-2xl">
          🔮
        </div>
      </div>
    </div>
  );

  const positions = ["Geçmiş", "Şimdi", "Gelecek"];

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-apple-3xl">
      <div className="apple-container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-apple-3xl apple-fade-in">
            <h1 className="apple-text-display mb-apple-md">
              <span className="text-apple-purple text-apple-4xl mr-4 animate-float-subtle">🃏</span>
              <span className="bg-gradient-to-r from-apple-purple to-apple-pink bg-clip-text text-transparent">
                Tarot
              </span>
            </h1>
            <p className="apple-text-headline text-apple-gray-600 mb-apple-lg max-w-2xl mx-auto">
              Kartları seçin ve geleceğinizi keşfedin
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-apple-purple to-apple-pink mx-auto rounded-full"></div>
          </div>

          {!reading && !showDeck && (
            <div className="text-center mb-apple-xl">
              <div className="apple-card-elevated max-w-2xl mx-auto apple-slide-up">
                <div 
                  className="w-48 h-48 mx-auto mb-apple-lg bg-cover bg-center rounded-apple-lg shadow-apple-lg relative overflow-hidden"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1671013033034-5ea58e9c5008?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMGNhcmRzfGVufDB8fHx8MTc1MzcwMzE1OXww&ixlib=rb-4.1.0&q=85')`
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 rounded-apple-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl animate-float-subtle">🔮</span>
                  </div>
                </div>
                
                <h3 className="apple-text-display mb-apple-md">
                  Tarot Okumaya Başlayın
                </h3>
                <p className="apple-text-body mb-apple-lg">
                  3 kart seçerek geçmişiniz, şimdiki durumunuz ve geleceğiniz hakkında rehberlik alın
                </p>
                
                <button
                  onClick={startReading}
                  className="apple-button-primary px-apple-xl py-apple-md text-apple-lg apple-hover-lift flex items-center space-x-2 mx-auto"
                >
                  <span className="text-xl">🃏</span>
                  <span>Kartları Karıştır</span>
                </button>
              </div>
            </div>
          )}

          {showDeck && !reading && (
            <div className="mb-apple-xl">
              <div className="apple-card-elevated apple-scale-in">
                <div className="text-center mb-apple-lg">
                  <h3 className="apple-text-headline mb-apple-md">
                    3 Kart Seçin ({selectedCards.length}/3)
                  </h3>
                  <p className="apple-text-body">
                    Sezgilerinizi dinleyerek 3 kart seçin
                  </p>
                </div>
                
                {/* Selected Cards Display */}
                {selectedCards.length > 0 && (
                  <div className="flex justify-center gap-4 mb-apple-lg">
                    {selectedCards.map((card, index) => (
                      <div key={card.id} className="text-center">
                        <div className="w-16 h-24 bg-apple-purple/10 border border-apple-purple/30 rounded-apple flex items-center justify-center mb-2">
                          <span className="text-lg font-apple font-bold">{index + 1}</span>
                        </div>
                        <p className="apple-text-caption text-apple-purple">{positions[index]}</p>
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
            <div className="text-center py-apple-3xl">
              <div className="apple-card max-w-md mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-apple-purple mx-auto mb-apple-lg"></div>
                <h3 className="apple-text-headline mb-apple-md">Kartlar Okunuyor...</h3>
                <p className="apple-text-body">AI kartlarınızı analiz ediyor</p>
              </div>
            </div>
          )}

          {reading && (
            <div className="space-y-apple-xl">
              <div className="apple-card-elevated apple-scale-in">
                <div className="flex justify-between items-center mb-apple-xl">
                  <h2 className="apple-text-display text-apple-green flex items-center">
                    <span className="text-apple-3xl mr-3">🃏</span>
                    Tarot Okuma Sonucu
                  </h2>
                  <button
                    onClick={resetReading}
                    className="apple-button-secondary"
                  >
                    Yeni Okuma
                  </button>
                </div>

                {/* Cards Display */}
                {reading.cards_drawn && reading.cards_drawn.length > 0 && (
                  <div className="mb-apple-xl">
                    <h3 className="apple-text-headline mb-apple-lg text-center text-apple-purple">
                      Seçilen Kartlar
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-apple-lg">
                      {reading.cards_drawn.map((cardData, index) => (
                        <div key={index} className="text-center">
                          <div className="apple-card apple-hover-lift apple-transition">
                            <h4 className="apple-text-headline text-apple-purple mb-apple-sm">
                              {positions[index]}
                            </h4>
                            <h5 className="apple-text-headline mb-apple-sm">
                              {cardData.card.name_tr}
                            </h5>
                            <p className="apple-text-caption text-apple-gray-500 mb-apple-sm">
                              ({cardData.card.name})
                            </p>
                            <p className="apple-text-caption text-apple-blue mb-apple-md">
                              {cardData.reversed ? "Ters" : "Düz"}
                            </p>
                            <div className="bg-apple-gray-50 rounded-apple p-apple-md">
                              <p className="apple-text-body">
                                {cardData.reversed ? cardData.card.meaning_reversed : cardData.card.meaning_upright}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interpretation */}
                <div className="mb-apple-xl">
                  <h3 className="apple-text-headline mb-apple-md text-apple-blue">
                    Tarot Yorumu
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
                      Spread: {reading.spread_type === 'three_card' ? '3 Kart' : reading.spread_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-apple-lg p-apple-md bg-red-50 border border-red-200 rounded-apple text-red-600 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarotReading;