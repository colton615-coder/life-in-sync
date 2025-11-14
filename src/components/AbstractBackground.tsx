export function AbstractBackground() {
  return (
    <div className="abstract-bg">
      <div 
        className="abstract-shape"
        style={{
          width: '600px',
          height: '600px',
          background: 'linear-gradient(135deg, oklch(0.60 0.20 230), oklch(0.75 0.15 280))',
          top: '10%',
          left: '15%',
          animationDelay: '0s',
          opacity: '0.08',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '800px',
          height: '800px',
          background: 'linear-gradient(225deg, oklch(0.75 0.15 280), oklch(0.60 0.20 25))',
          bottom: '10%',
          right: '10%',
          animationDelay: '-10s',
          opacity: '0.08',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '500px',
          height: '500px',
          background: 'linear-gradient(90deg, oklch(0.65 0.18 150), oklch(0.70 0.18 180))',
          top: '50%',
          right: '20%',
          animationDelay: '-5s',
          opacity: '0.08',
        }}
      />
    </div>
  )
}
