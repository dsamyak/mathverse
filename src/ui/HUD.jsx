import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { useWorldStore } from '../store/worldStore'

// ── Floating XP chip that animates up when XP is earned ──────────
function XPDeltaChip({ delta, onDone }) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    ref.current.animate([
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 1, transform: 'translateY(-20px) scale(1.1)' },
      { opacity: 0, transform: 'translateY(-50px) scale(0.9)' },
    ], { duration: 1400, easing: 'ease-out', fill: 'forwards' })
      .onfinish = onDone
  }, [])

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none select-none"
      style={{ zIndex: 99 }}
    >
      <div
        className="font-outfit font-black text-lg px-3 py-1 rounded-xl whitespace-nowrap"
        style={{
          background: 'linear-gradient(135deg, #facc15, #f97316)',
          color: 'white',
          boxShadow: '0 0 20px rgba(250,204,21,0.6)',
        }}
      >
        +{delta} XP ⭐
      </div>
    </div>
  )
}

export default function HUD() {
  const navigate = useNavigate()
  const studentName = usePlayerStore(s => s.studentName)
  const xpTotal    = usePlayerStore(s => s.xpTotal)
  const xpDelta    = usePlayerStore(s => s.xpDelta)
  const badges     = usePlayerStore(s => s.badges)
  const streakDays      = usePlayerStore(s => s.streakDays)
  const todayNodesDone  = usePlayerStore(s => s.todayNodesDone)
  const clearXPDelta    = usePlayerStore(s => s.clearXPDelta)
  const uiMode          = useWorldStore(s => s.uiMode)
  const currentRealmId  = useWorldStore(s => s.currentRealmId)

  const [showDelta, setShowDelta] = useState(false)

  // Trigger floating XP chip whenever xpDelta changes to a positive value
  useEffect(() => {
    if (xpDelta > 0) {
      setShowDelta(true)
    }
  }, [xpDelta])

  const handleDeltaDone = () => {
    setShowDelta(false)
    clearXPDelta()
  }

  if (uiMode === 'quiz' || uiMode === 'cutscene') return null

  const level     = Math.floor(xpTotal / 500) + 1
  const levelPct  = ((xpTotal % 500) / 500) * 100
  const xpToNext  = 500 - (xpTotal % 500)

  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 pb-5 pointer-events-none layer-hud">

      {/* ── Left — Player card ── */}
      <div className="flex items-end gap-3 pointer-events-auto">
        <div className="relative glass-light rounded-2xl px-4 py-3 flex items-center gap-3">
          {/* XP delta float chip */}
          {showDelta && xpDelta > 0 && (
            <XPDeltaChip delta={xpDelta} onDone={handleDeltaDone} />
          )}

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}
          >
            🧑‍🚀
          </div>

          <div>
            <p className="font-outfit font-bold text-white text-sm leading-tight">{studentName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-gold-400 text-xs font-outfit font-semibold">
                ⭐ {xpTotal.toLocaleString()} XP
              </span>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-crystal-400 text-xs font-outfit font-semibold">Lv.{level}</span>
            </div>
          </div>
        </div>

        {/* Streak badge */}
        <div
          className="glass-light rounded-2xl px-3 py-2 flex items-center gap-2 border"
          style={{ borderColor: streakDays >= 7 ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.08)' }}
          title={`${streakDays}-day learning streak`}
        >
          <span className="text-lg">{streakDays >= 7 ? '🔥' : '📅'}</span>
          <div>
            <p className="text-xs font-outfit font-bold text-white leading-none">{streakDays}</p>
            <p className="text-xs text-white/30 leading-none">day streak</p>
          </div>
        </div>

        {/* Today's nodes badge */}
        {todayNodesDone > 0 && (
          <div className="glass-light rounded-2xl px-3 py-2 flex items-center gap-2">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-xs font-outfit font-bold text-island-400 leading-none">{todayNodesDone}</p>
              <p className="text-xs text-white/30 leading-none">today</p>
            </div>
          </div>
        )}

        {/* Badges strip */}
        {badges.slice(0, 3).map((badge, i) => (
          <div
            key={i}
            title={badge.replace(/_/g, ' ')}
            className="w-9 h-9 rounded-xl glass-light border border-white/10 flex items-center justify-center text-base"
            style={{ boxShadow: '0 0 10px rgba(250,204,21,0.2)' }}
          >
            {i === 0 ? '🥇' : i === 1 ? '🏆' : '⚡'}
          </div>
        ))}
      </div>

      {/* ── Center — Nav buttons ── */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {currentRealmId && (
          <button
            className="glass-light border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-outfit font-semibold text-white/70 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
            onClick={() => navigate('/hub')}
          >
            🗺️ World Map
          </button>
        )}
        <button
          className="glass-light border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-outfit font-semibold text-white/70 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
          onClick={() => navigate('/dashboard')}
        >
          📊 Dashboard
        </button>
      </div>

      {/* ── Right — XP level progress bar ── */}
      <div className="glass-light rounded-2xl px-4 py-3 w-52">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-outfit text-white/40">Level {level}</span>
          <span className="text-xs font-outfit font-bold text-gold-400">
            {xpToNext} XP to Lv.{level + 1}
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${levelPct}%`,
              background: 'linear-gradient(90deg, #facc15, #f97316)',
              transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
        </div>
        <p className="text-xs text-white/25 mt-1 text-right">
          {xpTotal % 500} / 500 XP this level
        </p>
      </div>
    </div>
  )
}
