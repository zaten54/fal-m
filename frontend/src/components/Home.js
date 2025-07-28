import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1716972016624-872990cf2ef7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBmb3J0dW5lfGVufDB8fHx8MTc1MzcwMDQ2N3ww&ixlib=rb-4.1.0&q=85')`
          }}
        ></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 font-serif">
              🔮 <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">Fal</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              AI destekli fal uygulaması ile geleceğinizi keşfedin
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Kahve falı, tarot, el falı ve astroloji - Yapay zeka ile desteklenen geleneksel fal yorumları
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Link 
                to="/coffee-reading" 
                className="group bg-black/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6 hover:bg-amber-500/10 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-4">☕</div>
                <h3 className="text-xl font-semibold text-white mb-2">Kahve Falı</h3>
                <p className="text-gray-400 text-sm">Kahve telvenizle geleceği keşfedin</p>
              </Link>
              
              <div className="group bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:bg-purple-500/10 transition-all duration-300 hover:scale-105 opacity-50 cursor-not-allowed">
                <div className="text-4xl mb-4">🃏</div>
                <h3 className="text-xl font-semibold text-white mb-2">Tarot</h3>
                <p className="text-gray-400 text-sm">Yakında gelecek...</p>
              </div>
              
              <div className="group bg-black/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:bg-blue-500/10 transition-all duration-300 hover:scale-105 opacity-50 cursor-not-allowed">
                <div className="text-4xl mb-4">✋</div>
                <h3 className="text-xl font-semibold text-white mb-2">El Falı</h3>
                <p className="text-gray-400 text-sm">Yakında gelecek...</p>
              </div>
              
              <div className="group bg-black/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:bg-green-500/10 transition-all duration-300 hover:scale-105 opacity-50 cursor-not-allowed">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold text-white mb-2">Astroloji</h3>
                <p className="text-gray-400 text-sm">Yakında gelecek...</p>
              </div>
            </div>
            
            <Link 
              to="/coffee-reading"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Kahve Falına Başla
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Neden Bizim Fal Uygulamamız?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Destekli Analiz</h3>
              <p className="text-gray-400">Gemini Vision AI ile görsel analiz ve geleneksel fal yorumlarının birleşimi</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Geleneksel Bilgi</h3>
              <p className="text-gray-400">Yüzyıllardır süregelen fal geleneklerini modern teknoloji ile buluşturuyoruz</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Gizlilik & Güvenlik</h3>
              <p className="text-gray-400">Verileriniz güvende - kişisel fal okumalarınız sadece size özel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;