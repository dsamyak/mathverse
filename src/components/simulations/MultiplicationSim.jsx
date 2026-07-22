// ── Multiplication Array Simulation ──────────────────────────────
// 3D grid of spheres showing rows × cols = product
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useSpring, animated } from '@react-spring/three'

function Dot({ row, col, lit, color }) {
  const { scale, glow } = useSpring({
    scale: lit ? 1 : 0.5,
    glow: lit ? 0.8 : 0.03,
    config: { tension: 280, friction: 18, delay: lit ? (row * 4 + col) * 30 : 0 },
  })

  return (
    <animated.mesh position={[col * 0.8 - 0, row * -0.8, 0]} scale={scale}>
      <sphereGeometry args={[0.28, 16, 16]} />
      <animated.meshStandardMaterial
        color={lit ? color : '#1a1a3a'}
        emissive={lit ? color : '#000510'}
        emissiveIntensity={glow}
        metalness={0.2}
        roughness={0.5}
        transparent
        opacity={lit ? 1 : 0.3}
      />
    </animated.mesh>
  )
}

function RowLabel({ row, rows, lit, cols }) {
  return (
    <group position={[cols * 0.8 + 0.1, row * -0.8, 0]}>
      <mesh>
        <planeGeometry args={[0.01, 0.01]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

function Scene({ rows, cols, litRows }) {
  const xOffset = ((cols - 1) * 0.8) / 2
  const yOffset = ((rows - 1) * 0.8) / 2
  const rowColors = ['#22d3ee', '#34d399', '#a855f7', '#f59e0b', '#f472b6']

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 5]} intensity={1.0} />
      <pointLight position={[0, 2, 3]} color="#22d3ee" intensity={1.2} distance={12} />

      <group position={[-xOffset, yOffset, 0]}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <Dot
              key={`${r}-${c}`}
              row={r}
              col={c}
              lit={r < litRows}
              color={rowColors[r % rowColors.length]}
            />
          ))
        )}
      </group>
    </>
  )
}

export default function MultiplicationSim({ node }) {
  // Extract multiplication values from node title/questions
  const { rows, cols } = useMemo(() => {
    const title = node?.title?.toLowerCase() || ''
    if (title.includes('2s') || title.includes('2 and')) return { rows: 4, cols: 2 }
    if (title.includes('3s') || title.includes('3 and')) return { rows: 4, cols: 3 }
    if (title.includes('4s') || title.includes('5s')) return { rows: 3, cols: 5 }
    if (title.includes('6') || title.includes('7') || title.includes('8') || title.includes('9')) return { rows: 3, cols: 7 }
    return { rows: 3, cols: 4 }
  }, [node])

  const [litRows, setLitRows] = useState(0)
  const [animating, setAnimating] = useState(false)

  const animate = () => {
    if (animating) return
    setLitRows(0)
    setAnimating(true)
    let r = 0
    const iv = setInterval(() => {
      r++
      setLitRows(r)
      if (r >= rows) {
        clearInterval(iv)
        setAnimating(false)
      }
    }, 480)
  }

  const reset = () => { setLitRows(0); setAnimating(false) }

  const product = rows * cols
  const partial = litRows * cols

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(6,10,30,0.9)', border: '1px solid rgba(52,211,153,0.2)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-outfit font-bold text-island-400 uppercase tracking-wider">⬤ Array Model</span>
        <span className="text-xs text-white/40">{rows} rows × {cols} cols</span>
      </div>

      <div style={{ height: 210 }}>
        <Canvas camera={{ position: [0, 0, Math.max(rows, cols) * 1.15 + 1.5], fov: 44 }} dpr={[1, 1.5]}>
          <Scene rows={rows} cols={cols} litRows={litRows} />
        </Canvas>
      </div>

      <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-outfit text-white">{rows}</span>
            <span className="text-white/40 font-outfit">×</span>
            <span className="text-2xl font-black font-outfit text-white">{cols}</span>
            <span className="text-white/40 font-outfit">=</span>
            <span className="text-3xl font-black font-outfit" style={{ color: '#34d399', textShadow: '0 0 18px rgba(52,211,153,0.5)' }}>
              {litRows === rows ? product : partial || '?'}
            </span>
          </div>
          {litRows > 0 && litRows < rows && (
            <div className="text-xs text-white/30 mt-0.5">{litRows} rows so far = {partial}</div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={animate} disabled={animating}
            className="px-4 py-2 rounded-xl font-outfit font-bold text-sm transition-all"
            style={{ background: animating ? 'rgba(52,211,153,0.08)' : 'rgba(52,211,153,0.18)', border: '1px solid rgba(52,211,153,0.4)', color: animating ? 'rgba(52,211,153,0.4)' : '#34d399', cursor: animating ? 'not-allowed' : 'pointer' }}>
            {animating ? 'Building…' : litRows === rows ? 'Replay' : 'Build Array'}
          </button>
          <button onClick={reset} className="px-3 py-2 rounded-xl font-outfit text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>↺</button>
        </div>
      </div>
    </div>
  )
}
