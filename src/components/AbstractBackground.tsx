export function AbstractBackground() {
  return (
    <div className="abstract-bg">
      <div 
        className="abstract-shape"
        style={{
          width: '600px',
          height: '600px',
          background: 'linear-gradient(135deg, oklch(0.75 0.20 195), oklch(0.55 0.25 285))',
          top: '10%',
          left: '15%',
          animationDelay: '0s',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '800px',
          height: '800px',
          background: 'linear-gradient(225deg, oklch(0.55 0.25 285), oklch(0.70 0.25 350))',
          bottom: '10%',
          right: '10%',
          animationDelay: '-10s',
        }}
      />
      <div 
        className="abstract-shape"
        style={{
          width: '500px',
          height: '500px',
          background: 'linear-gradient(90deg, oklch(0.80 0.22 130), oklch(0.75 0.20 195))',
          top: '50%',
          right: '20%',
          animationDelay: '-5s',
        }}
      />
    </div>
  )
}
