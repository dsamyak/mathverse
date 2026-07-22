// ── Fraction Pizza Simulation ─────────────────────────────────────
// Interactive 3D pizza showing numerator/denominator concept
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

const COLORS = {
  selected: '#22d3ee',
  unselected: '#1e2a4a',
  crust: '#d4843a',
  glow: '#22d3ee',
}

function PieSlice({ index, total, selected, onClick }) {
  const thetaLength = (Math.PI * 2) / total
  const thetaStart = index * thetaLength - Math.PI / 2

  const { lift, bright } = useSpring({
    lift: selected ? 0.18 : 0,
    bright: selected ? 0.6 : 0.04,
    config: { tension: 220, friction: 22 },
  })

  return (
    <animated.mesh
      position-y={lift}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <cylinderGeometry
        args={[1.38, 1.38, 0.28, 48, 1, false, thetaStart, thetaLength - 0.04]}
      />
      <animated.meshStandardMaterial
        color={selected ? COLORS.selected : COLORS.unselected}
        emissive={selected ? COLORS.glow : '#000820'}
        emissiveIntensity={bright}
        metalness={0.3}
        roughness={0.55}
        transparent
        opacity={selected ? 0.95 : 0.65}
      />
    </animated.mesh>
  )
}

function CrustRing() {
  return (
    <mesh position={[0, 0, 0]}>
      <torusGeometry args={[1.42, 0.07, 12, 80]} />
      <meshStandardMaterial color={COLORS.crust} emissive={COLORS.crust} emissiveIntensity={0.12} roughness={0.6} />
    </mesh>
  )
}

function CenterDot() {
  return (
    <mesh position={[0, 0.16, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 0.06, 16]} />
      <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
    </mesh>
  )
}

function Scene({ slices, selected, onToggle }) {
  const groupRef = useRef()
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.15
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#a0c4ff" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#22d3ee" distance={8} />

      <group ref={groupRef} rotation={[-0.45, 0, 0]}>
        {Array.from({ length: slices }, (_, i) => (
          <PieSlice
            key={i}
            index={i}
            total={slices}
            selected={selected.has(i)}
            onClick={() => onToggle(i)}
          />
        ))}
        <CrustRing />
        <CenterDot />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        enableRotate={false}
      />
    </>
  )
}

export default function FractionPizzaSim({ node }) {
  // Derive denominator from node questions if possible
  const denominator = useMemo(() => {
    if (!node?.questions?.length) return 4
    // Look for fraction notation like "1/4", "3/8" etc.
    for (const q of node.questions) {
      const match = q.answer?.toString().match(/\d+\/(\d+)/)
      if (match) return parseInt(match[1])
    }
    return 6
  }, [node])

  const [selected, setSelected] = useState(() => new Set([0]))

  const toggle = (i) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const num = selected.size
  const label = `${num}/${denominator}`

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ background: 'rgba(6,10,30,0.9)', border: '1px solid rgba(34,211,238,0.2)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-outfit font-bold text-crystal-400 uppercase tracking-wider">🍕 Interactive Fraction</span>
        <span className="text-xs text-white/40 font-inter">click slices to select</span>
      </div>

      <div style={{ height: 220 }}>
        <Canvas camera={{ position: [0, 2.5, 3.2], fov: 45 }} dpr={[1, 1.5]}>
          <Scene slices={denominator} selected={selected} onToggle={toggle} />
        </Canvas>
      </div>

      <div className="flex items-center justify-center gap-6 px-4 py-3 border-t border-white/5">
        <div className="text-center">
          <div className="text-3xl font-black font-outfit" style={{ color: '#22d3ee', textShadow: '0 0 20px rgba(34,211,238,0.5)' }}>
            {label}
          </div>
          <div className="text-xs text-white/40 mt-0.5">fraction selected</div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-center">
          <div className="text-lg font-bold font-outfit text-white/70">{num} <span className="text-white/30">out of</span> {denominator}</div>
          <div className="text-xs text-white/40 mt-0.5">equal parts</div>
        </div>
        <button
          onClick={() => setSelected(new Set())}
          className="ml-auto text-xs px-3 py-1.5 rounded-xl font-outfit font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
