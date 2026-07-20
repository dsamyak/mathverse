import { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const SYMBOLS = ['π', '∑', '∞', '√', '÷', '×', '=', '%', 'θ', 'Δ', '∫', '±', '≈', '²', 'φ', 'λ']
const COLORS = ['#38bdf8', '#22d3ee', '#a855f7', '#c084fc', '#4ade80', '#38bdf8']

function Symbol({ symbol, position, color, speed, phase }) {
  const ref = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.6
      ref.current.rotation.y = t * speed * 0.3
      ref.current.rotation.z = Math.sin(t * speed * 0.5 + phase) * 0.1
    }
  })

  return (
    <Text
      ref={ref}
      position={position}
      fontSize={0.55 + Math.random() * 0.35}
      color={color}
      anchorX="center"
      anchorY="middle"
      material-transparent
      material-opacity={0.7}
      material-blending={THREE.AdditiveBlending}
      material-depthWrite={false}
    >
      {symbol}
    </Text>
  )
}

export function FloatingSymbols({ count = 16 }) {
  const data = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      symbol: SYMBOLS[i % SYMBOLS.length],
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 14 - 2,
      ],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [count])

  return (
    <Suspense fallback={null}>
      {data.map((d, i) => (
        <Symbol key={i} {...d} />
      ))}
    </Suspense>
  )
}
