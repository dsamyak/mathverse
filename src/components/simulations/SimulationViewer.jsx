// ── Simulation Viewer Router ──────────────────────────────────────
// Picks the right 3D simulation based on the skill node's districtId / title
import { Suspense } from 'react'
import FractionPizzaSim from './FractionPizzaSim'
import CountingBlocksSim from './CountingBlocksSim'
import MultiplicationSim from './MultiplicationSim'
import DivisionSim from './DivisionSim'
import NumberLineSim from './NumberLineSim'
import ComparisonScaleSim from './ComparisonScaleSim'
import AlgebraSim from './AlgebraSim'

function SimLoading() {
  return (
    <div
      className="rounded-2xl flex items-center justify-center gap-3"
      style={{ height: 240, background: 'rgba(6,10,30,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-6 h-6 rounded-full animate-spin"
        style={{ border: '2px solid rgba(34,211,238,0.15)', borderTopColor: '#22d3ee' }}
      />
      <span className="text-white/30 text-sm font-outfit">Loading simulation…</span>
    </div>
  )
}

function pick(node) {
  const d = node?.districtId || ''
  const t = (node?.title || '').toLowerCase()

  if (d.includes('frac') || d.includes('equiv') || t.includes('fraction') || t.includes('equivalent') || t.includes('simplif') || t.includes('compar'))
    return 'fraction'
  if (d.includes('times') || d.includes('mult') || t.includes('multipl') || t.includes('times table') || t.includes('multiples'))
    return d.includes('multiples') && !d.includes('times') ? 'counting' : 'multiply'
  if (d.includes('div') || t.includes('divis'))
    return 'division'
  if (d.includes('count') || t.includes('skip') || t.includes('count by'))
    return 'numberline'
  if (d.includes('compar') || t.includes('greater') || t.includes('less than') || t.includes('equal') || t.includes('order'))
    return 'comparison'
  if (d.includes('var') || d.includes('eq') || d.includes('expr') || t.includes('algebra') || t.includes('variable') || t.includes('equation') || t.includes('expression'))
    return 'algebra'
  if (d.includes('number') || t.includes('number') || t.includes('recogn') || t.includes('count'))
    return 'counting'

  return 'counting' // default fallback
}

export default function SimulationViewer({ node }) {
  if (!node) return null

  const type = pick(node)

  const sim = {
    fraction:   <FractionPizzaSim node={node} />,
    counting:   <CountingBlocksSim node={node} />,
    multiply:   <MultiplicationSim node={node} />,
    division:   <DivisionSim node={node} />,
    numberline: <NumberLineSim node={node} />,
    comparison: <ComparisonScaleSim node={node} />,
    algebra:    <AlgebraSim node={node} />,
  }[type]

  return (
    <div className="mb-5">
      <Suspense fallback={<SimLoading />}>
        {sim}
      </Suspense>
    </div>
  )
}
