import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

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
              <span className="text-apple-4xl mr-4 animate-float-subtle">🔮</span>
              <span className="bg-gradient-to-r from-apple-blue via-apple-purple to-apple-blue bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>
            <p className="apple-text-headline text-apple-gray-600 mb-apple-lg max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
            <p className="apple-text-body max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="mb-apple-3xl apple-slide-up">
            <Link 
              to="/coffee-reading"
              className="apple-button-primary inline-flex items-center space-x-2 text-apple-lg px-apple-xl py-apple-md shadow-apple-lg apple-hover-lift"
            >
              <span>{t('startCoffeeReading')}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
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