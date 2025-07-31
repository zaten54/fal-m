import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [todayHoroscopes, setTodayHoroscopes] = useState([]);
  const [favoriteHoroscope, setFavoriteHoroscope] = useState(null);
  const [isLoadingHoroscopes, setIsLoadingHoroscopes] = useState(false);
  
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  // Günlük burç yorumlarını getir
  const fetchTodayHoroscopes = async () => {
    try {
      setIsLoadingHoroscopes(true);
      const response = await axios.get(`${API}/daily-horoscope/today?language=tr`);
      setTodayHoroscopes(response.data);
      
      // Kullanıcının favori burcu varsa o yorumu ayrıca getir
      if (isAuthenticated && user?.favorite_zodiac_sign) {
        const favoriteResponse = await axios.get(
          `${API}/daily-horoscope/${user.favorite_zodiac_sign}?language=tr`
        );
        setFavoriteHoroscope(favoriteResponse.data);
      }
    } catch (e) {
      console.error("Error fetching horoscopes:", e);
    } finally {
      setIsLoadingHoroscopes(false);
    }
  };

  const zodiacSigns = {
    aries: { name: "Koç", icon: "♈", color: "apple-red" },
    taurus: { name: "Boğa", icon: "♉", color: "apple-green" },
    gemini: { name: "İkizler", icon: "♊", color: "apple-yellow" },
    cancer: { name: "Yengeç", icon: "♋", color: "apple-blue" },
    leo: { name: "Aslan", icon: "♌", color: "apple-orange" },
    virgo: { name: "Başak", icon: "♍", color: "apple-green" },
    libra: { name: "Terazi", icon: "♎", color: "apple-pink" },
    scorpio: { name: "Akrep", icon: "♏", color: "apple-purple" },
    sagittarius: { name: "Yay", icon: "♐", color: "apple-orange" },
    capricorn: { name: "Oğlak", icon: "♑", color: "apple-gray" },
    aquarius: { name: "Kova", icon: "♒", color: "apple-blue" },
    pisces: { name: "Balık", icon: "♓", color: "apple-teal" }
  };

  useEffect(() => {
    helloWorldApi();
    fetchTodayHoroscopes();
  }, [isAuthenticated, user]);

  const fortuneTypes = [
    {
      id: 'coffee',
      icon: '☕',
      path: '/coffee-reading',
      titleKey: 'coffeeReading',
      descKey: 'step1Desc',
      color: 'apple-orange',
      available: true
    },
    {
      id: 'tarot',
      icon: '🃏',
      path: '/tarot-reading',
      titleKey: 'tarot',
      descKey: 'comingSoon',
      color: 'apple-purple',
      available: true
    },
    {
      id: 'palm',
      icon: '✋',
      path: '/palm-reading',
      titleKey: 'palmReading',
      descKey: 'comingSoon',
      color: 'apple-green',
      available: true
    },
    {
      id: 'astrology',
      icon: '⭐',
      path: '/astrology-reading',
      titleKey: 'astrology',
      descKey: 'comingSoon',
      color: 'apple-yellow',
      available: true
    },
    {
      id: 'falname',
      icon: '📜',
      path: '/falname-reading',
      titleKey: 'falname',
      descKey: 'falnameDesc',
      color: 'amber-600',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-apple-gray-50">
      {/* Hero Section */}
      <section className="apple-section pt-apple-3xl">
        <div className="apple-container text-center">
          {/* Main Title */}
          <div className="mb-apple-xl apple-fade-in">
            <h1 className="apple-text-display mb-apple-md">
              <span className="text-apple-4xl mr-4 animate-float-mystical">🔮</span>
              <span className="bg-gradient-to-r from-apple-purple via-apple-pink via-apple-blue to-apple-purple bg-clip-text text-transparent text-shadow-mystical animate-mystical-glow">
                {t('title')}
              </span>
              <span className="text-apple-4xl ml-4 animate-float-mystical">✨</span>
            </h1>
            <p className="apple-text-headline text-apple-gray-600 mb-apple-lg max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
            <p className="apple-text-body max-w-2xl mx-auto">
              {t('description')}
            </p>
            
            {/* Authentication Status */}
            {isAuthenticated ? (
              <div className="mt-apple-lg bg-apple-green/10 border border-apple-green/20 rounded-apple-lg p-apple-md max-w-md mx-auto">
                <p className="text-apple-green font-apple font-semibold flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>Hoş geldiniz, {user?.email?.split('@')[0]}!</span>
                </p>
              </div>
            ) : (
              <div className="mt-apple-lg bg-apple-blue/10 border border-apple-blue/20 rounded-apple-lg p-apple-md max-w-md mx-auto">
                <p className="text-apple-blue font-apple font-semibold mb-apple-sm">
                  🔐 Fal özelliklerini kullanmak için giriş yapın
                </p>
                <div className="flex justify-center space-x-apple-sm">
                  <Link 
                    to="/login"
                    className="apple-button-secondary px-apple-md py-apple-sm text-apple-sm"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    to="/register"
                    className="apple-button-primary px-apple-md py-apple-sm text-apple-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* CTA Button */}
          <div className="mb-apple-3xl apple-slide-up">
            {isAuthenticated ? (
              <Link 
                to="/coffee-reading"
                className="apple-button-primary inline-flex items-center space-x-2 text-apple-lg px-apple-xl py-apple-md shadow-apple-lg apple-hover-lift"
              >
                <span>{t('startCoffeeReading')}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <Link 
                to="/register"
                className="apple-button-primary inline-flex items-center space-x-2 text-apple-lg px-apple-xl py-apple-md shadow-apple-lg apple-hover-lift"
              >
                <span>Hemen Başlayın</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {/* Daily Horoscopes Section */}
      <section className="apple-section bg-apple-gray-25">
        <div className="apple-container">
          <div className="text-center mb-apple-3xl">
            <h2 className="apple-text-display mb-apple-lg">
              🌟 Günlük Burç Yorumları
            </h2>
            <p className="apple-text-headline text-apple-gray-600">
              Bugün yıldızlar sizin için ne diyor?
            </p>
          </div>

          {/* Favorite Horoscope (Authenticated Users) */}
          {isAuthenticated && favoriteHoroscope && (
            <div className="mb-apple-2xl">
              <div className="apple-card-elevated max-w-2xl mx-auto text-center bg-gradient-to-br from-apple-purple/5 to-apple-pink/5 border border-apple-purple/10">
                <div className="flex items-center justify-center mb-apple-md">
                  <span className="text-4xl mr-3">
                    {zodiacSigns[favoriteHoroscope.zodiac_sign]?.icon}
                  </span>
                  <div>
                    <h3 className="apple-text-headline text-apple-purple">
                      Sizin Burcunuz: {zodiacSigns[favoriteHoroscope.zodiac_sign]?.name}
                    </h3>
                    <p className="apple-text-caption text-apple-gray-500">
                      Bugüne özel yorumunuz
                    </p>
                  </div>
                </div>
                <p className="apple-text-body text-apple-gray-700 leading-relaxed">
                  {favoriteHoroscope.content}
                </p>
              </div>
            </div>
          )}

          {/* All Horoscopes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-apple-md">
            {isLoadingHoroscopes ? (
              // Loading state
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="apple-card animate-pulse">
                  <div className="flex items-center mb-apple-sm">
                    <div className="w-8 h-8 bg-apple-gray-200 rounded mr-3"></div>
                    <div className="h-4 bg-apple-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-apple-gray-200 rounded"></div>
                    <div className="h-3 bg-apple-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-apple-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))
            ) : (
              todayHoroscopes.map((horoscope, index) => {
                const zodiacInfo = zodiacSigns[horoscope.zodiac_sign] || {};
                const isUserFavorite = user?.favorite_zodiac_sign === horoscope.zodiac_sign;
                
                return (
                  <div
                    key={horoscope.zodiac_sign}
                    className={`apple-card apple-hover-lift apple-transition group cursor-pointer ${
                      isUserFavorite ? 'ring-2 ring-apple-purple ring-opacity-50' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center mb-apple-sm">
                      <span className={`text-2xl mr-3 text-${zodiacInfo.color}`}>
                        {zodiacInfo.icon}
                      </span>
                      <div>
                        <h4 className="apple-text-subheadline font-semibold">
                          {zodiacInfo.name}
                        </h4>
                        {isUserFavorite && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-apple font-medium bg-apple-purple/10 text-apple-purple">
                            ⭐ Favoriniz
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="apple-text-caption text-apple-gray-600 leading-relaxed line-clamp-4">
                      {horoscope.content}
                    </p>
                    <div className="mt-apple-sm">
                      <button className="text-apple-blue text-apple-caption font-semibold group-hover:text-apple-blue-dark apple-transition">
                        Devamını Oku →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Set Favorite Zodiac CTA */}
          {isAuthenticated && !user?.favorite_zodiac_sign && (
            <div className="text-center mt-apple-2xl">
              <div className="apple-card-elevated max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-4xl mb-apple-md">⭐</div>
                  <h3 className="apple-text-headline mb-apple-sm">
                    Favori Burcunuzu Seçin
                  </h3>
                  <p className="apple-text-body mb-apple-md text-apple-gray-600">
                    Favori burcunuzu belirleyerek kişisel günlük yorumlarınızı takip edin
                  </p>
                  <Link 
                    to="/profile"
                    className="apple-button-secondary"
                  >
                    Burç Seçimi Yap
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Fortune Types Grid */}
      <section className="apple-section">
        <div className="apple-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-apple-lg">
            {fortuneTypes.map((type, index) => (
              <Link 
                key={type.id}
                to={type.path} 
                className="apple-card apple-hover-lift apple-transition group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center">
                  <div className={`text-6xl mb-apple-md group-hover:scale-110 apple-transition text-${type.color}`}>
                    {type.icon}
                  </div>
                  <h3 className="apple-text-headline mb-apple-sm">
                    {t(type.titleKey)}
                  </h3>
                  <p className="apple-text-body">
                    {type.id === 'coffee' ? t('step1Desc') : 
                     type.id === 'tarot' ? 'Kartlarla geleceği keşfedin' : 
                     type.id === 'palm' ? 'El çizgilerinizi analiz edin' : 
                     type.id === 'astrology' ? 'Yıldızlardan mesajınızı alın' : 
                     type.id === 'falname' ? 'İlahi kehanetler ve kadim bilgelik' :
                     t('comingSoon')}
                  </p>
                  
                  {/* Status Indicator */}
                  <div className="mt-apple-md">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-apple font-medium bg-${type.color}/10 text-${type.color}`}>
                      <div className={`w-2 h-2 bg-${type.color} rounded-full mr-2`}></div>
                      Aktif
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="apple-section bg-white">
        <div className="apple-container">
          <div className="text-center mb-apple-3xl">
            <h2 className="apple-text-display mb-apple-lg">
              {t('whyOurApp')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-apple-xl">
            {[
              {
                icon: (
                  <svg className="w-12 h-12 text-apple-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                titleKey: 'aiAnalysis',
                descKey: 'aiAnalysisDesc',
                color: 'apple-blue'
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-apple-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                titleKey: 'traditionalKnowledge',
                descKey: 'traditionalKnowledgeDesc',
                color: 'apple-green'
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-apple-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                titleKey: 'privacySecurity',
                descKey: 'privacySecurityDesc',
                color: 'apple-purple'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center apple-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className={`w-20 h-20 bg-${feature.color}/10 rounded-apple-xl flex items-center justify-center mx-auto mb-apple-lg apple-hover-lift apple-transition`}>
                  {feature.icon}
                </div>
                <h3 className={`apple-text-headline mb-apple-md text-${feature.color}`}>
                  {t(feature.titleKey)}
                </h3>
                <p className="apple-text-body">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="apple-section">
        <div className="apple-container text-center">
          <div className="apple-card-elevated max-w-2xl mx-auto">
            <h2 className="apple-text-headline mb-apple-md">
              Falınıza Başlamaya Hazır mısınız?
            </h2>
            <p className="apple-text-body mb-apple-lg">
              AI destekli fal yorumlarımızla geleceğinizi keşfedin
            </p>
            <Link 
              to="/coffee-reading"
              className="apple-button-primary text-apple-lg px-apple-xl py-apple-md"
            >
              Hemen Başlayın
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;