import { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sparkles, Stars, Environment } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useWorldStore } from '../store/worldStore'
import { usePlayerStore } from '../store/playerStore'

// ── Floating archipelago preview in title canvas ──────────────────
function TitleWorld() {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.3
    }
  })

  const islands = [
    { pos: [-3, 0, 0], color: '#4ade80', r: 1.8 },
    { pos: [0, -1, -3], color: '#22d3ee', r: 2.2 },
    { pos: [3, 0.5, 0], color: '#a855f7', r: 1.5 },
    { pos: [0, 1, 3], color: '#34d399', r: 1.6 },
    { pos: [-1.5, -0.5, 2.5], color: '#f59e0b', r: 1.1 },
  ]

  return (
    <group ref={groupRef}>
      {islands.map((isl, i) => (
        <group key={i} position={isl.pos}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[isl.r, isl.r * 1.2, 0.7, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[isl.r * 0.95, isl.r, 0.2, 24]} />
            <meshStandardMaterial color={isl.color} roughness={0.6} />
          </mesh>
          {/* Mini landmark */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <coneGeometry args={[isl.r * 0.3, isl.r * 0.8, 6]} />
            <meshStandardMaterial color={isl.color} emissive={isl.color} emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Connecting bridges */}
      {[
        { from: [-3,0,0], to: [0,0,-3] },
        { from: [0,0,-3], to: [3,0,0] },
      ].map((b, i) => {
        const mid = [
          (b.from[0] + b.to[0]) / 2,
          (b.from[1] + b.to[1]) / 2,
          (b.from[2] + b.to[2]) / 2,
        ]
        const len = Math.sqrt(
          Math.pow(b.to[0]-b.from[0],2) +
          Math.pow(b.to[2]-b.from[2],2)
        )
        const angle = Math.atan2(b.to[0]-b.from[0], b.to[2]-b.from[2])
        return (
          <mesh key={i} position={mid} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.25, 0.1, len]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.4} transparent opacity={0.7} />
          </mesh>
        )
      })}

      <Sparkles count={80} scale={15} size={2} speed={0.3} color="#38bdf8" />
    </group>
  )
}

// ── Math symbol drifting particles (DOM layer) ────────────────────
function MathParticles() {
  const symbols = ['∑','∫','π','√','∞','÷','×','±','≠','≈','²','³','½','⅓','∆','θ']
  const particles = Array.from({ length: 18 }, (_, i) => ({
    symbol: symbols[i % symbols.length],
    left: `${Math.random() * 95}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${8 + Math.random() * 12}s`,
    size: `${14 + Math.random() * 22}px`,
    opacity: 0.3 + Math.random() * 0.4,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <span
          key={i}
          className="math-particle"
          style={{
            left: p.left,
            bottom: '-50px',
            fontSize: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  )
}

// ── Companion greeting overlay ────────────────────────────────────
function CompanionGreeting({ onDone }) {
  const lines = [
    'Welcome back, Explorer! 🌟',
    'Every grade is an island.',
    'Every idea you master builds a bridge to the next.',
    'Your adventure continues...',
  ]
  const [lineIdx, setLineIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (lineIdx < lines.length - 1) {
      const t = setTimeout(() => setLineIdx(i => i + 1), 1800)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 600) }, 1800)
      return () => clearTimeout(t)
    }
  }, [lineIdx])

  return (
    <div className={`absolute inset-0 flex items-center justify-center z-30 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="glass border-glow-ocean p-10 max-w-lg text-center screen-enter">
        {/* Companion avatar */}
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl animate-float"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 40px rgba(14,165,233,0.5)' }}>
          🤖
        </div>
        <p className="text-sm font-outfit font-semibold text-crystal-400 uppercase tracking-widest mb-3">Intellia AI</p>
        <p className="text-2xl font-outfit font-bold text-white leading-relaxed min-h-[4rem] flex items-center justify-center">
          {lines[lineIdx]}
        </p>
        <div className="flex gap-1.5 justify-center mt-6">
          {lines.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === lineIdx ? 'bg-crystal-400 w-5' : 'bg-white/20'}`} />
          ))}
        </div>
        <button className="btn-secondary mt-6 text-sm" onClick={onDone}>
          Skip intro →
        </button>
      </div>
    </div>
  )
}

// ── Main Title Scene ──────────────────────────────────────────────
export default function TitleScene() {
  const navigate = useNavigate()
  const setCameraMode = useWorldStore(s => s.setCameraMode)
  const studentName = usePlayerStore(s => s.studentName)
  const [showGreeting, setShowGreeting] = useState(false)
  const [showEnter, setShowEnter] = useState(false)
  const logoRef = useRef()
  const taglineRef = useRef()
  const btnRef = useRef()

  useEffect(() => {
    setCameraMode('cinematic')

    // Staggered entrance
    const tl = gsap.timeline({ delay: 0.5 })
    tl.fromTo(logoRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
      .fromTo(taglineRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.5')
      .call(() => setShowEnter(true))
  }, [])

  const handleEnter = () => {
    setShowGreeting(true)
  }

  const handleGreetingDone = () => {
    gsap.to('.title-overlay', {
      opacity: 0, duration: 0.8, ease: 'power2.in',
      onComplete: () => navigate('/hub')
    })
  }

  return (
    <div className="relative w-full h-full bg-cosmic-950 overflow-hidden">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 8, 18], fov: 55 }}
          gl={{ antialias: true }}
          shadows
        >
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow color="#bfdbfe" />
          <pointLight position={[-5, 5, -5]} intensity={0.8} color="#a855f7" />
          <fog attach="fog" args={['#040714', 30, 70]} />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
          <TitleWorld />
          <Environment preset="night" />
        </Canvas>
      </div>

      {/* Math particles */}
      <MathParticles />

      {/* Deep gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #040714 80%)' }} />

      {/* UI Overlay */}
      <div className="title-overlay absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Logo & branding */}
        <div className="text-center">
          <div ref={logoRef} className="opacity-0 mb-4">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black font-outfit"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}>
                M
              </div>
              <h1 className="text-7xl font-black font-outfit text-gradient-ocean tracking-tight">
                MathVerse
              </h1>
              <span className="text-2xl text-white/40 font-outfit font-light self-start mt-3">™</span>
            </div>
            {studentName && (
              <p className="text-lg font-inter text-white/60 mb-2">
                Welcome back, <span className="text-crystal-400 font-semibold">{studentName}</span> 👋
              </p>
            )}
          </div>

          <div ref={taglineRef} className="opacity-0">
            <p className="text-2xl font-outfit font-light text-white/70 mb-2 tracking-wider">
              A 3D World of Mathematics Mastery
            </p>
            <div className="flex items-center justify-center gap-3 mb-12 text-sm font-outfit font-semibold tracking-widest uppercase">
              {['Play', 'Learn', 'Evolve'].map((word, i) => (
                <span key={i} className="flex items-center gap-3">
                  <span className="text-crystal-400">{word}</span>
                  {i < 2 && <span className="text-white/20">·</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Enter button */}
          {showEnter && !showGreeting && (
            <div className="screen-enter">
              <button ref={btnRef} className="btn-primary text-xl px-12 py-5" onClick={handleEnter}>
                <span>Enter MathVerse</span>
                <span className="text-2xl">🚀</span>
              </button>
              <p className="text-white/30 text-xs font-inter mt-5 tracking-wide">
                GRADES 1–10 · 3D WORLD · MASTERY-GATED
              </p>
            </div>
          )}
        </div>

        {/* Bottom stats strip */}
        {showEnter && !showGreeting && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 screen-enter">
            {[
              { label: 'Grade Realms', value: '10' },
              { label: 'Concept Districts', value: '30+' },
              { label: 'Skill Nodes', value: '100+' },
            ].map((stat, i) => (
              <div key={i} className="text-center glass-light px-6 py-3 rounded-2xl">
                <div className="text-2xl font-black font-outfit text-gradient-gold">{stat.value}</div>
                <div className="text-xs font-inter text-white/50 mt-0.5 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Companion greeting */}
      {showGreeting && <CompanionGreeting onDone={handleGreetingDone} />}
    </div>
  )
}
