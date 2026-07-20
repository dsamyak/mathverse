import { useRef, useCallback, useState } from 'react'

// MagneticButton — pure CSS/React version, no framer-motion needed.
// Uses CSS transitions + mouse position for the magnetic pull effect.
export function MagneticButton({ children, className = '', onClick, strength = 0.35, ...props }) {
  const ref = useRef(null)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const frameRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      setTranslate({
        x: (e.clientX - cx) * strength,
        y: (e.clientY - cy) * strength,
      })
    })
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    setTranslate({ x: 0, y: 0 })
    setScale(1)
  }, [])

  return (
    <button
      ref={ref}
      className={className}
      style={{
        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setScale(1.05)}
      onMouseDown={() => setScale(0.97)}
      onMouseUp={() => setScale(1.05)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
