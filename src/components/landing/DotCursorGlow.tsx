'use client'

import { useEffect, useRef } from 'react'

export default function DotCursorGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -999, y: -999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SPACING = 28
    const REPEL_RADIUS = 110   // how far the repulsion reaches
    const REPEL_STRENGTH = 36  // max px a dot gets pushed
    const DOT_R = 1.5

    let animId: number
    let W = 0, H = 0

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      canvas!.width = W
      canvas!.height = H
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      const mx = mouse.current.x
      const my = mouse.current.y

      const cols = Math.ceil(W / SPACING) + 2
      const rows = Math.ceil(H / SPACING) + 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = c * SPACING   // original grid position
          const oy = r * SPACING

          const dx = ox - mx
          const dy = oy - my
          const dist = Math.sqrt(dx * dx + dy * dy)

          // repulsion: push dot away from cursor
          let px = ox
          let py = oy
          if (dist < REPEL_RADIUS && dist > 0) {
            const force = (1 - dist / REPEL_RADIUS) ** 2  // quadratic falloff
            px = ox + (dx / dist) * force * REPEL_STRENGTH
            py = oy + (dy / dist) * force * REPEL_STRENGTH
          }

          // dots near cursor get slightly brighter
          const brightness = dist < REPEL_RADIUS ? 0.3 + (1 - dist / REPEL_RADIUS) * 0.45 : 0.3

          ctx!.beginPath()
          ctx!.arc(px, py, DOT_R, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(0,119,182,${brightness})`
          ctx!.fill()
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    function onLeave() {
      mouse.current = { x: -999, y: -999 }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 40 }}
    />
  )
}
