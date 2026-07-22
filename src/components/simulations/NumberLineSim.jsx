// ── Number Line Simulation ────────────────────────────────────────
// Animated sphere hopping along a number line for skip counting
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useRef, useState, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/three'

const LINE_MAX = 20
const DOT_SPACING = 0.85

function NumberNode({ value, active, step }) {
  const isMultiple = step > 0 && value % step === 0 && value > 0
  const isActive = value === active

  const { scale, glow } = useSpring({
    scale: isActive ? 1.5 : isMultiple ? 1.1 : 0.8,
    glow: isActive ? 1.0 : isMultiple ? 0.35 : 0.05,
    config: { tension: 300, friction: 20 },
  })

  const color = isActive ? '#facc15' : isMultiple ? '#22d3ee' : '#1a2040'

  return (
    <group position={[value * DOT_SPACING, 0, 0]}>
      <animated.mesh scale={scale}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <animated.meshStandardMaterial
          color={color}
          emissive={isActive ? '#facc15' : isMultiple ? '#22d3ee' : '#000510'}
          emissiveIntensity={glow}
          metalness={0.3}
          roughness={0.5}
        />
      </animated.mesh>
      {(isMultiple || value === 0 || value === LINE_MAX) && (
        <Text
          position={[0, -0.45, 0]}
          fontSize={0.28}
          color={isActive ? '#facc15' : isMultiple ? '#22d3ee' : 'rgba(255,255,255,0.3)'}
          anchorX="center"
          anchorY="middle"
        >
          {value}
        </Text>
      )}
    </group>
  )
}

function HoppingBall({ position }) {
  const { x, y } = useSpring({
    x: position * DOT_SPACING,
    y: 0,
    config: { tension: 200, friction: 18 },
  })

  // Bounce animation
  const meshRef = useRef()
  const phase = useRef(0)
  useFrame((_, dt) => {
    if (meshRef.current) {
      phase.current += dt * 4
      meshRef.current.position.y = 0.45 + Math.abs(Math.sin(phase.current)) * 0.3
    }
  })

  return (
    <animated.group position-x={x}>
      <mesh ref={meshRef} position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.8} metalness={0.1} roughness={0.4} />
      </mesh>
    </animated.group>
  )
}

function Scene({ position, step }) {
  const lineLength = LINE_MAX * DOT_SPACING
  const offset = -lineLength / 2

  // Camera tracks the ball
  const camTarget = useRef(0)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={1.0} />
      <pointLight position={[position * DOT_SPACING + offset, 2, 2]} color="#facc15" intensity={1.5} distance={8} />

      <group position={[offset, 0, 0]}>
        {/* The line */}
        <mesh position={[lineLength / 2, 0, 0]}>
          <boxGeometry args={[lineLength, 0.04, 0.04]} />
          <meshStandardMaterial color="#22304a" emissive="#0a1428" emissiveIntensity={0.5} />
        </mesh>

        {/* Nodes */}
        {Array.from({ length: LINE_MAX + 1 }, (_, i) => (
          <NumberNode key={i} value={i} active={position} step={step} />
        ))}

        {/* Hopping ball */}
        <HoppingBall position={position} />
      </group>
    </>
  )
}

export default function NumberLineSim({ node }) {
  // Detect skip amount from node title
  const skip = node?.title?.toLowerCase().includes('5s') ? 5
    : node?.title?.toLowerCase().includes('10s') ? 10
    : node?.title?.toLowerCase().includes('2s') ? 2
    : 2

  const [position, setPosition] = useState(0)
  const [history, setHistory] = useState([0])

  const hop = useCallback(() => {
    setPosition(prev => {
      const next = Math.min(prev + skip, LINE_MAX)
      setHistory(h => [...h, next])
      return next
    })
  }, [skip])

  const reset = () => { setPosition(0); setHistory([0]) }

  // Camera follows ball — use a wider FOV and scroll via group offset
  const camX = Math.max(0, position * DOT_SPACING - 4)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(6,10,30,0.9)', border: '1px solid rgba(250,204,21,0.2)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-outfit font-bold text-gold-400 uppercase tracking-wider">🦘 Skip Count by {skip}s</span>
        <span className="text-xs text-white/40">hop to {position} / {LINE_MAX}</span>
      </div>

      <div style={{ height: 200 }}>
        <Canvas camera={{ position: [camX, 1.5, 5.5], fov: 48 }} dpr={[1, 1.5]}>
          <Scene position={position} step={skip} />
        </Canvas>
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 flex gap-1 flex-wrap">
            {history.map((v, i) => (
              <span key={i} className="px-2 py-0.5 rounded-lg text-xs font-bold font-outfit"
                style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15' }}>
                {v}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={hop}
              disabled={position >= LINE_MAX}
              className="px-4 py-2 rounded-xl font-outfit font-bold text-sm transition-all"
              style={{ background: position >= LINE_MAX ? 'rgba(250,204,21,0.06)' : 'rgba(250,204,21,0.2)', border: '1px solid rgba(250,204,21,0.4)', color: position >= LINE_MAX ? 'rgba(250,204,21,0.3)' : '#facc15', cursor: position >= LINE_MAX ? 'not-allowed' : 'pointer' }}>
              +{skip} Hop!
            </button>
            <button onClick={reset} className="px-3 py-2 rounded-xl font-outfit text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>↺</button>
          </div>
        </div>
      </div>
    </div>
  )
}
