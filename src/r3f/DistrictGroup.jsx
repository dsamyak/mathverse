import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useWorldStore } from '../store/worldStore'

// ── Lock Barrier (shimmer shader plane) ──────────────────────────
function LockBarrier({ locked }) {
  const meshRef = useRef()
  const matRef = useRef()

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.opacity = locked
        ? 0.5 + Math.sin(state.clock.getElapsedTime() * 2) * 0.15
        : 0
    }
    if (meshRef.current) {
      meshRef.current.visible = locked
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 1.5, 0]}>
      <planeGeometry args={[3, 3.5]} />
      <meshStandardMaterial
        ref={matRef}
        color="#38bdf8"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        emissive="#38bdf8"
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

// ── Skill Node Portal (glowing totem) ────────────────────────────
function SkillNodePortal({ node, position, onEnter }) {
  const ringRef = useRef()
  const gemRef = useRef()
  const [hovered, setHovered] = useState(false)

  const isAvailable = node.status === 'available'
  const isMastered = node.status === 'mastered'
  const isLocked = node.status === 'locked'

  const color = isMastered ? '#4ade80' : isAvailable ? '#22d3ee' : '#475569'
  const emissive = isMastered ? '#22c55e' : isAvailable ? '#0891b2' : '#1e293b'
  const emissiveInt = hovered ? 1.5 : isMastered ? 0.6 : isAvailable ? 0.8 : 0.1

  useFrame((state) => {
    if (ringRef.current && (isAvailable || isMastered)) {
      ringRef.current.rotation.y += 0.03
      ringRef.current.position.y = 1.6 + Math.sin(state.clock.getElapsedTime() * 1.5 + position[0]) * 0.1
    }
    if (gemRef.current) {
      gemRef.current.rotation.y += 0.02
    }
  })

  return (
    <group
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); if (!isLocked) setHovered(true) }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); if (!isLocked) onEnter(node.id) }}
    >
      {/* Totem base */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.8, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Totem pole */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 1.2, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Gem top */}
      <mesh ref={gemRef} castShadow position={[0, 1.7, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveInt}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>
      {/* Orbit ring */}
      <mesh ref={ringRef} position={[0, 1.6, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.45, 0.04, 8, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isLocked ? 0 : 1}
        />
      </mesh>
      {/* Lock icon for locked nodes */}
      {isLocked && (
        <Html position={[0, 2.1, 0]} center distanceFactor={8}>
          <div className="text-white/30 text-lg">🔒</div>
        </Html>
      )}
      {/* Node label on hover/mastered */}
      {(hovered || isMastered) && !isLocked && (
        <Html position={[0, 2.4, 0]} center distanceFactor={8}>
          <div className={`text-xs font-outfit font-bold rounded-xl px-2 py-1 whitespace-nowrap pointer-events-none
            ${isMastered ? 'bg-island-500/20 text-island-400 border border-island-400/30' : 'bg-crystal-500/20 text-crystal-400 border border-crystal-400/30'}`}>
            {isMastered ? '✓ ' : ''}{node.title}
          </div>
        </Html>
      )}
      {(isAvailable || isMastered) && (
        <Sparkles count={6} scale={1} size={1.5} speed={0.5} color={color} />
      )}
    </group>
  )
}

// ── Capstone Boss structure ───────────────────────────────────────
function CapstoneBoss({ active, onEnter }) {
  const pillarsRef = useRef([])
  const topRef = useRef()

  useFrame((state) => {
    if (topRef.current && active) {
      topRef.current.rotation.y += 0.01
      topRef.current.position.y = 2.8 + Math.sin(state.clock.getElapsedTime() * 0.8) * 0.15
    }
  })

  return (
    <group position={[0, 0, -6]} onClick={() => active && onEnter('capstone')}>
      {/* Four pillars */}
      {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([x,z], i) => (
        <mesh key={i} castShadow position={[x*0.8, 1.5, z*0.8]}
          ref={el => pillarsRef.current[i] = el}>
          <cylinderGeometry args={[0.15, 0.2, 3.5, 8]} />
          <meshStandardMaterial color={active ? '#7c3aed' : '#1e293b'} roughness={0.5} metalness={active ? 0.4 : 0.1} />
        </mesh>
      ))}
      {/* Top capstone crystal */}
      <mesh ref={topRef} castShadow position={[0, 2.8, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color={active ? '#c084fc' : '#334155'}
          emissive={active ? '#a855f7' : '#000000'}
          emissiveIntensity={active ? 1.2 : 0}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
      {active && <Sparkles count={30} scale={4} size={2.5} speed={0.8} color="#a855f7" />}
      {active && (
        <Html position={[0, 4.5, 0]} center distanceFactor={10}>
          <div className="glass border-glow-mystic px-3 py-2 rounded-xl text-center pointer-events-none">
            <p className="text-xs font-outfit font-bold text-mystic-400">⚔️ Realm Boss</p>
            <p className="text-xs text-white/50 mt-0.5">Click to begin capstone!</p>
          </div>
        </Html>
      )}
    </group>
  )
}

// ── District Group (landmark + barrier + nodes) ───────────────────
export function DistrictGroup({ district, onEnterNode }) {
  const isUnlocked = district.isUnlocked
  const masteredAll = district.masteryPercent === 100

  return (
    <group>
      {/* Landmark base */}
      <mesh castShadow receiveShadow
        position={[district.position?.[0] || 0, 0.5, district.position?.[2] || 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial
          color={masteredAll ? '#15803d' : isUnlocked ? '#0e4f6b' : '#1e293b'}
          roughness={0.7}
        />
      </mesh>

      {/* Lock barrier */}
      <group position={[district.position?.[0] || 0, 0, district.position?.[2] || 0]}>
        <LockBarrier locked={!isUnlocked} />
      </group>

      {/* Skill node portals */}
      {(district.nodes || []).map((node, i) => {
        const angle = (i / (district.nodes.length)) * Math.PI * 2
        const r = 2.5
        const px = (district.position?.[0] || 0) + Math.cos(angle) * r
        const pz = (district.position?.[2] || 0) + Math.sin(angle) * r
        return (
          <SkillNodePortal
            key={node.id}
            node={node}
            position={[px, 0, pz]}
            onEnter={onEnterNode}
          />
        )
      })}
    </group>
  )
}

export { CapstoneBoss }
