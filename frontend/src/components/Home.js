import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { t } = useLanguage();
  
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
      gradient: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-500/30',
      hoverColor: 'hover:bg-amber-500/10',
      available: true
    },
    {
      id: 'tarot',
      icon: '🃏',
      path: '/tarot-reading',
      titleKey: 'tarot',
      descKey: 'comingSoon',
      gradient: 'from-purple-500 to-violet-600',
      borderColor: 'border-purple-500/30',
      hoverColor: 'hover:bg-purple-500/10',
      available: true
    },
    {
      id: 'palm',
      icon: '✋',
      path: '#',
      titleKey: 'palmReading',
      descKey: 'comingSoon',
      gradient: 'from-blue-500 to-cyan-600',
      borderColor: 'border-blue-500/30',
      hoverColor: 'hover:bg-blue-500/10',
      available: false
    },
    {
      id: 'astrology',
      icon: '⭐',
      path: '#',
      titleKey: 'astrology',
      descKey: 'comingSoon',
      gradient: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-500/30',
      hoverColor: 'hover:bg-green-500/10',
      available: false
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <div className="relative">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Holographic Title */}
            <div className="mb-8 relative">
              <h1 className="text-8xl md:text-9xl font-bold mb-6 font-serif relative">
                <span className="text-6xl md:text-7xl animate-float mr-4">🔮</span>
                <span className="bg-gradient-to-r from-spiritual-cyan via-spiritual-purple to-spiritual-amber bg-clip-text text-transparent animate-holographic neon-text">
                  {t('title')}
                </span>
              </h1>
              {/* Cyber Grid Overlay */}
              <div className="absolute inset-0 cyber-grid opacity-20 rounded-3xl"></div>
            </div>
            
            <div className="glass-morph rounded-3xl p-8 mb-12 border border-spiritual-cyan/20">
              <p className="text-2xl md:text-3xl text-gray-200 mb-6 leading-relaxed animate-neon-flicker">
                {t('subtitle')}
              </p>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto opacity-90">
                {t('description')}
              </p>
            </div>
            
            {/* Fortune Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {fortuneTypes.map((type) => (
                type.available ? (
                  <Link 
                    key={type.id}
                    to={type.path} 
                    className={`group glass-morph border ${type.borderColor} rounded-xl p-6 ${type.hoverColor} transition-all duration-500 hover:scale-110 hover:rotate-3 hover:shadow-2xl hover:shadow-${type.id === 'coffee' ? 'amber' : type.id === 'tarot' ? 'purple' : type.id === 'palm' ? 'blue' : 'green'}-500/20 relative overflow-hidden`}
                  >
                    {/* Holographic Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="text-6xl mb-4 animate-float group-hover:animate-glow-pulse">
                      {type.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 neon-text">
                      {t(type.titleKey)}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {type.id === 'coffee' ? t('step1Desc') : type.id === 'tarot' ? 'Kartlarla geleceği keşfedin' : t('comingSoon')}
                    </p>
                    
                    {/* Active Indicator */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-glow-pulse"></div>
                  </Link>
                ) : (
                  <div 
                    key={type.id}
                    className="group glass-morph-dark border border-gray-600/30 rounded-xl p-6 transition-all duration-300 opacity-50 cursor-not-allowed relative"
                  >
                    <div className="text-6xl mb-4 grayscale">
                      {type.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      {t(type.titleKey)}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {t('comingSoon')}...
                    </p>
                    
                    {/* Coming Soon Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                      Soon
                    </div>
                  </div>
                )
              ))}
            </div>
            
            {/* Main CTA */}
            <Link 
              to="/coffee-reading"
              className="inline-flex items-center px-10 py-5 holographic-btn text-white font-bold text-xl rounded-full hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-amber-500/30 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                {t('startCoffeeReading')}
                <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-white mb-16 neon-text animate-neon-flicker">
            {t('whyOurApp')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                titleKey: 'aiAnalysis',
                descKey: 'aiAnalysisDesc',
                gradient: 'from-purple-500 to-pink-500',
                color: 'spiritual-purple'
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                titleKey: 'traditionalKnowledge',
                descKey: 'traditionalKnowledgeDesc',
                gradient: 'from-blue-500 to-cyan-500',
                color: 'spiritual-cyan'
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                titleKey: 'privacySecurity',
                descKey: 'privacySecurityDesc',
                gradient: 'from-green-500 to-teal-500',
                color: 'spiritual-emerald'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-float group-hover:animate-glow-pulse transition-all duration-500 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                <h3 className={`text-2xl font-semibold text-white mb-4 neon-text spiritual-${feature.color.split('-')[1]}`}>
                  {t(feature.titleKey)}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;