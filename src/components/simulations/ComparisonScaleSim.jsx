// ── Comparison Scale Simulation ───────────────────────────────────
// 3D balance scale that tilts based on which number is larger
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useRef, useState } from 'react'
import { useSpring, animated } from '@react-spring/three'

const PRESETS = [
  { a: 7, b: 4 },
  { a: 3, b: 9 },
  { a: 6, b: 6 },
  { a: 12, b: 5 },
  { a: 8, b: 11 },
]

function ScaleArm({ tilt }) {
  const { rotation } = useSpring({
    rotation: tilt,
    config: { tension: 120, friction: 28 },
  })

  return (
    <animated.group rotation-z={rotation}>
      {/* Main beam */}
      <mesh>
        <boxGeometry args={[4.2, 0.1, 0.18]} />
        <meshStandardMaterial color="#2a3a60" emissive="#0a1428" emissiveIntensity={0.3} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Left plate */}
      <group position={[-2.0, -0.06, 0]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.08, 32]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} metalness={0.5} roughness={0.4} transparent opacity={0.85} />
        </mesh>
        {/* Hanging line */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.7, 0.03]} />
          <meshStandardMaterial color="#22304a" />
        </mesh>
      </group>

      {/* Right plate */}
      <group position={[2.0, -0.06, 0]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.08, 32]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.2} metalness={0.5} roughness={0.4} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.03, 0.7, 0.03]} />
          <meshStandardMaterial color="#22304a" />
        </mesh>
      </group>
    </animated.group>
  )
}

function NumberBlock({ value, side, tilt }) {
  const x = side === 'left' ? -2.0 : 2.0
  const color = side === 'left' ? '#22d3ee' : '#a855f7'

  // Block sinks with tilt
  const sinkDir = side === 'left' ? -1 : 1
  const { y } = useSpring({
    y: -0.6 + tilt * sinkDir * 0.6,
    config: { tension: 120, friction: 28 },
  })

  return (
    <animated.group position-x={x} position-y={y}>
      <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.1}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.3} roughness={0.5} />
      </RoundedBox>
      <Text position={[0, 0, 0.4]} fontSize={0.36} color="#fff" anchorX="center" anchorY="middle" fontWeight="bold">
        {value}
      </Text>
    </animated.group>
  )
}

function Pedestal() {
  return (
    <group position={[0, -0.8, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 12]} />
        <meshStandardMaterial color="#1a2844" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 0.2, 20]} />
        <meshStandardMaterial color="#1e3060" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Scene({ a, b }) {
  const diff = (a - b) / Math.max(a, b, 1)
  const tilt = Math.max(-0.35, Math.min(0.35, diff * 0.8))

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 5]} intensity={1.0} />
      <pointLight position={[-2.5, 0.5, 2]} color="#22d3ee" intensity={1.2} distance={8} />
      <pointLight position={[2.5, 0.5, 2]} color="#a855f7" intensity={1.2} distance={8} />

      <group position={[0, 0.2, 0]}>
        <ScaleArm tilt={-tilt} />
        <NumberBlock value={a} side="left" tilt={tilt} />
        <NumberBlock value={b} side="right" tilt={tilt} />
        <Pedestal />
      </group>
    </>
  )
}

export default function ComparisonScaleSim({ node }) {
  const [presetIdx, setPresetIdx] = useState(0)
  const [values, setValues] = useState(PRESETS[0])

  const setPreset = (idx) => {
    setPresetIdx(idx)
    setValues(PRESETS[idx])
  }

  const symbol = values.a > values.b ? '>' : values.a < values.b ? '<' : '='
  const symbolColor = values.a === values.b ? '#facc15' : '#22d3ee'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(6,10,30,0.9)', border: '1px solid rgba(34,211,238,0.2)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-outfit font-bold text-crystal-400 uppercase tracking-wider">⚖️ Comparison Scale</span>
        <span className="text-xs text-white/40">heavier side sinks</span>
      </div>

      <div style={{ height: 210 }}>
        <Canvas camera={{ position: [0, 0.5, 6], fov: 44 }} dpr={[1, 1.5]}>
          <Scene a={values.a} b={values.b} />
        </Canvas>
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="text-3xl font-black font-outfit text-crystal-400">{values.a}</span>
          <span className="text-4xl font-black font-outfit" style={{ color: symbolColor, textShadow: `0 0 20px ${symbolColor}60` }}>{symbol}</span>
          <span className="text-3xl font-black font-outfit text-mystic-400">{values.b}</span>
        </div>
        <div className="flex justify-center gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPreset(i)}
              className="px-3 py-1 rounded-lg text-xs font-outfit font-semibold transition-all"
              style={{
                background: presetIdx === i ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${presetIdx === i ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: presetIdx === i ? '#22d3ee' : 'rgba(255,255,255,0.4)',
              }}
            >
              {p.a} vs {p.b}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
