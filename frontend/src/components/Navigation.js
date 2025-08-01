import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const location = useLocation();
  const { t, changeLanguage, languages, currentLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-apple-gray-200">
      <div className="apple-container">
        <div className="flex items-center justify-between py-apple-sm">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-apple-2xl font-apple font-bold text-apple-gray-900 hover:text-apple-blue apple-transition"
          >
            <span className="text-apple-2xl">🔮</span>
            <span>{t('title')}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-apple-lg">
            <Link 
              to="/"
              className={`apple-transition px-apple-md py-apple-sm rounded-apple font-apple font-medium ${
                location.pathname === "/" 
                  ? "text-apple-blue bg-apple-blue/10" 
                  : "text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100"
              }`}
            >
              {t('home')}
            </Link>
            
            <Link 
              to="/coffee-reading"
              className={`apple-transition px-apple-md py-apple-sm rounded-apple font-apple font-medium ${
                location.pathname === "/coffee-reading" 
                  ? "text-apple-orange bg-apple-orange/10" 
                  : "text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100"
              }`}
            >
              {t('coffeeReading')}
            </Link>
            
            <Link 
              to="/tarot-reading"
              className={`apple-transition px-apple-md py-apple-sm rounded-apple font-apple font-medium ${
                location.pathname === "/tarot-reading" 
                  ? "text-apple-purple bg-apple-purple/10" 
                  : "text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100"
              }`}
            >
              {t('tarot')}
            </Link>
            
            <Link 
              to="/palm-reading"
              className={`apple-transition px-apple-md py-apple-sm rounded-apple font-apple font-medium ${
                location.pathname === "/palm-reading" 
                  ? "text-apple-green bg-apple-green/10" 
                  : "text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100"
              }`}
            >
              {t('palmReading')}
            </Link>
            
            <Link 
              to="/astrology-reading"
              className={`apple-transition px-apple-md py-apple-sm rounded-apple font-apple font-medium ${
                location.pathname === "/astrology-reading" 
                  ? "text-apple-yellow bg-apple-yellow/10" 
                  : "text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100"
              }`}
            >
              {t('astrology')}
            </Link>
            
            <Link 
              to="/falname-reading"
              className={`apple-transition px-apple-md py-apple-sm rounded-apple font-apple font-medium ${
                location.pathname === "/falname-reading" 
                  ? "text-amber-600 bg-amber-100" 
                  : "text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100"
              }`}
            >
              📜 Falname
            </Link>
            
            {/* Authentication Buttons */}
            {isAuthenticated ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-apple-md py-apple-sm bg-apple-purple/10 rounded-apple text-apple-purple hover:bg-apple-purple/20 apple-transition font-apple font-medium"
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:block font-apple text-apple-sm">
                    {user?.email?.split('@')[0]}
                  </span>
                  <svg 
                    className={`w-4 h-4 apple-transition ${showUserMenu ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-apple-lg shadow-apple-lg border border-apple-gray-200 overflow-hidden min-w-[200px] apple-scale-in">
                    <div className="px-apple-md py-apple-sm border-b border-apple-gray-100">
                      <p className="font-apple font-semibold text-apple-gray-900 text-apple-sm">
                        {user?.email}
                      </p>
                      <p className="font-apple text-apple-xs text-apple-gray-500">
                        {user?.is_verified ? '✅ Doğrulanmış' : '⚠️ Doğrulanmamış'}
                      </p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center space-x-3 px-apple-md py-apple-sm text-left apple-transition font-apple text-apple-gray-700 hover:bg-apple-gray-50"
                    >
                      <span className="text-lg">⚙️</span>
                      <span className="font-apple text-apple-sm">Profil Ayarları</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-apple-md py-apple-sm text-left apple-transition font-apple text-red-600 hover:bg-red-50"
                    >
                      <span className="text-lg">🚪</span>
                      <span className="font-apple text-apple-sm">Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Buttons */
              <div className="flex items-center space-x-apple-sm">
                <Link 
                  to="/login"
                  className="apple-button-secondary px-apple-md py-apple-sm text-apple-sm"
                >
                  Giriş
                </Link>
                <Link 
                  to="/register"
                  className="apple-button-primary px-apple-md py-apple-sm text-apple-sm"
                >
                  Kayıt
                </Link>
              </div>
            )}
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLanguageMenu(!showLanguageMenu);
                setShowUserMenu(false);
              }}
              className="flex items-center space-x-2 px-apple-md py-apple-sm bg-apple-gray-100 rounded-apple text-apple-gray-700 hover:bg-apple-gray-200 apple-transition font-apple font-medium"
            >
              <span className="text-lg">
                {languages.find(lang => lang.code === currentLanguage)?.flag}
              </span>
              <span className="hidden sm:block font-apple text-apple-sm">
                {languages.find(lang => lang.code === currentLanguage)?.name}
              </span>
              <svg 
                className={`w-4 h-4 apple-transition ${showLanguageMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-apple-lg shadow-apple-lg border border-apple-gray-200 overflow-hidden min-w-[180px] apple-scale-in">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLanguageMenu(false);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-apple-md py-apple-sm text-left apple-transition font-apple ${
                      currentLanguage === lang.code
                        ? 'bg-apple-blue text-white'
                        : 'text-apple-gray-700 hover:bg-apple-gray-100'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-apple text-apple-sm">{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-apple-gray-600 hover:text-apple-gray-900 apple-transition p-2">
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