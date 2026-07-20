import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const ORB_SYMBOLS_A = ['π', '∑', '∞', '√', 'θ']
const ORB_SYMBOLS_B = ['÷', '×', '=', '%', 'Δ']

function OrbitRing({ symbols, radius, speed, color, tilt = 0 }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * speed
  })
  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      <Suspense fallback={null}>
        {symbols.map((sym, i) => {
          const angle = (i / symbols.length) * Math.PI * 2
          return (
            <Text
              key={i}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              fontSize={0.38}
              color={color}
              anchorX="center"
              anchorY="middle"
              material-transparent
              material-opacity={0.85}
              material-blending={THREE.AdditiveBlending}
              material-depthWrite={false}
            >
              {sym}
            </Text>
          )
        })}
      </Suspense>
    </group>
  )
}

function GlassCube() {
  const outerRef = useRef()
  const innerRef = useRef()
  const innerB   = useRef()

  useFrame((_, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.12
      outerRef.current.rotation.x += delta * 0.04
    }
    if (innerRef.current) {
      innerRef.current.rotation.y += delta * 0.7
      innerRef.current.rotation.x += delta * 0.3
    }
    if (innerB.current) {
      innerB.current.rotation.y -= delta * 0.5
      innerB.current.rotation.z += delta * 0.4
    }
  })

  return (
    <>
      {/* Glass cube shell */}
      <mesh ref={outerRef}>
        <boxGeometry args={[2.4, 2.4, 2.4]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.15}
          roughness={0}
          metalness={0}
          transmission={0.88}
          thickness={1.5}
          ior={1.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={outerRef} scale={1.01}>
        <boxGeometry args={[2.4, 2.4, 2.4]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Inner octahedron */}
      <group ref={innerRef}>
        <mesh>
          <octahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={2.5}
            wireframe
          />
        </mesh>
      </group>

      {/* Inner icosahedron */}
      <group ref={innerB} scale={0.55}>
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={3}
            wireframe
          />
        </mesh>
      </group>

      {/* Core glow lights */}
      <pointLight color="#38bdf8" intensity={5}  distance={7}  decay={2} />
      <pointLight color="#a855f7" intensity={3}  distance={5}  decay={2} position={[0.5, 0.5, 0.5]} />
      <pointLight color="#22d3ee" intensity={1.5} distance={4} decay={2} position={[-0.5, -0.5, -0.5]} />
    </>
  )
}

export function MathCore({ mouseNX = 0, mouseNY = 0 }) {
  const groupRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.55) * 0.22
      groupRef.current.rotation.y += (mouseNX * 0.8 - groupRef.current.rotation.y) * 0.04
      groupRef.current.rotation.x += (-mouseNY * 0.5 - groupRef.current.rotation.x) * 0.04
    }
  })

  return (
    <group ref={groupRef}>
      <GlassCube />

      {/* Orbiting symbol rings */}
      <OrbitRing symbols={ORB_SYMBOLS_A} radius={2.4}  speed={0.5}  color="#22d3ee" tilt={0.3} />
      <OrbitRing symbols={ORB_SYMBOLS_B} radius={3.2}  speed={-0.3} color="#c084fc" tilt={-0.4} />

      {/* Particle halo */}
      <Sparkles count={70} scale={8} size={5} speed={0.25} color="#38bdf8" opacity={0.7} />
    </group>
  )
}
