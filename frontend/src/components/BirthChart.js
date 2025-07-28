import React from 'react';

const BirthChart = ({ birthChart, zodiacSigns }) => {
  if (!birthChart || !birthChart.houses || !birthChart.planets) {
    return (
      <div className="apple-card-elevated text-center">
        <p className="apple-text-body text-apple-gray-400">Doğum haritası bilgileri yükleniyor...</p>
      </div>
    );
  }

  const { houses, planets, ascendant } = birthChart;
  
  // Zodiac wheel positions (12 sections)
  const zodiacOrder = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  // Planet symbols
  const planetSymbols = {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃'
  };

  // Zodiac symbols
  const zodiacSymbols = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
    leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
    sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
  };

  // Get zodiac name in Turkish
  const getZodiacName = (sign) => {
    return zodiacSigns[sign]?.name || sign;
  };

  // Calculate position on circle
  const getCirclePosition = (degree, radius) => {
    const radian = (degree - 90) * (Math.PI / 180); // -90 to start from top
    return {
      x: 150 + radius * Math.cos(radian),
      y: 150 + radius * Math.sin(radian)
    };
  };

  return (
    <div className="glass-morph-dark rounded-xl p-6 border border-spiritual-violet/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-spiritual-violet/10 via-spiritual-amber/10 to-spiritual-cyan/10 animate-holographic"></div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-semibold text-white mb-6 text-center neon-text spiritual-violet">
          🌟 Doğum Haritası
        </h3>
        
        {/* SVG Birth Chart */}
        <div className="flex justify-center mb-6">
          <svg width="300" height="300" className="drop-shadow-2xl">
            {/* Outer circle (background) */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(139, 92, 246, 0.5)"
              strokeWidth="2"
            />
            
            {/* Inner circle */}
            <circle
              cx="150"
              cy="150"
              r="100"
              fill="none"
              stroke="rgba(6, 182, 212, 0.3)"
              strokeWidth="1"
            />
            
            {/* House divisions (12 sections) */}
            {Array.from({ length: 12 }).map((_, index) => {
              const angle = (index * 30) - 90; // 30 degrees per house, start from top
              const radian = angle * (Math.PI / 180);
              const x1 = 150 + 100 * Math.cos(radian);
              const y1 = 150 + 100 * Math.sin(radian);
              const x2 = 150 + 140 * Math.cos(radian);
              const y2 = 150 + 140 * Math.sin(radian);
              
              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Zodiac signs on outer ring */}
            {zodiacOrder.map((sign, index) => {
              const angle = index * 30; // 30 degrees per sign
              const pos = getCirclePosition(angle, 120);
              
              return (
                <g key={sign}>
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm fill-spiritual-amber"
                    fontSize="18"
                  >
                    {zodiacSymbols[sign]}
                  </text>
                </g>
              );
            })}
            
            {/* House numbers on inner ring */}
            {Array.from({ length: 12 }).map((_, index) => {
              const angle = (index * 30) + 15; // Offset by 15 degrees to center in house
              const pos = getCirclePosition(angle, 80);
              
              return (
                <text
                  key={index}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-spiritual-cyan"
                  fontSize="12"
                >
                  {index + 1}
                </text>
              );
            })}
            
            {/* Planets */}
            {Object.entries(planets).map(([planet, info]) => {
              const pos = getCirclePosition(info.degree || 0, 90);
              
              return (
                <g key={planet}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    fill="rgba(245, 158, 11, 0.2)"
                    stroke="rgba(245, 158, 11, 0.8)"
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-spiritual-amber"
                    fontSize="12"
                  >
                    {planetSymbols[planet] || planet.charAt(0).toUpperCase()}
                  </text>
                </g>
              );
            })}
            
            {/* Ascendant marker */}
            {ascendant && (
              <g>
                <line
                  x1="150"
                  y1="150"
                  x2="290"
                  y2="150"
                  stroke="rgba(16, 185, 129, 0.8)"
                  strokeWidth="2"
                />
                <text
                  x="295"
                  y="155"
                  className="text-xs fill-spiritual-emerald"
                  fontSize="10"
                >
                  ASC
                </text>
              </g>
            )}
            
            {/* Center point */}
            <circle
              cx="150"
              cy="150"
              r="3"
              fill="rgba(139, 92, 246, 0.8)"
            />
          </svg>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Planets Legend */}
          <div>
            <h4 className="text-spiritual-amber font-semibold mb-2">Gezegenler</h4>
            <div className="space-y-1">
              {Object.entries(planets).map(([planet, info]) => {
                const planetNames = {
                  sun: 'Güneş', moon: 'Ay', mercury: 'Merkür',
                  venus: 'Venüs', mars: 'Mars', jupiter: 'Jüpiter'
                };
                
                return (
                  <div key={planet} className="flex items-center space-x-2">
                    <span className="text-spiritual-amber text-lg">
                      {planetSymbols[planet] || '○'}
                    </span>
                    <span className="text-white text-xs">
                      {planetNames[planet] || planet}: {getZodiacName(info.sign)} ({info.house}. ev)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Houses Legend */}
          <div>
            <h4 className="text-spiritual-cyan font-semibold mb-2">Astroloji Evleri</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(houses).slice(0, 6).map(([houseKey, houseInfo]) => {
                const houseNum = houseKey.split('_')[1];
                return (
                  <div key={houseKey} className="text-gray-300">
                    <span className="text-spiritual-cyan">{houseNum}.</span> {houseInfo.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Ascendant Info */}
        {ascendant && (
          <div className="mt-4 p-3 bg-spiritual-emerald/10 border border-spiritual-emerald/20 rounded-lg text-center">
            <p className="text-spiritual-emerald font-semibold text-sm">
              Yükselen Burç: {getZodiacName(ascendant.sign)} ({ascendant.degree.toFixed(1)}°)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthChart;