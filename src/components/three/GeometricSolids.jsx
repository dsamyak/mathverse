import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SHAPES = [
  { type: 'torus',        args: [0.6, 0.22, 16, 32],   color: '#38bdf8', emissive: '#0ea5e9' },
  { type: 'icosahedron',  args: [0.7, 0],               color: '#a855f7', emissive: '#7c3aed' },
  { type: 'octahedron',   args: [0.65, 0],              color: '#22d3ee', emissive: '#06b6d4' },
  { type: 'dodecahedron', args: [0.6, 0],               color: '#c084fc', emissive: '#a855f7' },
  { type: 'torus',        args: [0.5, 0.15, 12, 24],   color: '#4ade80', emissive: '#16a34a' },
  { type: 'icosahedron',  args: [0.5, 1],               color: '#f59e0b', emissive: '#d97706' },
  { type: 'octahedron',   args: [0.45, 0],              color: '#38bdf8', emissive: '#0ea5e9' },
  { type: 'torus',        args: [0.4, 0.12, 12, 24],   color: '#a855f7', emissive: '#7c3aed' },
]

function Solid({ shape, position, rotSpeed, phase }) {
  const ref = useRef()

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.x += delta * rotSpeed.x
      ref.current.rotation.y += delta * rotSpeed.y
      ref.current.rotation.z += delta * rotSpeed.z
      ref.current.position.y = position[1] + Math.sin(t * 0.5 + phase) * 0.4
    }
  })

  const geometry = useMemo(() => {
    switch (shape.type) {
      case 'torus':        return <torusGeometry args={shape.args} />
      case 'icosahedron':  return <icosahedronGeometry args={shape.args} />
      case 'octahedron':   return <octahedronGeometry args={shape.args} />
      case 'dodecahedron': return <dodecahedronGeometry args={shape.args} />
      default:             return <sphereGeometry args={[0.5, 16, 16]} />
    }
  }, [shape])

  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        {geometry}
        <meshPhysicalMaterial
          color={shape.color}
          emissive={shape.emissive}
          emissiveIntensity={0.4}
          roughness={0.05}
          metalness={0.8}
          transmission={0.5}
          thickness={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Glow halo */}
      <mesh scale={1.18}>
        {geometry}
        <meshBasicMaterial
          color={shape.emissive}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export function GeometricSolids() {
  const instances = useMemo(() => [
    { shape: SHAPES[0], position: [-7, 2, -3],  rotSpeed: { x: 0.4, y: 0.6, z: 0.2 }, phase: 0 },
    { shape: SHAPES[1], position: [7, 1, -4],   rotSpeed: { x: 0.3, y: 0.5, z: 0.4 }, phase: 1 },
    { shape: SHAPES[2], position: [-5, -1, -6], rotSpeed: { x: 0.5, y: 0.3, z: 0.6 }, phase: 2 },
    { shape: SHAPES[3], position: [8, 3, -2],   rotSpeed: { x: 0.2, y: 0.7, z: 0.3 }, phase: 3 },
    { shape: SHAPES[4], position: [-9, 0, 1],   rotSpeed: { x: 0.6, y: 0.4, z: 0.5 }, phase: 4 },
    { shape: SHAPES[5], position: [5, -2, 2],   rotSpeed: { x: 0.3, y: 0.5, z: 0.2 }, phase: 5 },
    { shape: SHAPES[6], position: [-4, 3, -8],  rotSpeed: { x: 0.7, y: 0.2, z: 0.4 }, phase: 6 },
    { shape: SHAPES[7], position: [9, -1, -7],  rotSpeed: { x: 0.4, y: 0.6, z: 0.3 }, phase: 7 },
  ], [])

  return (
    <>
      {instances.map((inst, i) => (
        <Solid key={i} {...inst} />
      ))}
    </>
  )
}
