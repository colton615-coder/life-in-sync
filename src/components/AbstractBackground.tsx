export function AbstractBackground() {
  return (
    <div className="abstract-bg">
      <div 
        className="abstract-shape"
        style={{
          width: '1000px',
          height: '1000px',
          background: 'linear-gradient(135deg, oklch(0.85 0.25 330), oklch(0.90 0.20 310), oklch(0.88 0.22 290))',
          top: '-10%',
          left: '5%',
          animationDelay: '0s',
          opacity: '0.6',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '1100px',
          height: '1100px',
          background: 'linear-gradient(225deg, oklch(0.88 0.22 200), oklch(0.82 0.25 180), oklch(0.90 0.18 220))',
          bottom: '-10%',
          right: '0%',
          animationDelay: '-8s',
          opacity: '0.55',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '900px',
          height: '900px',
          background: 'linear-gradient(90deg, oklch(0.90 0.20 150), oklch(0.85 0.22 170), oklch(0.82 0.25 140))',
          top: '30%',
          right: '10%',
          animationDelay: '-4s',
          opacity: '0.5',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '800px',
          height: '800px',
          background: 'linear-gradient(180deg, oklch(0.92 0.20 60), oklch(0.88 0.24 45), oklch(0.85 0.26 30))',
          top: '55%',
          left: '0%',
          animationDelay: '-12s',
          opacity: '0.48',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '700px',
          height: '700px',
          background: 'linear-gradient(270deg, oklch(0.88 0.18 280), oklch(0.92 0.22 260))',
          bottom: '25%',
          left: '35%',
          animationDelay: '-6s',
          opacity: '0.45',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '650px',
          height: '650px',
          background: 'linear-gradient(45deg, oklch(0.90 0.25 110), oklch(0.85 0.28 130))',
          top: '10%',
          right: '30%',
          animationDelay: '-10s',
          opacity: '0.42',
        }}
      />
    </div>
  )
}
