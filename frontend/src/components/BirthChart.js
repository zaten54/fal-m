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
    <div className="apple-card-elevated relative overflow-hidden apple-scale-in">
      <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/5 via-apple-purple/5 to-apple-pink/5"></div>
      
      <div className="relative z-10">
        <h3 className="apple-text-display text-center mb-apple-xl">
          <span className="text-apple-yellow text-apple-3xl mr-3 animate-float-subtle">🌟</span>
          <span className="bg-gradient-to-r from-apple-purple to-apple-pink bg-clip-text text-transparent">
            Doğum Haritası
          </span>
        </h3>
        
        {/* SVG Birth Chart */}
        <div className="flex justify-center mb-apple-xl">
          <svg width="300" height="300" className="shadow-apple-lg">
            {/* Outer circle (background) */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="rgba(255,255,255,0.8)"
              stroke="rgba(175, 82, 222, 0.3)"
              strokeWidth="2"
            />
            
            {/* Inner circle */}
            <circle
              cx="150"
              cy="150"
              r="100"
              fill="none"
              stroke="rgba(0, 122, 255, 0.3)"
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
                  stroke="rgba(175, 82, 222, 0.2)"
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
                    className="text-sm fill-apple-orange"
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
                  className="text-xs fill-apple-blue"
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
                    fill="rgba(255, 204, 0, 0.2)"
                    stroke="rgba(255, 204, 0, 0.8)"
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-apple-yellow"
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
                  stroke="rgba(52, 199, 89, 0.8)"
                  strokeWidth="2"
                />
                <text
                  x="295"
                  y="155"
                  className="text-xs fill-apple-green"
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
              fill="rgba(175, 82, 222, 0.8)"
            />
          </svg>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-apple-lg apple-text-sm">
          {/* Planets Legend */}
          <div>
            <h4 className="apple-text-headline text-apple-orange font-apple font-semibold mb-apple-md">Gezegenler</h4>
            <div className="apple-card space-y-2">
              {Object.entries(planets).map(([planet, info]) => {
                const planetNames = {
                  sun: 'Güneş', moon: 'Ay', mercury: 'Merkür',
                  venus: 'Venüs', mars: 'Mars', jupiter: 'Jüpiter'
                };
                
                return (
                  <div key={planet} className="flex items-center space-x-2">
                    <span className="text-apple-yellow text-apple-lg">
                      {planetSymbols[planet] || '○'}
                    </span>
                    <span className="apple-text-body text-apple-gray-700">
                      {planetNames[planet] || planet}: {getZodiacName(info.sign)} ({info.house}. ev)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Houses Legend */}
          <div>
            <h4 className="apple-text-headline text-apple-blue font-apple font-semibold mb-apple-md">Astroloji Evleri</h4>
            <div className="apple-card">
              <div className="grid grid-cols-2 gap-2 apple-text-sm">
                {Object.entries(houses).slice(0, 6).map(([houseKey, houseInfo]) => {
                  const houseNum = houseKey.split('_')[1];
                  return (
                    <div key={houseKey} className="apple-text-body text-apple-gray-600">
                      <span className="text-apple-blue font-apple font-semibold">{houseNum}.</span> {houseInfo.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Ascendant Info */}
        {ascendant && (
          <div className="mt-apple-lg apple-card bg-apple-green/5 border border-apple-green/20 text-center">
            <p className="apple-text-body text-apple-green font-apple font-semibold">
              Yükselen Burç: {getZodiacName(ascendant.sign)} ({ascendant.degree.toFixed(1)}°)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthChart;