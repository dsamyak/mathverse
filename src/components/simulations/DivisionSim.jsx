// ── Division Equal Groups Simulation ─────────────────────────────
// Animate items being distributed into equal groups
import { Canvas } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { useSpring, animated, useSprings } from '@react-spring/three'

const GROUP_COLORS = ['#22d3ee', '#34d399', '#a855f7', '#f59e0b']
const TOTAL = 12
const GROUPS = 3
const PER_GROUP = TOTAL / GROUPS

function ItemBall({ groupIdx, posIdx, distributed, color }) {
  const itemIdx = groupIdx * PER_GROUP + posIdx

  // Start position: above, spread out
  // End position: in group bucket
  const gx = (groupIdx - (GROUPS - 1) / 2) * 2.2
  const py = -0.5 + posIdx * 0.6
  const startY = 2.8
  const endY = py

  const { x, y, z, opacity } = useSpring({
    x: distributed ? gx : (itemIdx - TOTAL / 2) * 0.45,
    y: distributed ? endY : startY,
    z: 0,
    opacity: 1,
    delay: distributed ? itemIdx * 90 : 0,
    config: { tension: 180, friction: 24 },
  })

  return (
    <animated.mesh position-x={x} position-y={y} position-z={z}>
      <sphereGeometry args={[0.24, 16, 16]} />
      <animated.meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
        metalness={0.2}
        roughness={0.5}
      />
    </animated.mesh>
  )
}

function GroupBucket({ idx, color, count }) {
  const gx = (idx - (GROUPS - 1) / 2) * 2.2

  return (
    <group position={[gx, -1.6, 0]}>
      {/* Base platform */}
      <RoundedBox args={[1.7, 0.12, 0.8]} radius={0.06} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} transparent opacity={0.35} />
      </RoundedBox>
      {/* Back wall */}
      <RoundedBox args={[1.7, 1.2, 0.1]} radius={0.04} position={[0, 0.6, -0.4]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.08} transparent opacity={0.2} />
      </RoundedBox>
    </group>
  )
}

function Scene({ distributed }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} />
      <pointLight position={[0, 3, 2]} color="#60a5fa" intensity={0.8} distance={12} />

      {/* Items */}
      {Array.from({ length: GROUPS }, (_, gi) =>
        Array.from({ length: PER_GROUP }, (_, pi) => (
          <ItemBall
            key={`${gi}-${pi}`}
            groupIdx={gi}
            posIdx={pi}
            distributed={distributed}
            color={GROUP_COLORS[gi % GROUP_COLORS.length]}
          />
        ))
      )}

      {/* Group buckets */}
      {Array.from({ length: GROUPS }, (_, gi) => (
        <GroupBucket key={gi} idx={gi} color={GROUP_COLORS[gi % GROUP_COLORS.length]} count={distributed ? PER_GROUP : 0} />
      ))}
    </>
  )
}

export default function DivisionSim({ node }) {
  const [distributed, setDistributed] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(6,10,30,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-outfit font-bold text-mystic-400 uppercase tracking-wider">⬡ Equal Groups</span>
        <span className="text-xs text-white/40">{TOTAL} ÷ {GROUPS} = {PER_GROUP}</span>
      </div>

      <div style={{ height: 210 }}>
        <Canvas camera={{ position: [0, 0.5, 7.5], fov: 42 }} dpr={[1, 1.5]}>
          <Scene distributed={distributed} />
        </Canvas>
      </div>

      <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-outfit text-white">{TOTAL}</span>
            <span className="text-white/40">÷</span>
            <span className="text-2xl font-black font-outfit text-white">{GROUPS}</span>
            <span className="text-white/40">=</span>
            <span className="text-3xl font-black font-outfit" style={{ color: '#a855f7', textShadow: '0 0 18px rgba(168,85,247,0.5)' }}>
              {distributed ? PER_GROUP : '?'}
            </span>
          </div>
          <div className="text-xs text-white/30 mt-0.5">
            {distributed ? `${PER_GROUP} items in each of ${GROUPS} groups` : `Distribute ${TOTAL} items into ${GROUPS} equal groups`}
          </div>
        </div>

        <button
          onClick={() => setDistributed(d => !d)}
          className="px-4 py-2 rounded-xl font-outfit font-bold text-sm transition-all"
          style={{ background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7' }}
        >
          {distributed ? '↺ Reset' : '🎯 Distribute!'}
        </button>
      </div>
    </div>
  )
}
