// ── Counting Blocks Simulation ────────────────────────────────────
// Interactive 3D blocks for counting — click to count sequentially
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useRef, useState, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/three'

const BLOCK_COLORS = ['#22d3ee', '#34d399', '#a855f7', '#f59e0b', '#f472b6', '#60a5fa', '#4ade80', '#fb923c', '#818cf8', '#e879f9']

function Block({ index, counted, color, total }) {
  const isActive = index < counted
  const isNext = index === counted

  const { scale, lift, glow } = useSpring({
    scale: isActive ? 1 : isNext ? 0.92 : 0.85,
    lift: isActive ? 0.1 : 0,
    glow: isActive ? 0.7 : isNext ? 0.15 : 0.02,
    config: { tension: 300, friction: 20 },
  })

  // Position blocks in a curved arc
  const cols = Math.min(total, 5)
  const row = Math.floor(index / cols)
  const col = index % cols
  const xOff = (cols - 1) * 0.55
  const x = col * 1.1 - xOff
  const z = row * -1.0

  return (
    <animated.group position={[x, lift, z]} scale={scale}>
      <RoundedBox args={[0.85, 0.85, 0.85]} radius={0.12} smoothness={4}>
        <animated.meshStandardMaterial
          color={isActive ? color : '#1a1a3a'}
          emissive={isActive ? color : '#000510'}
          emissiveIntensity={glow}
          metalness={0.4}
          roughness={0.45}
          transparent
          opacity={isActive ? 1 : isNext ? 0.7 : 0.35}
        />
      </RoundedBox>
      {isActive && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.28}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/outfit.woff"
        >
          {index + 1}
        </Text>
      )}
    </animated.group>
  )
}

function Scene({ count, total }) {
  const cols = Math.min(total, 5)
  const rows = Math.ceil(total / cols)
  const groupZ = rows > 1 ? (rows - 1) * 0.5 : 0

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 5]} intensity={1.1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#a0e4ff" />
      <pointLight position={[0, 4, 2]} color="#22d3ee" intensity={1.5} distance={10} />

      <group position={[0, 0, groupZ * 0.5]}>
        {Array.from({ length: total }, (_, i) => (
          <Block
            key={i}
            index={i}
            counted={count}
            color={BLOCK_COLORS[i % BLOCK_COLORS.length]}
            total={total}
          />
        ))}
      </group>
    </>
  )
}

export default function CountingBlocksSim({ node }) {
  const total = 10
  const [count, setCount] = useState(0)
  const [autoRunning, setAutoRunning] = useState(false)
  const timerRef = useRef(null)

  const startCount = useCallback(() => {
    if (autoRunning) return
    setCount(0)
    setAutoRunning(true)
    let c = 0
    timerRef.current = setInterval(() => {
      c++
      setCount(c)
      if (c >= total) {
        clearInterval(timerRef.current)
        setAutoRunning(false)
      }
    }, 380)
  }, [autoRunning, total])

  const reset = () => {
    clearInterval(timerRef.current)
    setCount(0)
    setAutoRunning(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(6,10,30,0.9)', border: '1px solid rgba(34,211,238,0.2)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-outfit font-bold text-crystal-400 uppercase tracking-wider">🟦 Count the Blocks</span>
        <span className="text-xs text-white/40 font-inter">watch them light up!</span>
      </div>

      <div style={{ height: 210 }}>
        <Canvas camera={{ position: [0, 3.5, 5], fov: 42 }} dpr={[1, 1.5]}>
          <Scene count={count} total={total} />
        </Canvas>
      </div>

      <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
        <div className="text-center min-w-[70px]">
          <div className="text-3xl font-black font-outfit" style={{ color: '#22d3ee', textShadow: '0 0 20px rgba(34,211,238,0.5)' }}>
            {count}
          </div>
          <div className="text-xs text-white/40">counted</div>
        </div>

        <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(count / total) * 100}%`, background: 'linear-gradient(90deg, #22d3ee, #a855f7)' }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={startCount}
            disabled={autoRunning}
            className="px-4 py-2 rounded-xl font-outfit font-bold text-sm transition-all"
            style={{
              background: autoRunning ? 'rgba(34,211,238,0.08)' : 'rgba(34,211,238,0.2)',
              border: '1px solid rgba(34,211,238,0.4)',
              color: autoRunning ? 'rgba(34,211,238,0.4)' : '#22d3ee',
              cursor: autoRunning ? 'not-allowed' : 'pointer',
            }}
          >
            {autoRunning ? 'Counting…' : count === total ? 'Count Again' : 'Start Count!'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-2 rounded-xl font-outfit text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  )
}
