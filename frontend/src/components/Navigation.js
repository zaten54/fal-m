import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-amber-400 transition-colors"
          >
            <span>🔮</span>
            <span>Fal</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/"
              className={`transition-colors ${
                location.pathname === "/" 
                  ? "text-amber-400" 
                  : "text-white hover:text-amber-400"
              }`}
            >
              Ana Sayfa
            </Link>
            <Link 
              to="/coffee-reading"
              className={`transition-colors ${
                location.pathname === "/coffee-reading" 
                  ? "text-amber-400" 
                  : "text-white hover:text-amber-400"
              }`}
            >
              Kahve Falı
            </Link>
            <span className="text-gray-500">Tarot (Yakında)</span>
            <span className="text-gray-500">El Falı (Yakında)</span>
            <span className="text-gray-500">Astroloji (Yakında)</span>
          </div>
          
          <div className="md:hidden">
            <button className="text-white">
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