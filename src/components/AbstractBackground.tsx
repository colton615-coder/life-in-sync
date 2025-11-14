export function AbstractBackground() {
  return (
    <div className="abstract-bg">
      <div 
        className="abstract-shape"
        style={{
          width: '800px',
          height: '800px',
          background: 'linear-gradient(135deg, oklch(0.70 0.25 330), oklch(0.80 0.20 280), oklch(0.75 0.22 250))',
          top: '5%',
          left: '10%',
          animationDelay: '0s',
          opacity: '0.25',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '900px',
          height: '900px',
          background: 'linear-gradient(225deg, oklch(0.75 0.22 200), oklch(0.70 0.25 320), oklch(0.80 0.18 30))',
          bottom: '5%',
          right: '5%',
          animationDelay: '-8s',
          opacity: '0.25',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '700px',
          height: '700px',
          background: 'linear-gradient(90deg, oklch(0.75 0.20 150), oklch(0.72 0.22 180), oklch(0.68 0.25 120))',
          top: '40%',
          right: '15%',
          animationDelay: '-4s',
          opacity: '0.22',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '600px',
          height: '600px',
          background: 'linear-gradient(180deg, oklch(0.78 0.20 60), oklch(0.72 0.24 45), oklch(0.70 0.26 25))',
          top: '60%',
          left: '5%',
          animationDelay: '-12s',
          opacity: '0.20',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '550px',
          height: '550px',
          background: 'linear-gradient(270deg, oklch(0.80 0.18 310), oklch(0.75 0.22 290))',
          bottom: '30%',
          left: '30%',
          animationDelay: '-6s',
          opacity: '0.18',
        }}
      />
    </div>
  )
}
