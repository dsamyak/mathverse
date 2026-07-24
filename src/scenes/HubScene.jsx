import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Environment, useGLTF } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import CameraRig from '../r3f/CameraRig'
import { PostProcessing } from '../components/effects/PostProcessing'
import { ParticleGalaxy } from '../components/three/ParticleGalaxy'
import { useWorldMap } from '../api/worldApi'
import { useWorldStore } from '../store/worldStore'
import HUD from '../ui/HUD'
import Settings from '../ui/Settings'

// Pre-load GLB
useGLTF.preload('/cartoon_world_map.glb')

// ── Grade colours (one per grade) ────────────────────────────────
const GRADE_COLORS = {
  1:  { color: '#4ade80', emissive: '#16a34a', from: '#22c55e', to: '#38bdf8'  },
  2:  { color: '#34d399', emissive: '#059669', from: '#059669', to: '#38bdf8'  },
  3:  { color: '#86efac', emissive: '#15803d', from: '#059669', to: '#84cc16'  },
  4:  { color: '#22d3ee', emissive: '#0891b2', from: '#0891b2', to: '#a78bfa'  },
  5:  { color: '#fbbf24', emissive: '#b45309', from: '#d97706', to: '#f59e0b'  },
  6:  { color: '#a855f7', emissive: '#7c3aed', from: '#7c3aed', to: '#2563eb'  },
  7:  { color: '#f472b6', emissive: '#be185d', from: '#db2777', to: '#a855f7'  },
  8:  { color: '#60a5fa', emissive: '#1d4ed8', from: '#2563eb', to: '#06b6d4'  },
  9:  { color: '#818cf8', emissive: '#4338ca', from: '#4f46e5', to: '#7c3aed'  },
  10: { color: '#f87171', emissive: '#b91c1c', from: '#dc2626', to: '#f97316'  },
}

// ── Realm → GLB mesh mapping (all 10 grades) ─────────────────────
const REALM_MESH_MAP = {
  realm_grade1:  { meshName: 'North',        grade: 1  },
  realm_grade2:  { meshName: 'America_2',    grade: 2  },
  realm_grade3:  { meshName: 'America_1',    grade: 3  },
  realm_grade4:  { meshName: 'Africa',       grade: 4  },
  realm_grade5:  { meshName: 'Australia',    grade: 5  },
  realm_grade6:  { meshName: 'Eurasia',      grade: 6  },
  realm_grade7:  { meshName: 'South',        grade: 7  },
  realm_grade8:  { meshName: 'Greenland',    grade: 8  },
  realm_grade9:  { meshName: 'Plane_snow',   grade: 9  },
  realm_grade10: { meshName: 'Plane_desert', grade: 10 },
}

// ── Collect all meshes under a named parent node ──────────────────
function getMeshesForNode(scene, nodeName) {
  const meshes = []
  scene.traverse((obj) => {
    if (obj.name === nodeName || obj.name === `${nodeName}_All_0`) {
      obj.traverse((child) => {
        if (child.isMesh) meshes.push(child)
      })
    }
  })
  // Also catch direct mesh match
  scene.traverse((obj) => {
    if (obj.isMesh && obj.name === `${nodeName}_All_0`) {
      if (!meshes.includes(obj)) meshes.push(obj)
    }
  })
  return meshes
}

// ── Single interactive continent/region ──────────────────────────
function RealmRegion({ scene, realm, isHovered, onClick, onPointerOver, onPointerOut }) {
  const mapping = REALM_MESH_MAP[realm.id]
  if (!mapping) return null
  const palette = GRADE_COLORS[mapping.grade] || GRADE_COLORS[1]

  const meshes = useMemo(() => getMeshesForNode(scene, mapping.meshName), [scene, mapping.meshName])
  const groupRef = useRef()
  const materialsRef = useRef([])

  useEffect(() => {
    materialsRef.current = meshes.map((mesh) => {
      const mat = mesh.material.clone()
      mesh.material = mat
      return mat
    })
  }, [meshes])

  useFrame((_, delta) => {
    const target = isHovered ? 0.7 : 0.08
    materialsRef.current.forEach((mat) => {
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, delta * 8)
        mat.emissive.set(palette.emissive)
      }
    })
    if (groupRef.current) {
      const targetY = isHovered ? 0.18 : 0
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 6)
    }
  })

  if (meshes.length === 0) return null

  return (
    <group ref={groupRef}>
      {meshes.map((mesh, i) => (
        <primitive
          key={i}
          object={mesh}
          onClick={(e) => { e.stopPropagation(); onClick() }}
          onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); document.body.style.cursor = 'pointer' }}
          onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); document.body.style.cursor = 'auto' }}
        />
      ))}
    </group>
  )
}

// ── Label pin that floats above each realm region ─────────────────
function RealmPin({ scene, realm, isHovered }) {
  const mapping = REALM_MESH_MAP[realm.id]
  if (!mapping) return null
  const palette = GRADE_COLORS[mapping.grade] || GRADE_COLORS[1]

  const center = useMemo(() => {
    const meshes = getMeshesForNode(scene, mapping.meshName)
    if (meshes.length === 0) return new THREE.Vector3(0, 2, 0)
    const box = new THREE.Box3()
    meshes.forEach((m) => box.expandByObject(m))
    const c = new THREE.Vector3()
    box.getCenter(c)
    c.y = box.max.y + 0.35
    return c
  }, [scene, mapping.meshName])

  const pinRef = useRef()
  useFrame((state) => {
    if (pinRef.current) {
      pinRef.current.position.y = center.y + Math.sin(state.clock.getElapsedTime() * 1.5 + mapping.grade) * 0.06
      pinRef.current.material.opacity = isHovered ? 1 : 0.65
    }
  })

  return (
    <mesh ref={pinRef} position={[center.x, center.y, center.z]}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshStandardMaterial
        color={palette.color}
        emissive={palette.emissive}
        emissiveIntensity={isHovered ? 2 : 0.6}
        transparent
        opacity={0.65}
      />
    </mesh>
  )
}

// ── The full interactive world map ────────────────────────────────
function InteractiveWorldMap({ realms, onSelectRealm, hoveredRealm, setHoveredRealm }) {
  const { scene } = useGLTF('/cartoon_world_map.glb')
  const mapRef = useRef()

  // Enable shadows on load
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  // Very gentle idle rotation
  useFrame((_, delta) => {
    if (mapRef.current) mapRef.current.rotation.y += delta * 0.012
  })

  const realmMap = useMemo(() => {
    const m = {}
    realms.forEach((r) => { m[r.id] = r })
    return m
  }, [realms])

  return (
    <group ref={mapRef} position={[0, -3.5, 0]} scale={[5.5, 5.5, 5.5]}>
      {/* Base model — rendered normally, interactions layered on top */}
      <primitive object={scene} />

      {/* Interactive overlays per realm */}
      {Object.entries(REALM_MESH_MAP).map(([realmId, mapping]) => {
        const realm = realmMap[realmId]
        if (!realm) return null
        return (
          <RealmRegion
            key={realmId}
            scene={scene}
            realm={realm}
            isHovered={hoveredRealm?.id === realmId}
            onClick={() => onSelectRealm(realm)}
            onPointerOver={() => setHoveredRealm(realm)}
            onPointerOut={() => setHoveredRealm(null)}
          />
        )
      })}

      {/* Floating pins */}
      {Object.entries(REALM_MESH_MAP).map(([realmId]) => {
        const realm = realmMap[realmId]
        if (!realm) return null
        return (
          <RealmPin
            key={`pin-${realmId}`}
            scene={scene}
            realm={realm}
            isHovered={hoveredRealm?.id === realmId}
          />
        )
      })}
    </group>
  )
}

// ── Full 3D scene ─────────────────────────────────────────────────
function WorldMapScene({ realms, hoveredRealm, setHoveredRealm, onSelectRealm }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.65} color="#c7d8f0" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.4}
        castShadow
        color="#fff8e7"
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-12, 10, -8]} intensity={0.5} color="#b0c4f8" />
      <pointLight position={[-10, 8, -10]} intensity={0.8} color="#a855f7" distance={40} decay={2} />
      <pointLight position={[10, 5, 10]}   intensity={0.5} color="#22d3ee" distance={30} decay={2} />
      <pointLight position={[0, 15, 0]}    intensity={0.3} color="#38bdf8" distance={50} decay={2} />

      <fog attach="fog" args={['#030510', 40, 90]} />

      {/* Space background */}
      <Stars radius={100} depth={60} count={3000} factor={4} saturation={0.1} fade speed={0.3} />
      <ParticleGalaxy count={1200} radius={50} />

      {/* The interactive GLB world */}
      <InteractiveWorldMap
        realms={realms}
        onSelectRealm={onSelectRealm}
        hoveredRealm={hoveredRealm}
        setHoveredRealm={setHoveredRealm}
      />

      <Environment preset="night" />
      <PostProcessing bloomIntensity={1.1} />
      <CameraRig />
    </>
  )
}

// ── Grade card (sidebar) ──────────────────────────────────────────
function GradeCard({ realm, onClick, index, isHovered }) {
  const palette = GRADE_COLORS[realm.grade] || GRADE_COLORS[1]

  return (
    <motion.button
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 220, damping: 26 }}
      onClick={onClick}
      className="w-full text-left group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="glass rounded-2xl px-4 py-3 border transition-all duration-200"
        style={{
          borderColor: isHovered ? `${palette.color}70` : `${palette.color}18`,
          boxShadow: isHovered ? `0 0 22px ${palette.color}22` : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Grade badge */}
          <div
            className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-black font-outfit text-sm text-white transition-transform duration-200 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
              boxShadow: `0 0 14px ${palette.color}50`,
            }}
          >
            {realm.grade}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-outfit font-bold text-white text-sm leading-tight">
              Grade {realm.grade}
            </p>
            <p className="text-white/35 text-xs mt-0.5 truncate">{realm.tagline}</p>
          </div>
          {/* Arrow */}
          <span
            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ color: palette.color }}
          >
            →
          </span>
        </div>
      </div>
    </motion.button>
  )
}

function GradeListPanel({ realms, onSelect, hoveredRealm }) {
  // Sort by grade, all unlocked
  const sorted = [...realms].sort((a, b) => a.grade - b.grade)

  return (
    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-60 flex flex-col gap-2 max-h-[82vh] overflow-y-auto layer-hud pr-1">
      <p className="text-xs font-outfit font-bold text-white/30 uppercase tracking-[0.18em] mb-1 px-1">
        Select Grade
      </p>
      {sorted.map((r, i) => (
        <GradeCard
          key={r.id}
          realm={r}
          onClick={() => onSelect(r)}
          index={i}
          isHovered={hoveredRealm?.id === r.id}
        />
      ))}
    </div>
  )
}

// ── Hover tooltip ─────────────────────────────────────────────────
function GradeTooltip({ realm }) {
  if (!realm) return null
  const palette = GRADE_COLORS[realm.grade] || GRADE_COLORS[1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="glass p-4 rounded-2xl pointer-events-none w-48"
      style={{ boxShadow: `0 0 28px ${palette.color}30`, border: `1px solid ${palette.color}30` }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black font-outfit text-lg text-white"
          style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
        >
          {realm.grade}
        </div>
        <div>
          <p className="font-outfit font-bold text-white text-sm">Grade {realm.grade}</p>
          <p className="text-white/40 text-xs mt-0.5">{realm.tagline}</p>
        </div>
      </div>
      <div
        className="text-center text-xs font-outfit font-semibold py-1.5 rounded-xl mt-1"
        style={{ background: `${palette.color}18`, color: palette.color }}
      >
        Click to Enter →
      </div>
    </motion.div>
  )
}

// ── Main Hub Scene ────────────────────────────────────────────────
export default function HubScene() {
  const navigate        = useNavigate()
  const setCameraMode   = useWorldStore(s => s.setCameraMode)
  const setCurrentRealm = useWorldStore(s => s.setCurrentRealm)
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
    gsap.to('.hub-ui', {
      opacity: 0,
      duration: 0.45,
      onComplete: () => navigate(`/realm/${realm.id}`),
    })
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: '#030510' }}>
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1.5, repeat: Infinity },
            }}
          />
          <p className="font-outfit text-white/40 tracking-widest text-sm uppercase">
            Loading MathVerse...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-full"
      style={{ background: '#030510' }}
      onMouseMove={handleMouseMove}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 26, 22], fov: 48 }}
        gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.1 }}
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
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
                boxShadow: '0 0 20px rgba(168,85,247,0.4)',
              }}
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

        {/* Grade panel */}
        <GradeListPanel
          realms={realms}
          onSelect={handleSelectRealm}
          hoveredRealm={hoveredRealm}
        />

        {/* Hover tooltip follows mouse */}
        <AnimatePresence>
          {hoveredRealm && (
            <div
              className="fixed pointer-events-none layer-modal"
              style={{ left: mousePos.x + 18, top: mousePos.y - 70 }}
            >
              <GradeTooltip realm={hoveredRealm} />
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
            Click a continent to enter · Scroll to zoom · Drag to rotate
          </p>
        </motion.div>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
