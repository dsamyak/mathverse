import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// ── Counting Cove — Grade 1: Sandy beach with giant colorful numerals ──
export function CountingCove({ position = [0,0,0], onClick }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(Date.now() * 0.001 + i) * delta * 0.3
      })
    }
  })

  return (
    <group position={position}>
      {/* Island base */}
      <mesh receiveShadow castShadow onClick={onClick}>
        <cylinderGeometry args={[4.5, 5.5, 1.2, 32]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      {/* Sandy top */}
      <mesh position={[0, 0.7, 0]} receiveShadow onClick={onClick}>
        <cylinderGeometry args={[4.5, 4.5, 0.4, 32]} />
        <meshStandardMaterial color="#F4D03F" roughness={0.95} />
      </mesh>
      {/* Ocean waves rim */}
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[5.2, 0.3, 8, 48]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.1} />
      </mesh>

      {/* Giant colorful numerals as boxes */}
      {['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'].map((c, i) => (
        <mesh key={i} position={[
          Math.cos((i / 5) * Math.PI * 2) * 2.5,
          1.8,
          Math.sin((i / 5) * Math.PI * 2) * 2.5
        ]} castShadow>
          <boxGeometry args={[0.5, 1.2, 0.3]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}

      {/* Palm trees */}
      {[[-2, 0, -2],[2, 0, -2]].map(([x,,z], i) => (
        <group key={i} position={[x, 0.9, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.15, 2.5, 8]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow>
            <coneGeometry args={[1.2, 1, 8]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </group>
      ))}

      <Sparkles count={30} scale={8} size={1.5} speed={0.3} color="#4ade80" />
    </group>
  )
}

// ── Multiplication Marsh — Grade 3: Lily-pad stepping stones ──────
export function MultiplicationMarsh({ position = [0,0,0], onClick }) {
  const lilyPads = [
    [0, 0], [1.8, 1.2], [-1.2, 1.8], [0.6, 3], [-0.6, 3.8], [1.4, 4.5],
  ]

  return (
    <group position={position}>
      {/* Island base */}
      <mesh receiveShadow castShadow onClick={onClick}>
        <cylinderGeometry args={[4, 5, 1, 32]} />
        <meshStandardMaterial color="#3d5a3e" roughness={0.9} />
      </mesh>
      {/* Mossy top */}
      <mesh position={[0, 0.55, 0]} receiveShadow onClick={onClick}>
        <cylinderGeometry args={[4, 4, 0.3, 32]} />
        <meshStandardMaterial color="#4d7c3e" roughness={1} />
      </mesh>
      {/* Water marsh area */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[3, 3.5, 0.1, 32]} />
        <meshStandardMaterial color="#1e40af" transparent opacity={0.5} roughness={0} />
      </mesh>

      {/* Lily pads */}
      {lilyPads.map(([x, z], i) => (
        <group key={i} position={[x - 0.5, 0.35, z - 2]}>
          <mesh>
            <cylinderGeometry args={[0.45, 0.45, 0.08, 16]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#22c55e' : '#16a34a'} />
          </mesh>
          {/* Times-table label as small box */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.35, 0.15, 0.08]} />
            <meshStandardMaterial color="#fde047" />
          </mesh>
        </group>
      ))}

      {/* Trees */}
      {[[-2.5, -1],[2.5, -1],[-1, 2]].map(([x,z], i) => (
        <group key={i} position={[x, 0.85, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.18, 3, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 1.8, 0]} castShadow>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color="#15803d" />
          </mesh>
        </group>
      ))}

      <Sparkles count={25} scale={7} size={1.2} speed={0.2} color="#34d399" />
    </group>
  )
}

// ── Fraction Isles — Grade 4: Crystal ice-bridge archipelago ──────
export function FractionIsles({ position = [0,0,0], onClick }) {
  const crystalRef = useRef()

  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <group position={position}>
      {/* Main island */}
      <mesh receiveShadow castShadow onClick={onClick}>
        <cylinderGeometry args={[3.5, 4.5, 1.4, 32]} />
        <meshStandardMaterial color="#0e7490" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Ice/crystal top */}
      <mesh position={[0, 0.8, 0]} receiveShadow onClick={onClick}>
        <cylinderGeometry args={[3.5, 3.5, 0.5, 32]} />
        <meshStandardMaterial color="#a5f3fc" roughness={0.1} metalness={0.1} transparent opacity={0.8} />
      </mesh>

      {/* Crystal formations */}
      {[
        [0, 1.5, 0, 2.5, 0.8],
        [1.5, 1.2, 1.5, 1.8, 0.6],
        [-1.5, 1.0, 1, 1.4, 0.5],
        [0.8, 1.3, -1.5, 2.0, 0.7],
      ].map(([x, y, z, h, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow ref={i === 0 ? crystalRef : null}>
          <coneGeometry args={[r, h, 6]} />
          <meshStandardMaterial
            color={['#22d3ee','#67e8f9','#a5f3fc','#06b6d4'][i]}
            roughness={0.05}
            metalness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Ice bridge extending outward */}
      <mesh position={[4, 0.9, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3, 0.2, 1.2]} />
        <meshStandardMaterial color="#cffafe" roughness={0.1} transparent opacity={0.7} />
      </mesh>

      {/* Mini island */}
      <mesh position={[6.5, -0.2, 0]}>
        <cylinderGeometry args={[1.5, 2, 0.8, 16]} />
        <meshStandardMaterial color="#0891b2" roughness={0.4} />
      </mesh>

      <Sparkles count={40} scale={9} size={2} speed={0.4} color="#22d3ee" />
    </group>
  )
}

// ── Algebra Ascent — Grade 6: Dark mystic tower ───────────────────
export function AlgebraAscent({ position = [0,0,0], onClick }) {
  const towerRef = useRef()

  useFrame((state) => {
    if (towerRef.current) {
      towerRef.current.rotation.y = state.clock.getElapsedTime() * 0.15
    }
  })

  return (
    <group position={position}>
      {/* Dark island base */}
      <mesh receiveShadow castShadow onClick={onClick}>
        <cylinderGeometry args={[3.5, 5, 2, 32]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.8} />
      </mesh>
      {/* Storm cloud disk */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[3, 3.5, 0.4, 32]} />
        <meshStandardMaterial color="#312e81" roughness={0.9} transparent opacity={0.8} />
      </mesh>

      {/* The Algebra Tower */}
      <group ref={towerRef} position={[0, 1.5, 0]}>
        {/* Tower base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 1.2, 4, 8]} />
          <meshStandardMaterial color="#4c1d95" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Tower middle */}
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.8, 2, 8]} />
          <meshStandardMaterial color="#5b21b6" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Tower top */}
        <mesh position={[0, 5, 0]} castShadow>
          <coneGeometry args={[0.8, 2, 8]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Glowing tip */}
        <mesh position={[0, 6.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
        </mesh>
        {/* Floating rune rings */}
        {[2, 3.5].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[1.2 - i*0.2, 0.06, 8, 32]} />
            <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>

      <Sparkles count={50} scale={10} size={2.5} speed={0.6} color="#a855f7" />
    </group>
  )
}

// ── Locked / Fogged Island ────────────────────────────────────────
export function LockedIsland({ position = [0,0,0], grade }) {
  return (
    <group position={position}>
      {/* Silhouette base */}
      <mesh>
        <cylinderGeometry args={[2.5, 3.5, 0.8, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={1} transparent opacity={0.5} />
      </mesh>
      {/* Fog cone */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[3, 4, 16]} />
        <meshStandardMaterial color="#334155" transparent opacity={0.25} side={2} />
      </mesh>
      {/* Grade label float */}
      <Sparkles count={8} scale={5} size={1} speed={0.1} color="#475569" />
    </group>
  )
}
