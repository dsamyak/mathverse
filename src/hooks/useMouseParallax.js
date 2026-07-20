import { useState, useEffect, useCallback } from 'react'

export function useMouseParallax(strength = 1) {
  const [mouse, setMouse] = useState({ x: 0, y: 0, normalX: 0, normalY: 0 })

  const handleMouseMove = useCallback((e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2 * strength
    const ny = -(e.clientY / window.innerHeight - 0.5) * 2 * strength
    setMouse({ x: e.clientX, y: e.clientY, normalX: nx, normalY: ny })
  }, [strength])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return mouse
}
