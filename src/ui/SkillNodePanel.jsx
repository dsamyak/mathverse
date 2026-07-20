import { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { useWorldStore } from '../store/worldStore'
import { useSkillNode, useSubmitAttempt } from '../api/worldApi'
import { usePlayerStore } from '../store/playerStore'
import UnlockCeremony from './UnlockCeremony'

// ── Stage indicator ───────────────────────────────────────────────
function StageIndicator({ stage }) {
  const stages = ['Concept', 'Practice', 'Mastery Check']
  return (
    <div className="flex items-center gap-1 justify-center mb-6">
      {stages.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-outfit font-semibold transition-all duration-300
            ${i === stage
              ? 'bg-crystal-500/20 text-crystal-400 border border-crystal-400/40'
              : i < stage
                ? 'bg-island-500/15 text-island-400 border border-island-400/30'
                : 'bg-white/5 text-white/30 border border-white/10'}`}>
            <span>{i < stage ? '✓' : i + 1}</span>
            <span>{s}</span>
          </div>
          {i < stages.length - 1 && (
            <div className={`w-6 h-0.5 rounded-full transition-all ${i < stage ? 'bg-island-400' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Topic-aware visual aid ────────────────────────────────────────
function VisualAid({ node }) {
  if (!node) return null

  const title = node.title?.toLowerCase() || ''
  const districtId = node.districtId || ''

  // Fractions visual
  if (districtId.includes('frac') || title.includes('fraction')) {
    return (
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
        <p className="text-xs text-crystal-400 font-outfit font-semibold uppercase tracking-wider mb-3">Visual Aid · Fraction Bar</p>
        <div className="flex gap-1 mb-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all
              ${i < 3 ? 'bg-crystal-500/40 border border-crystal-400/50 text-crystal-300' : 'bg-white/5 border border-white/10 text-white/20'}`}>
              {i < 3 ? '✦' : '○'}
            </div>
          ))}
        </div>
        <p className="text-center text-white/40 text-xs font-inter">3 shaded out of 8 = <span className="text-crystal-400 font-semibold">3/8</span></p>
      </div>
    )
  }

  // Multiplication visual
  if (districtId.includes('times') || districtId.includes('mult') || title.includes('multipl') || title.includes('times')) {
    const rows = 3, cols = 4
    return (
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <p className="text-xs text-island-400 font-outfit font-semibold uppercase tracking-wider mb-3">Visual Aid · Array Model ({rows} × {cols} = {rows * cols})</p>
        <div className="flex flex-col gap-1 items-center">
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="flex gap-1">
              {Array.from({ length: cols }, (_, c) => (
                <div key={c} className="w-7 h-7 rounded-lg bg-island-500/30 border border-island-400/40 flex items-center justify-center text-island-300 text-sm">●</div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-white/40 text-xs font-inter mt-2">{rows} rows × {cols} columns = <span className="text-island-400 font-semibold">{rows * cols}</span></p>
      </div>
    )
  }

  // Division visual
  if (districtId.includes('div') || title.includes('divis') || title.includes('remainder')) {
    const total = 12, groups = 3
    return (
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
        <p className="text-xs text-mystic-400 font-outfit font-semibold uppercase tracking-wider mb-3">Visual Aid · Equal Groups ({total} ÷ {groups})</p>
        <div className="flex justify-center gap-3">
          {Array.from({ length: groups }, (_, g) => (
            <div key={g} className="rounded-xl p-2 flex flex-col gap-1" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              {Array.from({ length: total / groups }, (_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-mystic-500/50 border border-mystic-400/40" />
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-white/40 text-xs font-inter mt-2">{total} items ÷ {groups} groups = <span className="text-mystic-400 font-semibold">{total / groups} each</span></p>
      </div>
    )
  }

  // Counting / Numbers visual
  if (districtId.includes('count') || districtId.includes('number') || title.includes('count')) {
    return (
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}>
        <p className="text-xs text-ocean-400 font-outfit font-semibold uppercase tracking-wider mb-3">Visual Aid · Number Line</p>
        <div className="relative flex items-center">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 rounded-full" />
          <div className="relative flex justify-between w-full px-2">
            {[0,2,4,6,8,10].map((n, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-4 h-4 rounded-full border text-xs flex items-center justify-center font-bold
                  ${n % 4 === 0 ? 'bg-ocean-500/40 border-ocean-400/60 text-ocean-300' : 'bg-white/5 border-white/20 text-white/30'}`}>
                </div>
                <span className="text-xs text-white/50 font-outfit">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Algebra / variables
  if (districtId.includes('var') || districtId.includes('eq') || districtId.includes('expr') || title.includes('algebra') || title.includes('variable')) {
    return (
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
        <p className="text-xs text-mystic-400 font-outfit font-semibold uppercase tracking-wider mb-3">Visual Aid · Balance Model</p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-mystic-500/20 border border-mystic-400/30 flex items-center justify-center text-2xl font-black font-outfit text-mystic-300">x</div>
            <span className="text-xs text-white/40">unknown</span>
          </div>
          <div className="text-2xl text-white/40 font-outfit font-bold">=</div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-2xl font-black font-outfit text-gold-300">?</div>
            <span className="text-xs text-white/40">solve it!</span>
          </div>
        </div>
      </div>
    )
  }

  // Generic comparison / ordering
  if (districtId.includes('compar') || title.includes('compar') || title.includes('order')) {
    return (
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
        <p className="text-xs text-gold-400 font-outfit font-semibold uppercase tracking-wider mb-3">Visual Aid · Comparison</p>
        <div className="flex items-center justify-center gap-3 text-2xl font-black font-outfit">
          <span className="w-12 h-12 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-gold-300">9</span>
          <span className="text-white/50 text-xl">&gt;</span>
          <span className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">5</span>
        </div>
        <p className="text-center text-white/40 text-xs font-inter mt-2">The bigger number "opens" the crocodile mouth 🐊</p>
      </div>
    )
  }

  // Default: generic visual
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={`h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300
          ${i < 4 ? 'bg-crystal-500/20 border border-crystal-400/30' : 'bg-white/5 border border-white/10'}`}>
          {i < 4 ? '✦' : '○'}
        </div>
      ))}
      <p className="col-span-4 text-center text-white/40 text-xs font-inter">4 out of 8 = ½</p>
    </div>
  )
}

// ── Explainer card (Stage 0) ──────────────────────────────────────
function ExplainerCard({ node, onNext }) {
  const cardRef = useRef()
  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
  }, [])

  return (
    <div ref={cardRef} className="opacity-0">
      {/* Story beat */}
      {node.story && (
        <div className="glass-light rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📖</span>
          <p className="text-sm font-inter text-white/70 italic leading-relaxed">{node.story}</p>
        </div>
      )}

      {/* Concept explainer */}
      <div className="rounded-2xl p-6 mb-5"
        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(168,85,247,0.12))', border: '1px solid rgba(56,189,248,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-crystal-500/20 flex items-center justify-center">
            <span className="text-crystal-400 text-sm">💡</span>
          </div>
          <span className="text-xs font-outfit font-bold text-crystal-400 uppercase tracking-wider">The Concept</span>
        </div>
        <p className="text-white font-inter leading-relaxed text-base">{node.explainer}</p>
      </div>

      {/* Dynamic visual aid */}
      <VisualAid node={node} />

      <button className="btn-primary w-full justify-center" onClick={onNext}>
        Got it! Let me Practice →
      </button>
    </div>
  )
}

// ── Question timer bar ────────────────────────────────────────────
function TimerBar({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef()

  useEffect(() => {
    setRemaining(seconds)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [seconds]) // reset when seconds prop changes (new question)

  const pct = (remaining / seconds) * 100
  const color = remaining <= 10 ? '#f97316' : remaining <= 20 ? '#facc15' : '#22d3ee'

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs font-outfit text-white/40 mb-1.5">
        <span>⏱ Time remaining</span>
        <span className={`font-bold transition-colors ${remaining <= 10 ? 'text-orange-400' : 'text-crystal-400'}`}>{remaining}s</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ── MCQ Question ──────────────────────────────────────────────────
function QuestionMCQ({ question, onAnswer, answered, result }) {
  const [selected, setSelected] = useState(null)
  const cardRef = useRef()

  useEffect(() => {
    setSelected(null)
    gsap.fromTo(cardRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' })
  }, [question.id])

  const handleSelect = (opt) => {
    if (answered) return
    setSelected(opt)
    onAnswer(opt)
  }

  return (
    <div ref={cardRef} className="opacity-0">
      <p className="text-lg font-outfit font-semibold text-white leading-relaxed mb-5">
        {question.text}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt, i) => {
          const isSelected = selected === opt
          const isCorrect  = opt === question.answer
          let cls = 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 cursor-pointer'
          if (answered && isSelected && isCorrect)  cls = 'bg-island-500/20 border border-island-400/50 text-island-400'
          else if (answered && isSelected && !isCorrect) cls = 'bg-red-500/15 border border-red-400/40 text-red-400'
          else if (answered && isCorrect) cls = 'bg-island-500/10 border border-island-400/30 text-island-400/70'

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className={`p-4 rounded-2xl text-left font-inter font-medium text-sm transition-all duration-200 ${cls}`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/50 flex-shrink-0">
                  {['A','B','C','D'][i]}
                </span>
                {opt}
                {answered && isCorrect && <span className="ml-auto text-island-400">✓</span>}
                {answered && isSelected && !isCorrect && <span className="ml-auto text-red-400">✗</span>}
              </span>
            </button>
          )
        })}
      </div>
      {answered && (
        <div className={`mt-4 p-3 rounded-xl flex items-start gap-2 text-sm font-inter
          ${result === 'correct' ? 'bg-island-500/15 text-island-400' : 'bg-amber-500/15 text-amber-400'}`}>
          <span className="text-lg flex-shrink-0">{result === 'correct' ? '🌟' : '💡'}</span>
          <p>{result === 'correct'
            ? 'Correct! Great work!'
            : `The answer is "${question.answer}". Review the concept and try the next one!`}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Drag-Drop Question ────────────────────────────────────────────
function QuestionDragDrop({ question, onAnswer, answered }) {
  const [selected, setSelected] = useState([])

  const handlePick = (item) => {
    if (answered || selected.includes(item)) return
    const newSelected = [...selected, item]
    setSelected(newSelected)
    if (newSelected.length === question.options.length) {
      onAnswer(newSelected.join(','))
    }
  }

  const handleRemove = (item) => {
    if (answered) return
    setSelected(prev => prev.filter(s => s !== item))
  }

  return (
    <div>
      <p className="text-lg font-outfit font-semibold text-white leading-relaxed mb-4">{question.text}</p>

      {/* Drop zone */}
      <div className="flex gap-2 flex-wrap mb-4 min-h-14 p-3 rounded-2xl bg-white/5 border border-dashed border-white/20">
        {selected.map((item, i) => (
          <button
            key={i}
            onClick={() => handleRemove(item)}
            className="badge-in-progress text-sm flex items-center gap-1 hover:bg-crystal-500/20 transition-all"
            title="Click to remove"
          >
            {item} <span className="text-white/30 text-xs">×</span>
          </button>
        ))}
        {selected.length === 0 && (
          <span className="text-white/30 text-sm self-center">Tap items in order below →</span>
        )}
      </div>

      {/* Source items */}
      <div className="flex gap-2 flex-wrap">
        {question.options.map((item, i) => (
          <button
            key={i}
            onClick={() => handlePick(item)}
            disabled={selected.includes(item) || answered}
            className={`px-4 py-2 rounded-xl font-outfit font-semibold text-sm border transition-all duration-200
              ${selected.includes(item)
                ? 'opacity-20 border-white/10 text-white/20 cursor-not-allowed'
                : 'border-crystal-400/40 text-crystal-400 bg-crystal-500/10 hover:bg-crystal-500/20 hover:scale-105'}`}
          >
            {item}
          </button>
        ))}
      </div>
      {selected.length === question.options.length && (
        <p className="text-xs text-white/40 mt-3 text-center font-inter">
          Order set! Click Next to confirm.
        </p>
      )}
    </div>
  )
}

// ── Answer streak indicator ───────────────────────────────────────
function StreakBadge({ streak }) {
  if (streak < 2) return null
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-outfit font-bold animate-pulse-glow"
      style={{
        background: 'linear-gradient(135deg, rgba(250,204,21,0.2), rgba(249,115,22,0.2))',
        border: '1px solid rgba(250,204,21,0.4)',
        color: '#facc15',
      }}
    >
      🔥 {streak} in a row!
    </div>
  )
}

// ── Results screen ────────────────────────────────────────────────
function ResultsScreen({ result, onRetry, onContinue }) {
  const ref = useRef()
  useEffect(() => {
    gsap.fromTo(ref.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' })
  }, [])

  const passed = result.mastered

  return (
    <div ref={ref} className="text-center opacity-0">
      {/* Score ring */}
      <div className="relative w-36 h-36 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <circle
            cx="72" cy="72" r="60" fill="none"
            stroke={passed ? '#4ade80' : '#f59e0b'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(result.score / 100) * 377} 377`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-outfit text-white">{result.score}%</span>
          <span className="text-xs text-white/40">{result.correct}/{result.total} correct</span>
        </div>
      </div>

      <p className="text-2xl font-black font-outfit mb-2" style={{ color: passed ? '#4ade80' : '#f59e0b' }}>
        {passed ? '🌟 Mastered!' : '💡 Keep Going!'}
      </p>
      <p className="text-white/60 font-inter text-sm leading-relaxed mb-3">{result.feedback}</p>

      {/* XP gained chip */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.15), rgba(249,115,22,0.1))', border: '1px solid rgba(250,204,21,0.3)' }}>
        <span className="text-xl">⭐</span>
        <span className="text-gold-400 font-outfit font-bold text-lg">+{result.xpGained} XP</span>
        {passed && <span className="badge-mastered text-xs ml-1">Node Mastered</span>}
      </div>

      <div className="flex gap-3">
        {!passed && (
          <button className="btn-secondary flex-1 justify-center" onClick={onRetry}>
            🔄 Try Again
          </button>
        )}
        <button className="btn-primary flex-1 justify-center" onClick={onContinue}>
          {passed ? '🗺️ Continue Journey' : '👍 Review & Exit'}
        </button>
      </div>
    </div>
  )
}

// ── Main Skill Node Panel ─────────────────────────────────────────
export default function SkillNodePanel() {
  const activeNodeId  = useWorldStore(s => s.activeNodeId)
  const exitSkillNode = useWorldStore(s => s.exitSkillNode)
  const applyUnlocks  = useWorldStore(s => s.applyUnlocks)
  const addXP         = usePlayerStore(s => s.addXP)
  const incrementTodayNodes = usePlayerStore(s => s.incrementTodayNodes)

  const { data: node, isLoading } = useSkillNode(activeNodeId)
  const submitAttempt = useSubmitAttempt()

  const [stage, setStage]               = useState(0) // 0=explainer 1=practice 2=mastery
  const [practiceIdx, setPracticeIdx]   = useState(0)
  const [masteryIdx, setMasteryIdx]     = useState(0)
  const [answers, setAnswers]           = useState([])
  const [questionAnswered, setQuestionAnswered] = useState(false)
  const [questionResult, setQuestionResult]     = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  const [showUnlock, setShowUnlock]     = useState(false)
  const [answerStreak, setAnswerStreak] = useState(0)
  const [timerKey, setTimerKey]         = useState(0) // increment to reset timer
  const panelRef = useRef()

  const PRACTICE_COUNT = 3
  const TIMER_SECONDS  = 30

  useEffect(() => {
    if (!panelRef.current) return
    gsap.fromTo(panelRef.current,
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )
    // Reset all state on new node
    setStage(0); setPracticeIdx(0); setMasteryIdx(0)
    setAnswers([]); setSubmitResult(null)
    setQuestionAnswered(false); setQuestionResult(null)
    setAnswerStreak(0); setTimerKey(k => k + 1)
  }, [activeNodeId])

  const handleClose = () => {
    gsap.to(panelRef.current, {
      opacity: 0, scale: 0.96, y: 20, duration: 0.3,
      onComplete: exitSkillNode,
    })
  }

  const handleAnswer = useCallback((questionId, answer, isCorrect) => {
    setQuestionAnswered(true)
    setQuestionResult(isCorrect ? 'correct' : 'wrong')
    setAnswers(prev => [...prev, { questionId, answer }])
    setAnswerStreak(prev => isCorrect ? prev + 1 : 0)
  }, [])

  const handleTimerExpire = useCallback(() => {
    if (!questionAnswered) {
      // Auto-mark as wrong when time runs out
      const qs = stage === 1
        ? (node?.questions?.slice(0, PRACTICE_COUNT) || [])
        : (node?.questions || [])
      const q = qs[stage === 1 ? practiceIdx : masteryIdx]
      if (q) handleAnswer(q.id, '__timeout__', false)
    }
  }, [questionAnswered, stage, practiceIdx, masteryIdx, node, handleAnswer])

  const handleNextQuestion = () => {
    setQuestionAnswered(false)
    setQuestionResult(null)
    setTimerKey(k => k + 1) // reset timer

    if (stage === 1) {
      // Practice: exactly PRACTICE_COUNT questions then → mastery
      if (practiceIdx >= PRACTICE_COUNT - 1) {
        setStage(2)
        setPracticeIdx(0)
        setMasteryIdx(0)
      } else {
        setPracticeIdx(i => i + 1)
      }
    } else if (stage === 2) {
      if (masteryIdx >= (node?.questions?.length ?? 1) - 1) {
        handleSubmit()
      } else {
        setMasteryIdx(i => i + 1)
      }
    }
  }

  const handleSubmit = async () => {
    if (!node) return
    const result = await submitAttempt.mutateAsync({ nodeId: node.id, answers })
    setSubmitResult(result)
    addXP(result.xpGained)
    if (result.mastered) incrementTodayNodes()
    if (result.newUnlocks?.length > 0) {
      applyUnlocks(result.newUnlocks)
      setTimeout(() => setShowUnlock(true), 600)
    }
  }

  const handleRetry = () => {
    setStage(0); setAnswers([]); setSubmitResult(null)
    setQuestionAnswered(false); setQuestionResult(null)
    setPracticeIdx(0); setMasteryIdx(0); setAnswerStreak(0)
    setTimerKey(k => k + 1)
  }

  if (!activeNodeId) return null

  const practiceQuestions = node?.questions?.slice(0, PRACTICE_COUNT) || []
  const masteryQuestions  = node?.questions || []
  const currentQ = stage === 1
    ? practiceQuestions[practiceIdx]
    : masteryQuestions[masteryIdx]

  // Difficulty label
  const diffLabel  = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'][node?.difficulty ?? 1] || 'Intermediate'
  const diffColor  = ['','#4ade80','#22d3ee','#f59e0b','#a855f7'][node?.difficulty ?? 1] || '#22d3ee'

  return (
    <>
      {/* Backdrop blur */}
      <div
        className="absolute inset-0 layer-ui"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(4,7,20,0.75)' }}
      />

      {/* Panel */}
      <div ref={panelRef} className="absolute inset-0 flex items-center justify-center p-4 layer-ui">
        <div className="glass w-full max-w-2xl max-h-[92vh] overflow-y-auto p-8 border-glow-ocean">

          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin"
                style={{ border: '3px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8' }} />
              <p className="text-white/40 font-outfit">Loading...</p>
            </div>
          ) : submitResult ? (
            <ResultsScreen result={submitResult} onRetry={handleRetry} onContinue={handleClose} />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-outfit font-bold text-crystal-400 uppercase tracking-wider">
                      Skill Node
                    </span>
                    <span
                      className="text-xs font-outfit font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${diffColor}18`, color: diffColor, border: `1px solid ${diffColor}30` }}
                    >
                      {diffLabel}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black font-outfit text-white">{node?.title}</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {/* XP reward preview */}
                  <div className="glass-light px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <span className="text-gold-400 text-xs font-outfit font-bold">⭐ {node?.xpReward} XP</span>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  >✕</button>
                </div>
              </div>

              <StageIndicator stage={stage} />

              {/* Stage 0 — Explainer */}
              {stage === 0 && node && (
                <ExplainerCard node={node} onNext={() => setStage(1)} />
              )}

              {/* Stages 1 & 2 — Questions */}
              {(stage === 1 || stage === 2) && currentQ && (
                <div>
                  {/* Progress & streak */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-outfit text-white/40">
                      {stage === 1 ? 'Practice' : 'Mastery Check'}
                      {' · '}Question {(stage === 1 ? practiceIdx : masteryIdx) + 1}
                      {' '}of{' '}
                      {stage === 1 ? PRACTICE_COUNT : masteryQuestions.length}
                    </span>
                    <StreakBadge streak={answerStreak} />
                  </div>

                  {/* Timer */}
                  {!questionAnswered && (
                    <TimerBar key={timerKey} seconds={TIMER_SECONDS} onExpire={handleTimerExpire} />
                  )}

                  {/* Question */}
                  {currentQ.type === 'drag' ? (
                    <QuestionDragDrop
                      key={currentQ.id}
                      question={currentQ}
                      answered={questionAnswered}
                      onAnswer={(ans) => handleAnswer(currentQ.id, ans, ans === currentQ.answer?.join(','))}
                    />
                  ) : (
                    <QuestionMCQ
                      key={currentQ.id}
                      question={currentQ}
                      answered={questionAnswered}
                      result={questionResult}
                      onAnswer={(opt) => handleAnswer(currentQ.id, opt, opt === currentQ.answer)}
                    />
                  )}

                  {/* Next button */}
                  {questionAnswered && (
                    <button
                      className="btn-primary w-full justify-center mt-5"
                      onClick={handleNextQuestion}
                      disabled={submitAttempt.isPending}
                    >
                      {submitAttempt.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                          Checking...
                        </span>
                      ) : stage === 2 && masteryIdx === masteryQuestions.length - 1
                        ? 'Submit & Check Mastery ✓'
                        : 'Next Question →'
                      }
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showUnlock && submitResult && (
        <UnlockCeremony
          unlocks={submitResult.newUnlocks}
          realmName=""
          onDone={() => { setShowUnlock(false); handleClose() }}
        />
      )}
    </>
  )
}
