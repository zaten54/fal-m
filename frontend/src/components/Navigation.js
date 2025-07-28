import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Navigation = () => {
  const location = useLocation();
  const { t, changeLanguage, languages, currentLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morph border-b border-spiritual-cyan/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-3xl font-bold text-white hover:text-spiritual-cyan transition-all duration-300 group"
          >
            <span className="text-4xl animate-glow-pulse">🔮</span>
            <span className="neon-text spiritual-cyan animate-neon-flicker">{t('title')}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/"
              className={`relative px-4 py-2 rounded-full transition-all duration-300 ${
                location.pathname === "/" 
                  ? "text-spiritual-cyan neon-text bg-spiritual-cyan/10 border border-spiritual-cyan/30" 
                  : "text-white hover:text-spiritual-cyan hover:bg-spiritual-cyan/5"
              }`}
            >
              {t('home')}
              {location.pathname === "/" && (
                <div className="absolute inset-0 rounded-full bg-spiritual-cyan/20 animate-glow-pulse"></div>
              )}
            </Link>
            
            <Link 
              to="/coffee-reading"
              className={`relative px-4 py-2 rounded-full transition-all duration-300 ${
                location.pathname === "/coffee-reading" 
                  ? "text-spiritual-amber neon-text bg-spiritual-amber/10 border border-spiritual-amber/30" 
                  : "text-white hover:text-spiritual-amber hover:bg-spiritual-amber/5"
              }`}
            >
              {t('coffeeReading')}
              {location.pathname === "/coffee-reading" && (
                <div className="absolute inset-0 rounded-full bg-spiritual-amber/20 animate-glow-pulse"></div>
              )}
            </Link>
            
            <Link 
              to="/tarot-reading"
              className={`relative px-4 py-2 rounded-full transition-all duration-300 ${
                location.pathname === "/tarot-reading" 
                  ? "text-spiritual-purple neon-text bg-spiritual-purple/10 border border-spiritual-purple/30" 
                  : "text-white hover:text-spiritual-purple hover:bg-spiritual-purple/5"
              }`}
            >
              {t('tarot')}
              {location.pathname === "/tarot-reading" && (
                <div className="absolute inset-0 rounded-full bg-spiritual-purple/20 animate-glow-pulse"></div>
              )}
            </Link>
            <Link 
              to="/palm-reading"
              className={`relative px-4 py-2 rounded-full transition-all duration-300 ${
                location.pathname === "/palm-reading" 
                  ? "text-spiritual-cyan neon-text bg-spiritual-cyan/10 border border-spiritual-cyan/30" 
                  : "text-white hover:text-spiritual-cyan hover:bg-spiritual-cyan/5"
              }`}
            >
              {t('palmReading')}
              {location.pathname === "/palm-reading" && (
                <div className="absolute inset-0 rounded-full bg-spiritual-cyan/20 animate-glow-pulse"></div>
              )}
            </Link>
            <Link 
              to="/astrology-reading"
              className={`relative px-4 py-2 rounded-full transition-all duration-300 ${
                location.pathname === "/astrology-reading" 
                  ? "text-spiritual-amber neon-text bg-spiritual-amber/10 border border-spiritual-amber/30" 
                  : "text-white hover:text-spiritual-amber hover:bg-spiritual-amber/5"
              }`}
            >
              {t('astrology')}
              {location.pathname === "/astrology-reading" && (
                <div className="absolute inset-0 rounded-full bg-spiritual-amber/20 animate-glow-pulse"></div>
              )}
            </Link>
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center space-x-2 px-4 py-2 glass-morph-dark rounded-full text-white hover:text-spiritual-purple transition-all duration-300 border border-spiritual-purple/20 hover:border-spiritual-purple/50"
            >
              <span className="text-xl">
                {languages.find(lang => lang.code === currentLanguage)?.flag}
              </span>
              <span className="hidden sm:block">
                {languages.find(lang => lang.code === currentLanguage)?.name}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute top-full right-0 mt-2 glass-morph border border-spiritual-purple/20 rounded-xl overflow-hidden shadow-2xl min-w-[180px]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                      currentLanguage === lang.code
                        ? 'bg-spiritual-purple/20 text-spiritual-purple neon-text'
                        : 'text-white hover:bg-spiritual-purple/10 hover:text-spiritual-purple'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <div className="ml-auto w-2 h-2 bg-spiritual-purple rounded-full animate-glow-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-white hover:text-spiritual-cyan transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;