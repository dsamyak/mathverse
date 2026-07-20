import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Environment, Grid } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import CameraRig from '../r3f/CameraRig'
import { CountingCove, MultiplicationMarsh, FractionIsles, AlgebraAscent, LockedIsland } from '../r3f/islands/Islands'
import { useWorldMap } from '../api/worldApi'
import { useWorldStore } from '../store/worldStore'
import { usePlayerStore } from '../store/playerStore'
import HUD from '../ui/HUD'
import Settings from '../ui/Settings'

// ── Ocean / World base ────────────────────────────────────────────
function WorldOcean() {
  return (
    <>
      {/* Ocean plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[120, 120, 1, 1]} />
        <meshStandardMaterial color="#0c4a6e" roughness={0.1} metalness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Subtle cloud/mist layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#082f49" transparent opacity={0.4} />
      </mesh>
    </>
  )
}

// ── Island tooltip (DOM, appears on hover) ────────────────────────
function IslandTooltip({ realm }) {
  if (!realm) return null
  const statusMap = {
    mastered: { label: '✓ Mastered', cls: 'badge-mastered' },
    in_progress: { label: '◉ In Progress', cls: 'badge-in-progress' },
    available: { label: '◎ Available', cls: 'badge-in-progress' },
    locked: { label: '🔒 Locked', cls: 'badge-locked' },
  }
  const s = realm.masteryPercent === 100 ? 'mastered'
    : realm.masteryPercent > 0 ? 'in_progress'
    : realm.isUnlocked ? 'available' : 'locked'
  const badge = statusMap[s]

  return (
    <div className="glass border-glow-ocean p-4 rounded-2xl pointer-events-none w-56 screen-enter"
      style={{ boxShadow: `0 0 30px ${realm.color}30` }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${realm.gradientFrom || realm.color}, ${realm.gradientTo || realm.color})` }} />
        <div>
          <p className="font-outfit font-bold text-white text-sm leading-tight">{realm.name}</p>
          <p className="text-white/50 text-xs mt-0.5">Grade {realm.grade}</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-white/50">Mastery</span>
          <span className="font-semibold text-white">{realm.masteryPercent}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${realm.masteryPercent}%` }} />
        </div>
        <div className={`${badge.cls} mt-2 text-xs`}>{badge.label}</div>
      </div>
    </div>
  )
}

// ── World Map 3D Scene ────────────────────────────────────────────
function WorldMapScene({ realms, hoveredRealm, setHoveredRealm, onSelectRealm }) {
  const ISLAND_COMPONENTS = {
    realm_grade1: CountingCove,
    realm_grade3: MultiplicationMarsh,
    realm_grade4: FractionIsles,
    realm_grade6: AlgebraAscent,
  }
  const LOCKED_REALMS = ['realm_grade2','realm_grade5','realm_grade7','realm_grade8','realm_grade9','realm_grade10']

  return (
    <>
      <ambientLight intensity={0.4} color="#bfdbfe" />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow color="#e0f2fe" />
      <pointLight position={[-10, 8, -10]} intensity={0.6} color="#a855f7" />
      <pointLight position={[10, 5, 10]} intensity={0.4} color="#22d3ee" />
      <fog attach="fog" args={['#040714', 40, 80]} />

      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.3} />
      <WorldOcean />

      {/* Active realms */}
      {realms.filter(r => !LOCKED_REALMS.includes(r.id)).map(r => {
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

      {/* Locked silhouette realms */}
      {realms.filter(r => LOCKED_REALMS.includes(r.id)).map(r => (
        <LockedIsland key={r.id} position={r.position} grade={r.grade} />
      ))}

      <Environment preset="night" />
      <CameraRig />
    </>
  )
}

// ── Realm Selection Side Panel ────────────────────────────────────
function RealmListPanel({ realms, onSelect }) {
  const activeRealms = realms.filter(r => r.isUnlocked)
  const lockedRealms = realms.filter(r => !r.isUnlocked)

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-72 flex flex-col gap-3 max-h-[80vh] overflow-y-auto layer-hud">
      <p className="text-xs font-outfit font-semibold text-white/40 uppercase tracking-widest mb-1 px-1">
        Your Realms
      </p>
      {activeRealms.map(r => (
        <button
          key={r.id}
          onClick={() => onSelect(r)}
          className="card-realm p-4 text-left w-full"
          style={{ borderColor: `${r.color}30` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${r.gradientFrom || r.color}, ${r.gradientTo || r.color})`, boxShadow: `0 0 15px ${r.color}40` }} />
            <div className="flex-1 min-w-0">
              <p className="font-outfit font-bold text-white text-sm leading-tight truncate">{r.name}</p>
              <p className="text-white/40 text-xs">Grade {r.grade}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${r.masteryPercent}%`, background: `linear-gradient(90deg, ${r.gradientFrom || r.color}, ${r.gradientTo || r.color})` }} />
            </div>
            <p className="text-right text-xs text-white/40 mt-1">{r.masteryPercent}% mastered</p>
          </div>
        </button>
      ))}

      <div className="mt-2 pt-3 border-t border-white/5">
        <p className="text-xs font-outfit font-semibold text-white/25 uppercase tracking-widest mb-2 px-1">
          Coming Soon ({lockedRealms.length})
        </p>
        {lockedRealms.slice(0, 3).map(r => (
          <div key={r.id} className="flex items-center gap-3 px-1 py-2 opacity-40">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/30">🔒</div>
            <div>
              <p className="text-xs text-white/50 font-outfit font-medium">{r.name}</p>
              <p className="text-xs text-white/25">Grade {r.grade}</p>
            </div>
          </div>
        ))}
        {lockedRealms.length > 3 && (
          <p className="text-xs text-white/20 px-1 mt-1">+ {lockedRealms.length - 3} more...</p>
        )}
      </div>
    </div>
  )
}

// ── Main Hub Scene ────────────────────────────────────────────────
export default function HubScene() {
  const navigate = useNavigate()
  const setCameraMode = useWorldStore(s => s.setCameraMode)
  const setCurrentRealm = useWorldStore(s => s.setCurrentRealm)
  const [hoveredRealm, setHoveredRealm] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [showSettings, setShowSettings] = useState(false)
  const headerRef = useRef()

  const { data: realms = [], isLoading } = useWorldMap()

  useEffect(() => {
    setCameraMode('orbit')
    gsap.fromTo(headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.3 }
    )
  }, [])

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleSelectRealm = (realm) => {
    setCurrentRealm(realm.id)
    gsap.to('.hub-ui', { opacity: 0, duration: 0.5, onComplete: () => navigate(`/realm/${realm.id}`) })
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-cosmic-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 animate-pulse"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }} />
          <p className="font-outfit text-white/50">Loading MathVerse...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 22, 18], fov: 50 }}
        gl={{ antialias: true }}
        shadows
        className="layer-3d"
      >
        <WorldMapScene
          realms={realms}
          hoveredRealm={hoveredRealm}
          setHoveredRealm={setHoveredRealm}
          onSelectRealm={handleSelectRealm}
        />
      </Canvas>

      {/* Hub UI */}
      <div className="hub-ui">
        {/* Header */}
        <div ref={headerRef} className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-5 opacity-0 layer-hud">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black font-outfit"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}>M</div>
            <span className="font-outfit font-bold text-white text-xl">MathVerse</span>
            <span className="text-white/30 text-sm font-outfit">· World Map</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-sm py-2" onClick={() => navigate('/dashboard')}>
              📊 Dashboard
            </button>
            <button className="btn-secondary text-sm py-2" onClick={() => setShowSettings(true)}>
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* HUD */}
        <HUD />

        {/* Realm List */}
        <RealmListPanel realms={realms} onSelect={handleSelectRealm} />

        {/* Floating tooltip */}
        {hoveredRealm && (
          <div className="fixed pointer-events-none layer-modal"
            style={{ left: mousePos.x + 16, top: mousePos.y - 60 }}>
            <IslandTooltip realm={hoveredRealm} />
          </div>
        )}

        {/* Bottom hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center layer-hud">
          <p className="text-white/30 text-xs font-inter tracking-wide">
            Click an island to enter · Scroll to zoom · Drag to rotate
          </p>
        </div>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
