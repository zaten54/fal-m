import React from 'react';

const AppleBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-100"></div>
      
      {/* Subtle geometric patterns */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-apple-blue rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-apple-green rounded-full blur-3xl"></div>
      </div>
      
      {/* Very subtle noise texture for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px'
        }}
      ></div>
    </div>
  );
};

export default AppleBackground;