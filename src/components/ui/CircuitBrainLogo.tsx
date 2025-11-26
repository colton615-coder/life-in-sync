import React from 'react';

export const CircuitBrainLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Circuit Brain Logo"
    >
      <defs>
        <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F6FF" />
          <stop offset="100%" stopColor="#6D4AFF" />
        </linearGradient>
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            .brain-path {
              stroke: url(#glow-gradient);
              stroke-width: 1.2;
              stroke-linecap: round;
              stroke-linejoin: round;
              fill: none;
              filter: url(#neon-glow);
            }
            .cpu {
              fill: url(#glow-gradient);
              filter: url(#neon-glow);
              stroke-width: 0.5;
              stroke: #fff;
            }
          `}
        </style>
      </defs>

      {/* Main brain outline and internal structures */}
      <path className="brain-path" d="M49.7,7.9c-0.1,0-0.2,0-0.3,0c-0.1,0-0.1,0-0.2,0c-11.2,0.4-20.5,5.1-27.1,13.8c-4,5.2-6.5,11.2-6.8,17.7 C15,43.2,17,47,19.9,50.1c4,4.3,9.2,6.7,14.8,6.7c0.2,0,0.3,0,0.5,0c4.9-0.2,9.6-2.1,13.5-5.2c5-4,8.6-9.6,9.8-15.7 c1-5.1,0.2-10.4-2.1-15.1C53.7,14,50.1,10.6,45.4,8.7C46.8,8.2,48.2,7.9,49.7,7.9z"/>
      <path className="brain-path" d="M29.6,50.5c-1.3,0.3-2.6,0.5-3.9,0.5c-4.9,0-9.5-2.2-12.7-6c-2.3-2.7-3.7-6.1-4-9.7c-0.4-5.3,1.2-10.4,4.4-14.6 c4.9-6.4,12.1-10.1,19.9-10.5c0.1,0,0.2,0,0.3,0c0.1,0,0.2,0,0.3,0c2.6,0.1,5.1,0.7,7.4,1.8"/>
      <path className="brain-path" d="M68,18.1c-1.1-2.9-2.8-5.6-4.9-7.9C57.2,4,49.7,1.1,41.6,2.2C35.9,3,30.8,6.1,27.3,10.9"/>
      <path className="brain-path" d="M37.9,56.8c-2.8,0-5.5-0.7-8-2c-3.7-1.9-6.8-4.9-8.6-8.5"/>
      <path className="brain-path" d="M63.7,51.8c-3.1,3.3-7.2,5.3-11.7,5.6c-0.1,0-0.2,0-0.3,0c-1.1,0-2.2-0.1-3.3-0.4"/>
      <path className="brain-path" d="M49.7,72.1c5.9,0,11.5-2.2,15.9-6.1c5.1-4.5,8.1-10.8,8.1-17.5c0-6.1-2.5-11.8-6.8-15.9"/>

      {/* CPU and radiating circuits */}
      <rect x="44" y="34" width="12" height="12" rx="1" className="cpu" />

      {/* Top connections */}
      <path className="brain-path" d="M47,34v-5c0-2.2,1.8-4,4-4h2"/>
      <path className="brain-path" d="M53,34v-3c0-1.1,0.9-2,2-2h4c1.1,0,2,0.9,2,2v5"/>

      {/* Bottom connections */}
      <path className="brain-path" d="M47,46v5c0-2.2-1.8,4-4,4h-2"/>
      <path className="brain-path" d="M53,46v3c0,1.1-0.9,2-2,2h-4c-1.1,0-2-0.9-2-2v-5"/>

      {/* Left connections */}
      <path className="brain-path" d="M44,37h-5c-2.2,0-4-1.8-4-4v-2"/>
      <path className="brain-path" d="M44,43h-3c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2h5"/>

      {/* Right connections */}
      <path className="brain-path" d="M56,37h5c2.2,0,4,1.8,4,4v2"/>
      <path className="brain-path" d="M56,43h3c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-5"/>

    </svg>
  );
};
