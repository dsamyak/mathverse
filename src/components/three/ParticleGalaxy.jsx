import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function ParticleGalaxy({ count = 2500, radius = 22 }) {
  const ref = useRef()

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const colorA = new THREE.Color('#38bdf8')
    const colorB = new THREE.Color('#a855f7')
    const colorC = new THREE.Color('#22d3ee')

    for (let i = 0; i < count; i++) {
      // Spiral galaxy arms
      const arm = Math.floor(Math.random() * 3)
      const baseAngle = (arm / 3) * Math.PI * 2
      const r = Math.random() * radius + 4
      const spinAngle = r * 0.3
      const angle = baseAngle + spinAngle
      const scatter = (Math.random() - 0.5) * 3

      positions[i * 3] = Math.cos(angle) * r + scatter
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5
      positions[i * 3 + 2] = Math.sin(angle) * r + scatter

      // Mix colors
      const mix = Math.random()
      const c = mix < 0.5 ? colorA.clone().lerp(colorC, mix * 2) : colorC.clone().lerp(colorB, (mix - 0.5) * 2)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return [positions, colors]
  }, [count, radius])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.018
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
