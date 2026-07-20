import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function StoryCutscene({ data, onDone }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [showNext, setShowNext] = useState(false)
  const textRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    // Initial enter animation
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
    )
  }, [])

  useEffect(() => {
    setShowNext(false)
    const tl = gsap.timeline()
    
    // Typewriter-ish reveal
    tl.fromTo(textRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    ).call(() => {
      setShowNext(true)
    })

    return () => tl.kill()
  }, [lineIdx])

  const handleNext = () => {
    if (lineIdx < data.lines.length - 1) {
      gsap.to(textRef.current, {
        opacity: 0, y: -10, duration: 0.2,
        onComplete: () => setLineIdx(i => i + 1)
      })
    } else {
      gsap.to(containerRef.current, {
        opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.in',
        onComplete: onDone
      })
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center pb-12 px-6 layer-modal"
      style={{ background: 'linear-gradient(to top, rgba(4,7,20,0.9) 0%, rgba(4,7,20,0.4) 50%, transparent 100%)' }}>
      
      <div ref={containerRef} className="glass w-full max-w-3xl p-6 md:p-8 flex items-start gap-6 border-glow-mystic relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-mystic-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Character avatar */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-4xl md:text-5xl flex-shrink-0 z-10"
          style={{ background: 'linear-gradient(135deg, #c084fc, #38bdf8)', boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}>
          {data.avatar || '👤'}
        </div>

        {/* Dialogue */}
        <div className="flex-1 z-10">
          <div className="mb-2">
            <span className="text-xs font-outfit font-bold text-mystic-400 uppercase tracking-widest bg-mystic-500/10 px-2 py-1 rounded-md border border-mystic-500/20">
              {data.title || 'Story'}
            </span>
          </div>
          <h3 className="text-lg font-outfit font-bold text-white mb-3">{data.character}</h3>
          
          <div className="min-h-[4rem]">
            <p ref={textRef} className="text-xl md:text-2xl font-inter text-white/90 leading-relaxed italic">
              "{data.lines[lineIdx]}"
            </p>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5">
              {data.lines.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === lineIdx ? 'w-6 bg-mystic-400' : i < lineIdx ? 'w-2 bg-mystic-400/50' : 'w-2 bg-white/10'}`} />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              className={`btn-primary px-6 py-2 rounded-xl text-sm transition-opacity duration-300 ${showNext ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{ background: 'linear-gradient(135deg, #a855f7, #38bdf8)' }}
            >
              {lineIdx < data.lines.length - 1 ? 'Next →' : 'Continue Journey'}
            </button>
          </div>
        </div>

        {/* Skip button (top right) */}
        <button onClick={onDone} className="absolute top-4 right-4 text-xs font-outfit text-white/30 hover:text-white/60 transition-colors z-20">
          Skip ⏭
        </button>
      </div>
    </div>
  )
}
