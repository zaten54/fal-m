import React from 'react';

const FuturisticBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 via-violet-900 to-fuchsia-950 animate-gradient-xy"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float-slower"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-float"></div>
      
      {/* Geometric Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
          {Array.from({ length: 400 }).map((_, i) => (
            <div
              key={i}
              className="border border-cyan-400/30 hover:bg-cyan-400/10 transition-colors duration-500"
              style={{
                animationDelay: `${i * 0.01}s`,
                animation: `pulse 4s infinite alternate`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Scanning Lines */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-vertical"></div>
        <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-scan-horizontal"></div>
      </div>
      
      {/* Particle Effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Holographic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
    </div>
  );
};

export default FuturisticBackground;