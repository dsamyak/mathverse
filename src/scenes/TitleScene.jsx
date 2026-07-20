import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Environment } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import { MathCore } from '../components/three/MathCore'
import { ParticleGalaxy } from '../components/three/ParticleGalaxy'
import { FloatingSymbols } from '../components/three/FloatingSymbols'
import { GeometricSolids } from '../components/three/GeometricSolids'
import { CoordinateGrid } from '../components/three/CoordinateGrid'
import { PostProcessing } from '../components/effects/PostProcessing'
import { MagneticButton } from '../components/ui/MagneticButton'
import { useMouseParallax } from '../hooks/useMouseParallax'
import { useWorldStore } from '../store/worldStore'
import { usePlayerStore } from '../store/playerStore'

// ── Cinematic camera that responds to mouse ───────────────────────
function SceneCamera({ mouseNX, mouseNY }) {
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    state.camera.position.x += (mouseNX * 1.5 - state.camera.position.x) * 0.03
    state.camera.position.y += (-mouseNY * 0.8 + 1.5 + Math.sin(t * 0.3) * 0.15 - state.camera.position.y) * 0.03
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

// ── The full 3D universe scene ────────────────────────────────────
function Universe({ mouseNX, mouseNY }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#1a1a3e" />
      <directionalLight position={[5, 8, 5]}   intensity={0.6} color="#bfdbfe" />
      <directionalLight position={[-8, 5, -5]} intensity={0.4} color="#e9d5ff" />
      <pointLight position={[0, 0, 4]} intensity={1.5} color="#38bdf8" distance={20} decay={2} />

      {/* Deep space fog */}
      <fog attach="fog" args={['#030510', 20, 60]} />

      {/* Background stars */}
      <Stars radius={80} depth={60} count={4000} factor={4} saturation={0.2} fade speed={0.5} />

      {/* Particle galaxy */}
      <ParticleGalaxy count={2500} radius={24} />

      {/* Main centerpiece — offset right so UI text fits left */}
      <group position={[2.5, 0, 0]}>
        <MathCore mouseNX={mouseNX} mouseNY={mouseNY} />
      </group>

      {/* Floating geometric solids */}
      <GeometricSolids />

      {/* Floating math symbols */}
      <FloatingSymbols count={16} />

      {/* Interactive coordinate grid */}
      <CoordinateGrid mouseNX={mouseNX} mouseNY={mouseNY} />

      {/* Environment reflections */}
      <Environment preset="night" />

      {/* Post-processing: bloom + vignette */}
      <PostProcessing bloomIntensity={1.4} />

      {/* Camera controller */}
      <SceneCamera mouseNX={mouseNX} mouseNY={mouseNY} />
    </>
  )
}

// ── Companion intro dialog ────────────────────────────────────────
const LINES = [
  'Welcome to MathVerse. ✦',
  'Every grade is a planet.',
  'Every concept, a star to discover.',
  'Your universe awaits...',
]

function CompanionGreeting({ onDone }) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (idx < LINES.length - 1) {
      const t = setTimeout(() => setIdx(i => i + 1), 1900)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(onDone, 500)
      }, 1900)
      return () => clearTimeout(t)
    }
  }, [idx])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="glass border-glow-ocean p-10 max-w-md text-center"
            initial={{ y: 30, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl animate-float"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 40px rgba(14,165,233,0.5)' }}
            >
              🤖
            </div>
            <p className="text-xs font-outfit font-bold text-crystal-400 uppercase tracking-[0.2em] mb-3">
              Intellia AI
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                className="text-2xl font-outfit font-bold text-white leading-relaxed min-h-[3.5rem]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {LINES[idx]}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-1.5 justify-center mt-5">
              {LINES.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 rounded-full"
                  animate={{ width: i === idx ? 20 : 8, opacity: i === idx ? 1 : 0.25 }}
                  style={{ background: '#22d3ee' }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
            <button className="btn-secondary mt-6 text-sm" onClick={onDone}>
              Skip intro →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Stats strip ───────────────────────────────────────────────────
const STATS = [
  { value: '10',   label: 'Grade Realms' },
  { value: '30+',  label: 'Districts' },
  { value: '100+', label: 'Skill Nodes' },
]

// ── Main Title Scene ──────────────────────────────────────────────
export default function TitleScene() {
  const navigate        = useNavigate()
  const setCameraMode   = useWorldStore(s => s.setCameraMode)
  const studentName     = usePlayerStore(s => s.studentName)
  const mouse           = useMouseParallax(1)

  const [showGreeting, setShowGreeting]   = useState(false)
  const [uiReady, setUiReady]             = useState(false)
  const overlayRef                        = useRef()

  useEffect(() => {
    setCameraMode('cinematic')
    const t = setTimeout(() => setUiReady(true), 400)
    return () => clearTimeout(t)
  }, [])

  const handleEnter = () => setShowGreeting(true)

  const handleGreetingDone = () => {
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.7, ease: 'power2.in',
      onComplete: () => navigate('/hub'),
    })
  }

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } },
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#030510' }}>

      {/* ── Full-screen 3D Universe ── */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 1.5, 14], fov: 55 }}
          gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1 }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <Universe mouseNX={mouse.normalX} mouseNY={mouse.normalY} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── Radial vignette (left side darker for text readability) ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 100% at 20% 50%, rgba(3,5,16,0.65) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(3,5,16,0.5) 0%, transparent 30%, transparent 70%, rgba(3,5,16,0.6) 100%)',
        }}
      />

      {/* ── UI Overlay ── */}
      <div ref={overlayRef} className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-8 lg:px-16 flex items-center">

          {/* Left content — takes up ~50% on large screens */}
          <div className="w-full max-w-xl">
            <AnimatePresence>
              {uiReady && !showGreeting && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                  {/* Badge */}
                  <motion.div variants={itemVariants} className="mb-6">
                    <span
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-outfit font-bold uppercase tracking-widest border"
                      style={{
                        background: 'rgba(56,189,248,0.08)',
                        borderColor: 'rgba(56,189,248,0.25)',
                        color: '#38bdf8',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      3D Mathematics Universe
                    </span>
                  </motion.div>

                  {/* Logo wordmark */}
                  <motion.div variants={itemVariants} className="mb-2">
                    <div className="flex items-end gap-3 mb-2">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black font-outfit flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
                          boxShadow: '0 0 40px rgba(168,85,247,0.45)',
                        }}
                      >
                        M
                      </div>
                      <h1
                        className="text-6xl lg:text-7xl font-black font-outfit leading-none"
                        style={{
                          background: 'linear-gradient(135deg, #38bdf8 0%, #22d3ee 40%, #a855f7 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.4))',
                        }}
                      >
                        MathVerse
                      </h1>
                    </div>
                    {studentName && (
                      <p className="text-sm font-inter text-white/50 mt-1 ml-1">
                        Welcome back,{' '}
                        <span className="text-crystal-400 font-semibold">{studentName}</span> 👋
                      </p>
                    )}
                  </motion.div>

                  {/* Tagline */}
                  <motion.p
                    variants={itemVariants}
                    className="text-lg lg:text-xl font-outfit font-light text-white/60 mb-3 leading-relaxed"
                  >
                    Where mathematics becomes an
                    <span className="text-crystal-400 font-semibold"> immersive universe</span>.
                    <br />
                    Explore concepts as living, breathing 3D worlds.
                  </motion.p>

                  {/* Keyword pills */}
                  <motion.div variants={itemVariants} className="flex items-center gap-3 mb-10">
                    {['Play', 'Explore', 'Master'].map((word, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-outfit font-semibold"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.55)',
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </motion.div>

                  {/* CTA button */}
                  <motion.div variants={itemVariants}>
                    <MagneticButton
                      className="btn-primary text-lg px-10 py-5 mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
                        boxShadow: '0 0 50px rgba(14,165,233,0.4), 0 0 80px rgba(168,85,247,0.2)',
                      }}
                      onClick={handleEnter}
                    >
                      <span>Enter MathVerse</span>
                      <span className="text-xl">🚀</span>
                    </MagneticButton>
                    <p className="text-xs font-inter text-white/25 tracking-widest uppercase">
                      Grades 1–10 · Mastery-Gated · 100+ Skills
                    </p>
                  </motion.div>

                  {/* Stats */}
                  <motion.div variants={itemVariants} className="flex gap-5 mt-10">
                    {STATS.map((s, i) => (
                      <div key={i} className="glass-light px-5 py-3 rounded-2xl text-center">
                        <div
                          className="text-2xl font-black font-outfit"
                          style={{
                            background: 'linear-gradient(135deg, #fde047, #fb923c)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          {s.value}
                        </div>
                        <div className="text-xs font-inter text-white/40 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Companion Greeting overlay ── */}
      {showGreeting && <CompanionGreeting onDone={handleGreetingDone} />}

      {/* ── Corner scroll hint ── */}
      <AnimatePresence>
        {uiReady && !showGreeting && (
          <motion.div
            className="absolute bottom-7 right-8 z-20 flex flex-col items-end gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <p className="text-xs text-white/20 font-inter tracking-widest uppercase">
              Move cursor to explore
            </p>
            <div className="w-px h-6 bg-gradient-to-b from-transparent to-white/20 ml-auto" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
