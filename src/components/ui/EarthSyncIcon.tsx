import React from 'react';

export const EarthSyncIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id="earthGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'rgba(12, 12, 24, 0.1)', stopOpacity: 1 }} />
          <stop offset="70%" style={{ stopColor: 'rgba(12, 12, 24, 0.1)', stopOpacity: 1 }} />
          <stop offset="95%" style={{ stopColor: 'rgba(139, 92, 246, 0.4)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(139, 92, 246, 0.6)', stopOpacity: 1 }} />
        </radialGradient>
        <linearGradient id="syncArrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#c026d3', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Earth Sphere */}
      <circle cx="100" cy="100" r="70" fill="url(#earthGradient)" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1.5" />

      {/* Abstract Continents */}
      <path d="M 85 70 C 70 80, 75 100, 85 110 C 95 120, 105 125, 110 120" fill="rgba(139, 92, 246, 0.2)" stroke="none" />
      <path d="M 115 80 C 130 85, 135 100, 125 115 C 115 130, 100 130, 105 115" fill="rgba(139, 92, 246, 0.25)" stroke="none" />
      <path d="M 90 130 C 95 145, 110 145, 115 135" fill="rgba(139, 92, 246, 0.15)" stroke="none" />

      {/* Sync Arrow */}
      <g transform="translate(100 100)">
          <path
            d="M 0 -90 A 90 90 0 1 1 -83.5 -35"
            fill="none"
            stroke="url(#syncArrowGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          {/* Arrowhead */}
          <path
            d="M -97.5 -48 L -83.5 -35 L -69.5 -48"
            fill="none"
            stroke="url(#syncArrowGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
      </g>
    </svg>
  );
};
