// ── Algebra Balance Simulation ────────────────────────────────────
// Balance scale with a mystery variable block that the user solves
import { Canvas } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useState, useMemo } from 'react'
import { useSpring, animated } from '@react-spring/three'

function ScaleArm({ balanced }) {
  const { rotation } = useSpring({
    rotation: balanced ? 0 : -0.22,
    config: { tension: 140, friction: 26 },
  })

  return (
    <animated.group rotation-z={rotation}>
      <mesh>
        <boxGeometry args={[4.0, 0.1, 0.18]} />
        <meshStandardMaterial color="#2a3a60" emissive="#0a1428" emissiveIntensity={0.3} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Left plate — variable side */}
      <group position={[-1.85, -0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.55, 0.07, 32]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} metalness={0.5} roughness={0.4} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.03, 0.65, 0.03]} />
          <meshStandardMaterial color="#22304a" />
        </mesh>
      </group>

      {/* Right plate — number side */}
      <group position={[1.85, -0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.55, 0.07, 32]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} metalness={0.5} roughness={0.4} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.03, 0.65, 0.03]} />
          <meshStandardMaterial color="#22304a" />
        </mesh>
      </group>
    </animated.group>
  )
}

function VariableBlock({ revealed, answer }) {
  const { glow } = useSpring({
    glow: revealed ? 0.3 : 0.9,
    config: { tension: 200, friction: 20 },
  })

  return (
    <animated.group position={[-1.85, -0.55, 0]}>
      <RoundedBox args={[0.8, 0.8, 0.8]} radius={0.1}>
        <animated.meshStandardMaterial
          color={revealed ? '#a855f7' : '#5a1fa8'}
          emissive="#a855f7"
          emissiveIntensity={glow}
          metalness={0.3}
          roughness={0.5}
        />
      </RoundedBox>
      <Text position={[0, 0, 0.42]} fontSize={0.42} color="#fff" anchorX="center" anchorY="middle" fontWeight="bold">
        {revealed ? answer : 'x'}
      </Text>
      {!revealed && (
        <Text position={[0, -0.52, 0]} fontSize={0.2} color="rgba(168,85,247,0.7)" anchorX="center" anchorY="middle">
          unknown
        </Text>
      )}
    </animated.group>
  )
}

function NumberStack({ value }) {
  // Stack blocks to represent the value
  const blocks = Math.min(value, 5)

  return (
    <group position={[1.85, -0.9, 0]}>
      {Array.from({ length: blocks }, (_, i) => (
        <group key={i} position={[0, i * 0.42, 0]}>
          <RoundedBox args={[0.65, 0.38, 0.65]} radius={0.06}>
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.25} metalness={0.3} roughness={0.5} />
          </RoundedBox>
          {blocks <= 5 && (
            <Text position={[0, 0, 0.35]} fontSize={0.22} color="#fff" anchorX="center" anchorY="middle">
              1
            </Text>
          )}
        </group>
      ))}
      <Text position={[0, blocks * 0.42 + 0.05, 0]} fontSize={0.26} color="#22d3ee" anchorX="center" anchorY="middle" fontWeight="bold">
        {value}
      </Text>
    </group>
  )
}

function Scene({ balanced, answer, revealed }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 5]} intensity={1.0} />
      <pointLight position={[-3, 1, 2]} color="#a855f7" intensity={1.5} distance={8} />
      <pointLight position={[3, 1, 2]} color="#22d3ee" intensity={1.2} distance={8} />

      <group position={[0, 0.4, 0]}>
        <ScaleArm balanced={balanced} />
        <VariableBlock revealed={revealed} answer={answer} />
        <NumberStack value={answer} />

        {/* Pedestal */}
        <mesh position={[0, -0.88, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.7, 12]} />
          <meshStandardMaterial color="#1a2844" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -1.25, 0]}>
          <cylinderGeometry args={[0.3, 0.45, 0.18, 20]} />
          <meshStandardMaterial color="#1e3060" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </>
  )
}

export default function AlgebraSim({ node }) {
  const puzzle = useMemo(() => {
    if (!node?.questions?.length) return { equation: 'x + 3 = 7', answer: 4 }
    const q = node.questions[0]
    // Try to parse "x = N" from answer
    const match = q.answer?.toString().match(/(\w)\s*=\s*(\d+)/)
    if (match) return { equation: q.text, answer: parseInt(match[2]) }
    // Try "solve: 2m + 1 = 9" → m = 4
    const simple = q.answer?.toString().match(/^(\d+)$/)
    if (simple) return { equation: q.text, answer: parseInt(simple[1]) }
    return { equation: 'n + 3 = 7', answer: 4 }
  }, [node])

  const [guess, setGuess] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(null)
  const [attempts, setAttempts] = useState(0)

  const check = () => {
    const n = parseInt(guess)
    if (isNaN(n)) return
    setAttempts(a => a + 1)
    if (n === puzzle.answer) {
      setCorrect(true)
      setRevealed(true)
    } else {
      setCorrect(false)
    }
  }

  const reset = () => { setGuess(''); setRevealed(false); setCorrect(null); setAttempts(0) }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(6,10,30,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-outfit font-bold text-mystic-400 uppercase tracking-wider">🔮 Algebra Balance</span>
        <span className="text-xs text-white/40">balance the scale</span>
      </div>

      <div style={{ height: 210 }}>
        <Canvas camera={{ position: [0, 0.3, 6], fov: 44 }} dpr={[1, 1.5]}>
          <Scene balanced={revealed} answer={puzzle.answer} revealed={revealed} />
        </Canvas>
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="text-center mb-3">
          <div className="text-lg font-outfit font-bold text-white/80">{puzzle.equation}</div>
          <div className="text-xs text-white/40 mt-0.5">What is x?</div>
        </div>

        {!revealed ? (
          <div className="flex gap-2">
            <input
              type="number"
              value={guess}
              onChange={(e) => { setGuess(e.target.value); setCorrect(null) }}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              placeholder="Enter your guess…"
              className="flex-1 px-4 py-2 rounded-xl font-outfit text-sm text-white focus:outline-none"
              style={{ background: 'rgba(168,85,247,0.08)', border: `1px solid ${correct === false ? 'rgba(239,68,68,0.5)' : 'rgba(168,85,247,0.3)'}` }}
            />
            <button onClick={check} className="px-4 py-2 rounded-xl font-outfit font-bold text-sm"
              style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7' }}>
              Check
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <span className="text-island-400 font-bold">✓ x = {puzzle.answer}</span>
              <span className="text-white/40 text-xs">The scale is balanced!</span>
            </div>
            <button onClick={reset} className="px-3 py-2 rounded-xl font-outfit text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
              New Puzzle
            </button>
          </div>
        )}

        {correct === false && (
          <div className="mt-2 text-center text-xs text-red-400">
            {puzzle.answer > parseInt(guess) ? '⬆ Too low! Try higher.' : '⬇ Too high! Try lower.'}{attempts >= 2 ? ' Hint: the answer is close to ' + puzzle.answer : ''}
          </div>
        )}
      </div>
    </div>
  )
}
