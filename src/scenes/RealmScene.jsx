import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Environment, Grid } from '@react-three/drei'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { useRealm } from '../api/worldApi'
import { useWorldStore } from '../store/worldStore'
import { Avatar, CompanionNPC } from '../r3f/Avatar'
import { DistrictGroup, CapstoneBoss } from '../r3f/DistrictGroup'
import CameraRig from '../r3f/CameraRig'
import HUD from '../ui/HUD'
import SkillNodePanel from '../ui/SkillNodePanel'
import StoryCutscene from '../ui/StoryCutscene'
import Settings from '../ui/Settings'
import { STORY_BEATS } from '../api/mockData'

// ── Biome terrain configs ─────────────────────────────────────────
const BIOME_CONFIGS = {
  beach: {
    groundColor: '#d97706',
    fogColor: '#0c4a6e',
    fogNear: 20,
    fogFar: 60,
    skyColor: '#0ea5e9',
    ambientColor: '#fef3c7',
    ambientInt: 0.6,
  },
  marsh: {
    groundColor: '#166534',
    fogColor: '#052e16',
    fogNear: 18,
    fogFar: 55,
    skyColor: '#15803d',
    ambientColor: '#d1fae5',
    ambientInt: 0.5,
  },
  crystal: {
    groundColor: '#0891b2',
    fogColor: '#082f49',
    fogNear: 22,
    fogFar: 65,
    skyColor: '#22d3ee',
    ambientColor: '#cffafe',
    ambientInt: 0.7,
  },
  mystic: {
    groundColor: '#1e1b4b',
    fogColor: '#0f0a1e',
    fogNear: 15,
    fogFar: 50,
    skyColor: '#4c1d95',
    ambientColor: '#ede9fe',
    ambientInt: 0.3,
  },
}

// ── Realm 3D environment ──────────────────────────────────────────
function RealmEnvironment({ realm, districts, onEnterNode, avatarPosition }) {
  const biome = BIOME_CONFIGS[realm.theme] || BIOME_CONFIGS.crystal

  // Place districts in a circle around center
  const districtPositions = districts.map((d, i) => {
    const angle = (i / districts.length) * Math.PI * 2
    const r = 5
    return {
      ...d,
      position: [Math.cos(angle) * r, 0, Math.sin(angle) * r],
    }
  })

  return (
    <>
      <ambientLight intensity={biome.ambientInt} color={biome.ambientColor} />
      <directionalLight position={[10, 15, 8]} intensity={1.8} castShadow color="#fffbeb" />
      <pointLight position={[0, 6, 0]} intensity={0.8} color={realm.color} distance={20} />
      <fog attach="fog" args={[biome.fogColor, biome.fogNear, biome.fogFar]} />

      <Stars radius={60} depth={40} count={1500} factor={3} saturation={0} fade speed={0.4} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color={biome.groundColor} roughness={0.9} />
      </mesh>
      {/* Rim ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[18, 35, 64]} />
        <meshStandardMaterial color="#0c4a6e" transparent opacity={0.6} />
      </mesh>

      {/* Realm entrance gate */}
      <group position={[0, 0, 9]}>
        {[-1.2, 1.2].map((x, i) => (
          <mesh key={i} castShadow position={[x, 2, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 4.5, 8]} />
            <meshStandardMaterial color={realm.color} emissive={realm.color} emissiveIntensity={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 4.3, 0]}>
          <boxGeometry args={[3.2, 0.25, 0.4]} />
          <meshStandardMaterial color={realm.color} emissive={realm.color} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Districts */}
      {districtPositions.map(d => (
        <DistrictGroup key={d.id} district={d} onEnterNode={onEnterNode} />
      ))}

      {/* Capstone Boss */}
      <CapstoneBoss
        active={districts.every(d => d.masteryPercent === 100)}
        onEnter={onEnterNode}
      />

      {/* Avatar + Companion */}
      <Avatar onPositionChange={avatarPosition.set} />
      <CompanionNPC
        targetPosition={avatarPosition.get()}
        message={null}
      />

      <CameraRig targetPosition={avatarPosition.get()} />
      <Environment preset="night" />
    </>
  )
}

// ── Main Realm Scene ──────────────────────────────────────────────
export default function RealmScene() {
  const { id: realmId } = useParams()
  const navigate = useNavigate()
  const { data: realm, isLoading } = useRealm(realmId)
  const enterSkillNode = useWorldStore(s => s.enterSkillNode)
  const uiMode = useWorldStore(s => s.uiMode)
  const setCameraMode = useWorldStore(s => s.setCameraMode)
  const [showSettings, setShowSettings] = useState(false)
  const [showCutscene, setShowCutscene] = useState(false)
  const [cutsceneData, setCutsceneData] = useState(null)
  const headerRef = useRef()

  // Shared avatar position (not reactive — avoid re-renders every frame)
  const avatarPosRef = useRef([0, 0.8, 0])
  const avatarPosition = {
    get: () => avatarPosRef.current,
    set: (pos) => { avatarPosRef.current = pos },
  }

  useEffect(() => {
    if (!realm) return
    setCameraMode('cinematic')
    gsap.fromTo(headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 1.2 }
    )
    // After cinematic, switch to follow mode
    const t = setTimeout(() => setCameraMode('follow'), 3500)
    return () => clearTimeout(t)
  }, [realm])

  const handleEnterNode = (nodeId) => {
    // Check for story beat
    const storyKey = `${realmId}_intro`
    if (STORY_BEATS[storyKey] && !sessionStorage.getItem(`story_shown_${storyKey}`)) {
      setCutsceneData(STORY_BEATS[storyKey])
      setShowCutscene(true)
      sessionStorage.setItem(`story_shown_${storyKey}`, '1')
      setTimeout(() => { setShowCutscene(false); enterSkillNode(nodeId) }, 5000)
    } else {
      enterSkillNode(nodeId)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-cosmic-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 animate-pulse"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }} />
          <p className="font-outfit text-white/50">Entering realm...</p>
        </div>
      </div>
    )
  }

  if (!realm) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-cosmic-950">
        <div className="text-center">
          <p className="font-outfit text-white/50 mb-4">Realm not found</p>
          <button className="btn-secondary" onClick={() => navigate('/hub')}>← Back to World Map</button>
        </div>
      </div>
    )
  }

  // ── Grades with no content yet — clean "coming soon" view ────────
  if (!realm.districts || realm.districts.length === 0) {
    return (
      <div
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #030510 0%, #0a0a1a 100%)' }}
      >
        {/* Subtle radial bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${realm.color}18 0%, transparent 70%)`,
          }}
        />

        {/* Back button */}
        <button
          className="absolute top-5 left-6 btn-secondary text-sm py-2 z-10"
          onClick={() => navigate('/hub')}
        >
          ← World Map
        </button>

        {/* Grade badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative z-10 text-center"
        >
          <div
            className="w-28 h-28 rounded-3xl mx-auto mb-6 flex items-center justify-center font-black font-outfit text-5xl text-white"
            style={{
              background: `linear-gradient(135deg, ${realm.gradientFrom || realm.color}, ${realm.gradientTo || realm.color})`,
              boxShadow: `0 0 60px ${realm.color}50, 0 0 100px ${realm.color}20`,
            }}
          >
            {realm.grade}
          </div>

          <h1 className="font-outfit font-black text-4xl text-white mb-2">
            Grade {realm.grade}
          </h1>
          <p className="text-white/50 font-outfit text-lg mb-8">{realm.tagline}</p>

          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-outfit font-semibold text-sm"
            style={{
              background: `${realm.color}15`,
              border: `1px solid ${realm.color}40`,
              color: realm.color,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: realm.color }} />
            Content coming soon
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 5, 8], fov: 60 }} gl={{ antialias: true }} shadows>
        <RealmEnvironment
          realm={realm}
          districts={realm.districts || []}
          onEnterNode={handleEnterNode}
          avatarPosition={avatarPosition}
        />
      </Canvas>

      {/* HUD */}
      <HUD />

      {/* Nav header */}
      <div ref={headerRef} className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-5 opacity-0 layer-hud pointer-events-none">
        <div className="pointer-events-auto">
          <button className="btn-secondary text-sm py-2" onClick={() => navigate('/hub')}>
            ← World Map
          </button>
        </div>
        <div className="glass-light px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: realm.color }} />
          <span className="font-outfit font-bold text-white text-sm">Grade {realm.grade}</span>
          <span className="text-white/30 text-sm">·</span>
          <span className="text-white/50 text-sm">{realm.tagline}</span>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button className="btn-secondary text-sm py-2" onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </button>
          <button className="btn-secondary text-sm py-2" onClick={() => setShowSettings(true)}>
            ⚙️
          </button>
        </div>
      </div>

      {/* WASD hint */}
      {uiMode === 'world' && (
        <div className="absolute bottom-6 right-6 glass-light px-4 py-3 rounded-2xl layer-hud">
          <p className="text-xs font-inter text-white/40 text-right mb-1">Move avatar</p>
          <div className="grid grid-cols-3 gap-1 w-20">
            {['', 'W', '', 'A', 'S', 'D'].map((k, i) => (
              <div key={i} className={`h-7 rounded-lg flex items-center justify-center text-xs font-bold font-outfit
                ${k ? 'bg-white/10 text-white/60 border border-white/10' : ''}`}>
                {k}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-2 text-center">Click portals to learn</p>
        </div>
      )}

      {/* Skill Node Panel */}
      {uiMode === 'quiz' && <SkillNodePanel />}

      {/* Story Cutscene */}
      {showCutscene && cutsceneData && <StoryCutscene data={cutsceneData} onDone={() => setShowCutscene(false)} />}

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
