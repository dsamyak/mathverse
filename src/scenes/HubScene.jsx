import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Environment, Sparkles } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import CameraRig from '../r3f/CameraRig'
import { CountingCove, MultiplicationMarsh, FractionIsles, AlgebraAscent, LockedIsland } from '../r3f/islands/Islands'
import { ParticleGalaxy } from '../components/three/ParticleGalaxy'
import { PostProcessing } from '../components/effects/PostProcessing'
import { useWorldMap } from '../api/worldApi'
import { useWorldStore } from '../store/worldStore'
import { usePlayerStore } from '../store/playerStore'
import { useMouseParallax } from '../hooks/useMouseParallax'
import HUD from '../ui/HUD'
import Settings from '../ui/Settings'

// ── Space void base (replaces ocean) ─────────────────────────────
function SpaceVoid() {
  return (
    <>
      {/* Nebula plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial
          color="#030510"
          roughness={1}
          metalness={0}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Ambient glow below islands */}
      <pointLight position={[0, -3, 0]} color="#0ea5e9" intensity={0.3} distance={30} decay={2} />
    </>
  )
}

// ── Connection beam between two positions ─────────────────────────
function ConnectionBeam({ from, to, color = '#38bdf8' }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) ref.current.material.opacity = 0.15 + Math.sin(state.clock.getElapsedTime() * 2) * 0.08
  })
  const mid = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 0.5,
    (from[2] + to[2]) / 2,
  ]
  const len = Math.sqrt(
    Math.pow(to[0] - from[0], 2) +
    Math.pow(to[2] - from[2], 2)
  )
  const angle = Math.atan2(to[0] - from[0], to[2] - from[2])

  return (
    <mesh ref={ref} position={mid} rotation={[0, angle, 0]}>
      <boxGeometry args={[0.04, 0.04, len]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  )
}

// ── Full 3D world map scene ───────────────────────────────────────
function WorldMapScene({ realms, hoveredRealm, setHoveredRealm, onSelectRealm }) {
  const ISLAND_COMPONENTS = {
    realm_grade1: CountingCove,
    realm_grade3: MultiplicationMarsh,
    realm_grade4: FractionIsles,
    realm_grade6: AlgebraAscent,
  }
  const LOCKED_REALMS = ['realm_grade2','realm_grade5','realm_grade7','realm_grade8','realm_grade9','realm_grade10']
  const activeRealms = realms.filter(r => !LOCKED_REALMS.includes(r.id))

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} color="#1e1b4b" />
      <directionalLight position={[10, 20, 10]} intensity={1}   castShadow color="#e0f2fe" />
      <pointLight position={[-10, 8, -10]} intensity={0.8}  color="#a855f7" distance={40} decay={2} />
      <pointLight position={[10,  5,  10]} intensity={0.5}  color="#22d3ee" distance={30} decay={2} />
      <pointLight position={[0,  15,   0]} intensity={0.3}  color="#38bdf8" distance={50} decay={2} />

      <fog attach="fog" args={['#030510', 35, 85]} />

      {/* Deep space */}
      <Stars radius={100} depth={60} count={3000} factor={4} saturation={0.1} fade speed={0.3} />
      <ParticleGalaxy count={1200} radius={50} />

      {/* Ground void */}
      <SpaceVoid />

      {/* Realm islands */}
      {activeRealms.map(r => {
        const IslandComp = ISLAND_COMPONENTS[r.id] || CountingCove
        return (
          <IslandComp
            key={r.id}
            position={r.position}
            onClick={() => r.isUnlocked && onSelectRealm(r)}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredRealm(r) }}
            onPointerOut={() => setHoveredRealm(null)}
          />
        )
      })}

      {/* Connection beams */}
      {activeRealms.length >= 2 && activeRealms.slice(0, -1).map((r, i) => (
        <ConnectionBeam
          key={i}
          from={activeRealms[i].position}
          to={activeRealms[i + 1].position}
          color={activeRealms[i].color || '#38bdf8'}
        />
      ))}

      {/* Locked silhouettes */}
      {realms.filter(r => LOCKED_REALMS.includes(r.id)).map(r => (
        <LockedIsland key={r.id} position={r.position} grade={r.grade} />
      ))}

      <Environment preset="night" />
      <PostProcessing bloomIntensity={1.1} />
      <CameraRig />
    </>
  )
}

// ── Realm list panel (left sidebar) ──────────────────────────────
function RealmCard({ realm, onClick, index }) {
  const statusColor = realm.masteryPercent === 100 ? '#4ade80'
    : realm.masteryPercent > 0 ? '#38bdf8' : '#94a3b8'

  return (
    <motion.button
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 25 }}
      onClick={onClick}
      className="w-full text-left group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="glass rounded-2xl p-4 border transition-all duration-300"
        style={{
          borderColor: realm.color ? `${realm.color}20` : 'rgba(56,189,248,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${realm.gradientFrom || realm.color || '#38bdf8'}, ${realm.gradientTo || realm.color || '#a855f7'})`,
              boxShadow: `0 0 16px ${realm.color || '#38bdf8'}50`,
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-outfit font-bold text-white text-sm truncate leading-tight">
              {realm.name}
            </p>
            <p className="text-white/35 text-xs mt-0.5">Grade {realm.grade}</p>
          </div>
          <span
            className="text-xs font-outfit font-bold"
            style={{ color: statusColor }}
          >
            {realm.masteryPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${realm.masteryPercent}%` }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              background: `linear-gradient(90deg, ${realm.gradientFrom || realm.color || '#38bdf8'}, ${realm.gradientTo || realm.color || '#a855f7'})`,
              boxShadow: `0 0 8px ${realm.color || '#38bdf8'}80`,
            }}
          />
        </div>
      </div>
    </motion.button>
  )
}

function RealmListPanel({ realms, onSelect }) {
  const activeRealms = realms.filter(r => r.isUnlocked)
  const lockedRealms = realms.filter(r => !r.isUnlocked)

  return (
    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-64 flex flex-col gap-2.5 max-h-[78vh] overflow-y-auto layer-hud pr-1">
      <p className="text-xs font-outfit font-bold text-white/30 uppercase tracking-[0.18em] mb-0.5 px-1">
        Your Realms
      </p>

      {activeRealms.map((r, i) => (
        <RealmCard key={r.id} realm={r} onClick={() => onSelect(r)} index={i} />
      ))}

      {lockedRealms.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-1 pt-3 border-t border-white/5"
        >
          <p className="text-xs font-outfit font-semibold text-white/20 uppercase tracking-widest mb-2 px-1">
            Coming Soon ({lockedRealms.length})
          </p>
          {lockedRealms.slice(0, 3).map((r, i) => (
            <div key={r.id} className="flex items-center gap-3 px-1 py-2 opacity-35">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-xs">🔒</div>
              <div>
                <p className="text-xs text-white/45 font-outfit font-medium">{r.name}</p>
                <p className="text-xs text-white/20">Grade {r.grade}</p>
              </div>
            </div>
          ))}
          {lockedRealms.length > 3 && (
            <p className="text-xs text-white/15 px-1 mt-1">+{lockedRealms.length - 3} more</p>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ── Island hover tooltip ──────────────────────────────────────────
function IslandTooltip({ realm }) {
  if (!realm) return null
  const pct = realm.masteryPercent
  const status = pct === 100 ? { label: '✓ Mastered', color: '#4ade80' }
    : pct > 0 ? { label: '◉ In Progress', color: '#38bdf8' }
    : realm.isUnlocked ? { label: '◎ Available', color: '#38bdf8' }
    : { label: '🔒 Locked', color: '#94a3b8' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="glass border-glow-ocean p-4 rounded-2xl pointer-events-none w-52"
      style={{ boxShadow: `0 0 30px ${realm.color || '#38bdf8'}30` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${realm.gradientFrom || realm.color || '#38bdf8'}, ${realm.gradientTo || realm.color || '#a855f7'})`,
          }}
        />
        <div>
          <p className="font-outfit font-bold text-white text-sm">{realm.name}</p>
          <p className="text-white/40 text-xs">Grade {realm.grade}</p>
        </div>
      </div>
      <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${realm.gradientFrom || realm.color || '#38bdf8'}, ${realm.gradientTo || '#a855f7'})`,
          }}
        />
      </div>
      <span className="text-xs font-outfit font-semibold" style={{ color: status.color }}>
        {status.label}
      </span>
    </motion.div>
  )
}

// ── Main Hub Scene ────────────────────────────────────────────────
export default function HubScene() {
  const navigate         = useNavigate()
  const setCameraMode    = useWorldStore(s => s.setCameraMode)
  const setCurrentRealm  = useWorldStore(s => s.setCurrentRealm)
  const [hoveredRealm, setHoveredRealm] = useState(null)
  const [mousePos, setMousePos]         = useState({ x: 0, y: 0 })
  const [showSettings, setShowSettings] = useState(false)
  const headerRef = useRef()

  const { data: realms = [], isLoading } = useWorldMap()

  useEffect(() => {
    setCameraMode('orbit')
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 }
      )
    }
  }, [])

  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY })

  const handleSelectRealm = (realm) => {
    setCurrentRealm(realm.id)
    gsap.to('.hub-ui', { opacity: 0, duration: 0.45, onComplete: () => navigate(`/realm/${realm.id}`) })
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: '#030510' }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } }}
          />
          <p className="font-outfit text-white/40 tracking-widest text-sm uppercase">
            Loading MathVerse...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full" style={{ background: '#030510' }} onMouseMove={handleMouseMove}>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 22, 18], fov: 50 }}
        gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 0.9 }}
        shadows
        dpr={[1, 1.5]}
        className="layer-3d"
      >
        <Suspense fallback={null}>
          <WorldMapScene
            realms={realms}
            hoveredRealm={hoveredRealm}
            setHoveredRealm={setHoveredRealm}
            onSelectRealm={handleSelectRealm}
          />
        </Suspense>
      </Canvas>

      {/* Hub UI */}
      <div className="hub-ui">

        {/* Header */}
        <motion.div
          ref={headerRef}
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-5 layer-hud"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black font-outfit"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}
            >
              M
            </div>
            <span className="font-outfit font-bold text-white text-lg">MathVerse</span>
            <span
              className="text-xs font-outfit text-white/30 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              World Map
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <motion.button
              className="btn-secondary text-sm py-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
            >
              📊 Dashboard
            </motion.button>
            <motion.button
              className="btn-secondary text-sm py-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSettings(true)}
            >
              ⚙️ Settings
            </motion.button>
          </div>
        </motion.div>

        {/* HUD */}
        <HUD />

        {/* Realm panel */}
        <RealmListPanel realms={realms} onSelect={handleSelectRealm} />

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredRealm && (
            <div
              className="fixed pointer-events-none layer-modal"
              style={{ left: mousePos.x + 18, top: mousePos.y - 70 }}
            >
              <IslandTooltip realm={hoveredRealm} />
            </div>
          )}
        </AnimatePresence>

        {/* Bottom hint */}
        <motion.div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 layer-hud"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-white/20 text-xs font-inter tracking-widest uppercase">
            Click a realm to enter · Scroll to zoom · Drag to rotate
          </p>
        </motion.div>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
