import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  varying float vElev;
  varying vec2  vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float dist = distance(worldPos.xz, uMouse);
    float wave = sin(dist * 1.8 - uTime * 2.5) * max(0.0, 1.0 - dist / 10.0) * 0.5;
    worldPos.y += wave;
    vElev = wave;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const FRAG = /* glsl */ `
  uniform float uTime;
  varying float vElev;
  varying vec2  vUv;

  void main() {
    float alpha = 0.08 + clamp(vElev * 2.5, 0.0, 0.5);
    vec3 col = mix(vec3(0.13, 0.72, 0.93), vec3(0.66, 0.33, 0.97), vElev + 0.5);
    gl_FragColor = vec4(col, alpha);
  }
`

export function CoordinateGrid({ mouseNX = 0, mouseNY = 0 }) {
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
      matRef.current.uniforms.uMouse.value.set(mouseNX * 12, mouseNY * 12)
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[50, 50, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        wireframe
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
