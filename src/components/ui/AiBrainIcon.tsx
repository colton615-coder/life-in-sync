import React from 'react';

interface AiBrainIconProps {
  className?: string;
}

const AiBrainIcon: React.FC<AiBrainIconProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.6;
              filter: drop-shadow(0 0 1px #08D9D6);
            }
            50% {
              opacity: 1;
              filter: drop-shadow(0 0 3px #08D9D6);
            }
          }

          .brain-outline {
            stroke: #08D9D6; /* Cyan/Teal */
            stroke-width: 1.5;
            fill: none;
          }

          .brain-circuits {
            stroke: #08D9D6; /* Cyan/Teal */
            stroke-width: 0.75;
            fill: none;
            animation: pulse 3s infinite ease-in-out;
          }

          .central-node {
            fill: #08D9D6;
            animation: pulse 3s infinite ease-in-out;
            animation-delay: 0.5s; /* Stagger the animation */
          }
        `}
      </style>
      <g className="brain">
        {/* Outer Brain Shape */}
        <path
          className="brain-outline"
          d="M50 10 C25 10, 20 30, 20 50 C20 70, 25 90, 50 90 C75 90, 80 70, 80 50 C80 30, 75 10, 50 10 Z"
          transform="rotate(15 50 50)"
        />
        <path
          className="brain-outline"
          d="M50 12 C30 12, 22 30, 22 50 C22 70, 30 88, 50 88 C70 88, 78 70, 78 50 C78 30, 70 12, 50 12 Z"
          transform="rotate(-10 50 50)"
        />

        {/* Inner Circuits */}
        <path
          className="brain-circuits"
          d="M50 15 V 85 M15 50 H 85"
        />
        <path
          className="brain-circuits"
          d="M30 30 L 70 70 M70 30 L 30 70"
          style={{ animationDelay: '0.2s' }}
        />

        {/* Central Node */}
        <circle className="central-node" cx="50" cy="50" r="4" />

        {/* Connecting Lines to Node */}
        <path className="brain-circuits" d="M50 54 V 70" style={{ animationDelay: '0.4s' }} />
        <path className="brain-circuits" d="M50 46 V 30" style={{ animationDelay: '0.6s' }}/>
        <path className="brain-circuits" d="M46 50 H 30" style={{ animationDelay: '0.8s' }}/>
        <path className="brain-circuits" d="M54 50 H 70" style={{ animationDelay: '1s' }}/>
      </g>
    </svg>
  );
};

export default AiBrainIcon;
