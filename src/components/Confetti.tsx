import { useEffect, useRef } from 'react'

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 150
    const colors = ['#4db8ff', '#ff6b9d', '#c561f5', '#feca57', '#48dbfb', '#ff9ff3']

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      gravity: number
      rotation: number
      rotationSpeed: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height - canvas!.height
        this.size = Math.random() * 8 + 4
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * 3 + 2
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.gravity = 0.05
        this.rotation = Math.random() * 360
        this.rotationSpeed = Math.random() * 10 - 5
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.speedY += this.gravity
        this.rotation += this.rotationSpeed
      }

      draw() {
        if (!ctx) return
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate((this.rotation * Math.PI) / 180)
        ctx.fillStyle = this.color
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
        ctx.restore()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        particle.update()
        particle.draw()

        if (particle.y > canvas!.height) {
          particles.splice(index, 1)
        }
      })

      if (particles.length > 0) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
