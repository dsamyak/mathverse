import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { useWorldStore } from '../store/worldStore'

export default function CameraRig({ targetPosition }) {
  const { camera } = useThree()
  const cameraMode = useWorldStore(s => s.cameraMode)
  const orbitRef = useRef()
  const cinematicProgressRef = useRef(0)
  const curveRef = useRef(null)
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0))

  // Hub orbit camera config
  useEffect(() => {
    if (cameraMode === 'orbit') {
      gsap.to(camera.position, {
        x: 0, y: 22, z: 18,
        duration: 1.8,
        ease: 'power3.inOut',
      })
    }
    if (cameraMode === 'follow') {
      gsap.to(camera.position, {
        x: 0, y: 5, z: 8,
        duration: 1.2,
        ease: 'power2.inOut',
      })
    }
  }, [cameraMode, camera])

  // Cinematic path for title/transitions
  useEffect(() => {
    if (cameraMode === 'cinematic') {
      const pts = [
        new THREE.Vector3(0, 40, 50),
        new THREE.Vector3(0, 25, 30),
        new THREE.Vector3(0, 12, 15),
        new THREE.Vector3(0, 6, 8),
      ]
      curveRef.current = new THREE.CatmullRomCurve3(pts)
      cinematicProgressRef.current = 0

      gsap.to(cinematicProgressRef, {
        current: 1,
        duration: 4,
        ease: 'power2.inOut',
      })
    }
  }, [cameraMode])

  useFrame(() => {
    if (cameraMode === 'cinematic' && curveRef.current) {
      const t = Math.min(cinematicProgressRef.current, 1)
      const pt = curveRef.current.getPointAt(t)
      camera.position.lerp(pt, 0.08)
      camera.lookAt(lookAtRef.current)
    }

    if (cameraMode === 'follow' && targetPosition) {
      const target = new THREE.Vector3(
        targetPosition[0],
        targetPosition[1] + 5,
        targetPosition[2] + 8
      )
      camera.position.lerp(target, 0.05)
      lookAtRef.current.lerp(
        new THREE.Vector3(targetPosition[0], targetPosition[1] + 1, targetPosition[2]),
        0.08
      )
      camera.lookAt(lookAtRef.current)
    }
  })

  return (
    <>
      {cameraMode === 'orbit' && (
        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          minDistance={10}
          maxDistance={40}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.4}
          target={[0, 0, 0]}
          dampingFactor={0.05}
          enableDamping
        />
      )}
    </>
  )
}
