import { useRef, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useWorldStore } from '../store/worldStore'

// ── Avatar (third-person capsule controller) ──────────────────────
export function Avatar({ onPositionChange }) {
  const meshRef = useRef()
  const bodyRef = useRef()
  const headRef = useRef()
  const keysRef = useRef({})
  const posRef = useRef(new THREE.Vector3(0, 0.8, 0))
  const velRef = useRef(new THREE.Vector3())

  // Keyboard listeners
  useEffect(() => {
    const down = (e) => { keysRef.current[e.code] = true }
    const up = (e) => { keysRef.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useFrame((_, delta) => {
    const keys = keysRef.current
    const speed = 4
    const vel = velRef.current

    vel.set(0, 0, 0)
    if (keys['KeyW'] || keys['ArrowUp'])    vel.z -= 1
    if (keys['KeyS'] || keys['ArrowDown'])  vel.z += 1
    if (keys['KeyA'] || keys['ArrowLeft'])  vel.x -= 1
    if (keys['KeyD'] || keys['ArrowRight']) vel.x += 1

    if (vel.lengthSq() > 0) {
      vel.normalize().multiplyScalar(speed * delta)
      posRef.current.add(vel)
      // Clamp to realm bounds
      posRef.current.x = Math.max(-8, Math.min(8, posRef.current.x))
      posRef.current.z = Math.max(-8, Math.min(8, posRef.current.z))

      // Face direction of movement
      if (meshRef.current) {
        const angle = Math.atan2(vel.x, vel.z)
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, angle, 0.15)
      }
    }

    if (meshRef.current) {
      meshRef.current.position.copy(posRef.current)
    }

    // Bobbing animation when moving
    if (bodyRef.current) {
      const moving = vel.lengthSq() > 0
      bodyRef.current.position.y = moving ? Math.sin(Date.now() * 0.01) * 0.06 : 0
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.08
    }

    onPositionChange?.([posRef.current.x, posRef.current.y, posRef.current.z])
  })

  return (
    <group ref={meshRef} position={[0, 0.8, 0]}>
      {/* Body */}
      <mesh ref={bodyRef} castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.28, 0.7, 8, 16]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} castShadow position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.7} />
      </mesh>
      {/* Backpack */}
      <mesh castShadow position={[0, 0.1, -0.25]}>
        <boxGeometry args={[0.32, 0.55, 0.18]} />
        <meshStandardMaterial color="#1e40af" roughness={0.6} />
      </mesh>
      {/* Eyes */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.88, 0.28]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}
      {/* XP Glow aura */}
      <Sparkles count={8} scale={1.2} size={1.5} speed={0.5} color="#facc15" />
    </group>
  )
}

// ── Companion NPC (Intellia AI floating guide) ────────────────────
export function CompanionNPC({ targetPosition, message }) {
  const groupRef = useRef()
  const eyeRef = useRef()
  const orbitAngle = useRef(0)

  useFrame((state, delta) => {
    orbitAngle.current += delta * 0.6

    const target = targetPosition
      ? new THREE.Vector3(...targetPosition)
      : new THREE.Vector3(0, 0, 0)

    // Orbit around avatar
    const orbitR = 1.4
    const tx = target.x + Math.cos(orbitAngle.current) * orbitR
    const tz = target.z + Math.sin(orbitAngle.current) * orbitR
    const ty = target.y + 1.6 + Math.sin(state.clock.getElapsedTime() * 1.2) * 0.2

    if (groupRef.current) {
      groupRef.current.position.lerp(new THREE.Vector3(tx, ty, tz), 0.06)
      // Face center
      groupRef.current.lookAt(target.x, ty, target.z)
    }
    if (eyeRef.current) {
      eyeRef.current.rotation.y += delta * 2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main body orb */}
      <mesh castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
      {/* Eye / scanner ring */}
      <mesh ref={eyeRef} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.2, 0.04, 8, 24]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} />
      </mesh>
      {/* Sensor dots */}
      {[0, Math.PI*0.67, Math.PI*1.33].map((a, i) => (
        <mesh key={i} position={[Math.cos(a)*0.22, 0, Math.sin(a)*0.22]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
        </mesh>
      ))}
      {/* Speech bubble when message */}
      {message && (
        <Html position={[0, 0.6, 0]} center distanceFactor={6}>
          <div className="glass border-glow-ocean rounded-2xl px-3 py-2 text-xs font-outfit font-semibold text-white max-w-[160px] text-center whitespace-nowrap">
            {message}
          </div>
        </Html>
      )}
      <Sparkles count={12} scale={0.8} size={1.2} speed={0.8} color="#22d3ee" />
    </group>
  )
}
