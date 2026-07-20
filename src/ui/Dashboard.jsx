import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Environment } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { useStudentProgress } from '../api/worldApi'
import { usePlayerStore } from '../store/playerStore'
import { REALMS, DISTRICTS, SKILL_NODES } from '../api/mockData'
import { CountingCove, MultiplicationMarsh, FractionIsles, AlgebraAscent, LockedIsland } from '../r3f/islands/Islands'
import { useWorldStore } from '../store/worldStore'
import CameraRig from '../r3f/CameraRig'

// ── Mini 3D World Map (embedded in dashboard) ─────────────────────
function MiniWorldMap() {
  const islands = [
    { Component: CountingCove, pos: [-3.5, 0, 0] },
    { Component: MultiplicationMarsh, pos: [-1, 0, -2] },
    { Component: FractionIsles, pos: [2, 0, 0] },
    { Component: AlgebraAscent, pos: [4.5, 0, -2] },
  ]
  return (
    <>
      <ambientLight intensity={0.4} color="#bfdbfe" />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#e0f2fe" />
      <fog attach="fog" args={['#040714', 25, 50]} />
      <Stars radius={60} depth={30} count={800} factor={3} saturation={0} fade speed={0.2} />
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0c4a6e" transparent opacity={0.6} />
      </mesh>
      {islands.map(({ Component, pos }, i) => (
        <Component key={i} position={pos} />
      ))}
      {[[-5, 0, -4], [6.5, 0, -4], [1, 0, -5]].map((pos, i) => (
        <LockedIsland key={i} position={pos} />
      ))}
      <CameraRig />
      <Environment preset="night" />
    </>
  )
}

// ── Mastery heatmap grid ──────────────────────────────────────────
function MasteryHeatmap({ progressData }) {
  const activeRealms = REALMS.filter(r => r.isUnlocked)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-white/30 font-inter font-medium pb-2 pr-4 min-w-[120px]">Realm</th>
            <th className="text-center text-white/30 font-inter font-medium pb-2 px-1">District 1</th>
            <th className="text-center text-white/30 font-inter font-medium pb-2 px-1">District 2</th>
            <th className="text-center text-white/30 font-inter font-medium pb-2 px-1">District 3</th>
            <th className="text-right text-white/30 font-inter font-medium pb-2 pl-4">Overall</th>
          </tr>
        </thead>
        <tbody>
          {activeRealms.map(realm => {
            const districts = (realm.districts || [])
              .map(dId => DISTRICTS[dId])
              .filter(Boolean)
            // Pad to always show 3 columns
            const paddedDistricts = [...districts, ...Array(Math.max(0, 3 - districts.length)).fill(null)]
            return (
              <tr key={realm.id} className="border-t border-white/5">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: realm.color }} />
                    <span className="text-white/70 font-outfit font-medium leading-tight">{realm.name}</span>
                  </div>
                </td>
                {paddedDistricts.map((district, di) => {
                  if (!district) return (
                    <td key={di} className="py-3 px-1 text-center">
                      <div className="inline-flex items-center justify-center w-14 h-8 rounded-lg text-xs font-outfit"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: '#334155' }}>—</div>
                    </td>
                  )
                  const pct = district.masteryPercent ?? 0
                  const bg = pct === 100 ? 'rgba(74,222,128,0.25)' : pct > 0 ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)'
                  const border = pct === 100 ? '1px solid rgba(74,222,128,0.4)' : pct > 0 ? '1px solid rgba(56,189,248,0.2)' : '1px solid rgba(255,255,255,0.05)'
                  const text = pct === 100 ? '#4ade80' : pct > 0 ? '#38bdf8' : '#475569'
                  return (
                    <td key={district.id} className="py-3 px-1 text-center">
                      <div className="inline-flex items-center justify-center w-14 h-8 rounded-lg text-xs font-outfit font-bold"
                        style={{ background: bg, border, color: text }}>
                        {pct === 100 ? '✓' : pct > 0 ? `${pct}%` : '—'}
                      </div>
                    </td>
                  )
                })}
                <td className="py-3 pl-4 text-right">
                  <span className="font-outfit font-bold" style={{ color: realm.color }}>
                    {realm.masteryPercent ?? 0}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── XP timeline sparkline (SVG) ───────────────────────────────────
function XPSparkline() {
  const points = [120, 200, 180, 320, 290, 450, 410, 580, 520, 700, 680, 840]
  const max = Math.max(...points)
  const w = 280, h = 70
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - (v / max) * h}`)

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${pts.join(' ')} ${w},${h}`}
        fill="url(#xpGrad)"
      />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="#facc15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((v, i) => (
        <circle key={i} cx={(i / (points.length - 1)) * w} cy={h - (v / max) * h} r="3"
          fill="#facc15" />
      ))}
    </svg>
  )
}

// ── Badge grid ────────────────────────────────────────────────────
function BadgeGrid({ badges }) {
  const allBadges = [
    { id: 'first_node', label: 'First Node', icon: '🌟', desc: 'Completed your first skill node' },
    { id: 'fraction_hero', label: 'Fraction Hero', icon: '🔢', desc: 'Mastered Fraction Gateway' },
    { id: 'streak_7', label: '7-Day Streak', icon: '🔥', desc: 'Learned 7 days in a row' },
    { id: 'explorer', label: 'Explorer', icon: '🗺️', desc: 'Visited 3 different realms' },
    { id: 'speed_star', label: 'Speed Star', icon: '⚡', desc: 'First try mastery!', locked: true },
    { id: 'perfect_10', label: 'Perfect 10', icon: '💎', desc: '100% on a mastery check', locked: true },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {allBadges.map(badge => {
        const earned = badges.includes(badge.id)
        return (
          <div key={badge.id}
            className={`rounded-2xl p-3 text-center transition-all ${earned ? 'glass-light border border-gold-400/20' : 'bg-white/3 border border-white/5 opacity-40'}`}
            title={badge.desc}>
            <div className={`text-3xl mb-2 ${!earned ? 'grayscale' : ''}`}>{badge.icon}</div>
            <p className="text-xs font-outfit font-semibold text-white/70 leading-tight">{badge.label}</p>
            {!earned && <p className="text-xs text-white/25 mt-0.5">Locked</p>}
          </div>
        )
      })}
    </div>
  )
}

// ── Live Activity Feed ───────────────────────────────────────────
function LiveActivityFeed({ progressData }) {
  const activities = (progressData?.recentActivity || []).map(a => {
    const node = SKILL_NODES[a.nodeId]
    if (!node) return null
    const district = Object.values(DISTRICTS).find(d => d.id === node.districtId)
    const realm = REALMS.find(r => r.districts?.includes(node.districtId))
    const ageMs = Date.now() - new Date(a.at).getTime()
    const hoursAgo = Math.floor(ageMs / 3600000)
    const timeStr = hoursAgo < 1 ? 'just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo/24)}d ago`
    return {
      icon: a.status === 'mastered' ? '⭐' : '🔓',
      text: a.status === 'mastered' ? `Mastered "${node.title}"` : `Unlocked "${node.title}"`,
      sub: `${realm?.name || 'Unknown'} · ${district?.name || 'Unknown'}`,
      time: timeStr,
      color: a.status === 'mastered' ? '#4ade80' : '#22d3ee',
    }
  }).filter(Boolean)

  // Fallback static entries if no real data yet
  const fallback = [
    { icon: '⭐', text: 'Mastered "Fractions of a Set"',    sub: 'Fraction Isles · Fraction Gateway',       time: '1 day ago',  color: '#4ade80' },
    { icon: '🔓', text: 'Unlocked "Equivalent Fractions"',  sub: 'Fraction Isles · Equivalent Grove',       time: '2 days ago', color: '#22d3ee' },
    { icon: '⭐', text: 'Mastered "Times Tables: 6–9"',     sub: 'Multiplication Marsh · Times-Table Trails', time: '3 days ago', color: '#34d399' },
  ]

  const feed = activities.length > 0 ? activities : fallback

  return (
    <div className="flex flex-col gap-3">
      {feed.map((act, i) => (
        <div key={i} className="flex items-center gap-4 glass-light rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${act.color}15`, border: `1px solid ${act.color}30` }}>
            {act.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-outfit font-semibold text-white text-sm leading-tight">{act.text}</p>
            <p className="text-white/40 text-xs mt-0.5">{act.sub}</p>
          </div>
          <span className="text-white/25 text-xs flex-shrink-0 font-inter">{act.time}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const studentName = usePlayerStore(s => s.studentName)
  const xpTotal = usePlayerStore(s => s.xpTotal)
  const badges = usePlayerStore(s => s.badges)
  const streakDays     = usePlayerStore(s => s.streakDays)
  const todayNodesDone = usePlayerStore(s => s.todayNodesDone)
  const { data: progressData } = useStudentProgress()
  const setCameraMode = useWorldStore(s => s.setCameraMode)

  const DAILY_GOAL = 3

  // Set orbit for the mini map
  const handleCanvasCreated = () => setCameraMode('orbit')

  return (
    <div className="w-full h-full overflow-y-auto bg-cosmic-950 screen-enter">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-dark border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black font-outfit text-lg"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}>M</div>
          <span className="font-outfit font-bold text-white text-xl">MathVerse</span>
          <span className="text-white/30">·</span>
          <span className="text-white/50 font-outfit">Dashboard</span>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary text-sm py-2" onClick={() => navigate('/hub')}>
            🗺️ World Map
          </button>
          <button className="btn-secondary text-sm py-2" onClick={() => navigate('/')}>
            🏠 Home
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-12 gap-6">

        {/* ── Left column ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

          {/* Student card */}
          <div className="glass border-glow-mystic p-6 rounded-3xl">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}>
                🧑‍🚀
              </div>
              <div>
                <h2 className="text-2xl font-black font-outfit text-white">{studentName}</h2>
                <p className="text-white/40 font-inter text-sm">Grade 4 Explorer</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge-mastered text-xs">Active Learner</span>
                </div>
              </div>
            </div>

            {/* XP stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Total XP', value: xpTotal.toLocaleString(), color: '#facc15' },
                { label: 'Nodes Done', value: progressData?.masteredCount || 0, color: '#4ade80' },
                { label: 'Mastery', value: `${progressData?.masteryPercent || 0}%`, color: '#22d3ee' },
              ].map((stat, i) => (
                <div key={i} className="glass-light rounded-2xl p-3 text-center">
                  <div className="text-xl font-black font-outfit" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-white/40 font-inter mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Level progress */}
            <div>
              <div className="flex justify-between text-xs font-inter mb-2">
                <span className="text-white/40">Level {Math.floor(xpTotal / 500) + 1}</span>
                <span className="text-white/40">{xpTotal % 500} / 500 XP</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{
                  width: `${((xpTotal % 500) / 500) * 100}%`,
                  background: 'linear-gradient(90deg, #facc15, #f97316)',
                }} />
              </div>
            </div>
          </div>

          {/* XP Timeline */}
          <div className="glass p-5 rounded-3xl">
            <h3 className="font-outfit font-bold text-white mb-1">XP Timeline</h3>
            <p className="text-white/30 text-xs font-inter mb-4">Last 12 sessions</p>
            <XPSparkline />
          </div>

          {/* Badges */}
          <div className="glass p-5 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-outfit font-bold text-white">Badges</h3>
              <span className="badge-mastered">{badges.length} earned</span>
            </div>
            <BadgeGrid badges={badges} />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

          {/* 3D Mini World Map */}
          <div className="glass rounded-3xl overflow-hidden" style={{ height: '300px' }}>
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-outfit font-bold text-white">Your World</h3>
                <p className="text-white/30 text-xs font-inter">Drag to explore · Click to navigate</p>
              </div>
              <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => navigate('/hub')}>
                Full Map →
              </button>
            </div>
            <Canvas
              camera={{ position: [0, 18, 14], fov: 45 }}
              gl={{ antialias: true }}
              onCreated={handleCanvasCreated}
              style={{ height: '240px' }}
            >
              <Suspense fallback={null}>
                <MiniWorldMap />
              </Suspense>
            </Canvas>
          </div>

          {/* Mastery Heatmap */}
          <div className="glass p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-outfit font-bold text-white">Mastery Heatmap</h3>
                <p className="text-white/30 text-xs font-inter mt-0.5">Progress across all realms & districts</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-inter">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-island-400/50" />
                  <span className="text-white/40">Mastered</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-crystal-400/40" />
                  <span className="text-white/40">In progress</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-white/5" />
                  <span className="text-white/40">Locked</span>
                </span>
              </div>
            </div>
            <MasteryHeatmap progressData={progressData} />
          </div>

          {/* Today's Goal card */}
          <div className="glass p-6 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(56,189,248,0.15)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-outfit font-bold text-white">Today's Goal</h3>
                <p className="text-white/30 text-xs font-inter mt-0.5">Complete {DAILY_GOAL} skill nodes daily</p>
              </div>
              <div className="text-3xl">{todayNodesDone >= DAILY_GOAL ? '🏆' : streakDays >= 3 ? '🔥' : '🎯'}</div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              {Array.from({ length: DAILY_GOAL }, (_, i) => (
                <div key={i} className={`flex-1 h-10 rounded-xl flex items-center justify-center text-sm font-outfit font-bold transition-all
                  ${i < todayNodesDone
                    ? 'bg-island-500/25 border border-island-400/40 text-island-400'
                    : 'bg-white/5 border border-white/10 text-white/20'}`}>
                  {i < todayNodesDone ? '✓' : i + 1}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs font-inter">
              <span className="text-white/40">{todayNodesDone}/{DAILY_GOAL} nodes done</span>
              <span className="text-island-400 font-semibold">
                {todayNodesDone >= DAILY_GOAL ? 'Goal reached! 🎉' : `${DAILY_GOAL - todayNodesDone} more to go`}
              </span>
            </div>
          </div>

          {/* Streak card */}
          <div className="glass p-5 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.2), rgba(249,115,22,0.2))', border: '1px solid rgba(250,204,21,0.3)' }}>
              🔥
            </div>
            <div className="flex-1">
              <p className="font-outfit font-bold text-white">{streakDays}-Day Streak</p>
              <p className="text-white/30 text-xs font-inter mt-0.5">Keep learning every day to maintain it!</p>
            </div>
            <div className="text-3xl font-black font-outfit text-gradient-gold">{streakDays}</div>
          </div>

          {/* Recent Activity — live */}
          <div className="glass p-6 rounded-3xl">
            <h3 className="font-outfit font-bold text-white mb-4">Recent Activity</h3>
            <LiveActivityFeed progressData={progressData} />
          </div>

        </div>
      </div>
    </div>
  )
}
