import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function UnlockCeremony({ unlocks = [], realmName, onDone }) {
  const overlayRef = useRef()
  const particlesRef = useRef()
  const contentRef = useRef()

  const isRealmUnlock = unlocks.some(u => u.status === 'realm_unlocked')
  const newlyAvailable = unlocks.filter(u => u.status === 'available')
  const newlyMastered = unlocks.filter(u => u.status === 'mastered')

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setTimeout(onDone, 800),
    })

    // Overlay flash in
    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.in' }
    )
    // Content burst in
    .fromTo(contentRef.current,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' }
    )
    // Hold
    .to({}, { duration: 2.5 })
    // Fade out
    .to(overlayRef.current, { opacity: 0, duration: 0.5 })

    return () => tl.kill()
  }, [])

  // Generate confetti particles
  const confetti = Array.from({ length: 40 }, (_, i) => ({
    x: `${Math.random() * 100}%`,
    y: `${-20 - Math.random() * 40}%`,
    color: ['#facc15','#4ade80','#22d3ee','#c084fc','#f97316'][i % 5],
    size: 6 + Math.random() * 10,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    rotate: Math.random() * 720 - 360,
    tx: (Math.random() - 0.5) * 300,
  }))

  return (
    <div ref={overlayRef} className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ zIndex: 50, background: 'rgba(4,7,20,0.85)', backdropFilter: 'blur(4px)' }}>

      {/* Confetti particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {confetti.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: p.x, top: '50%',
              width: p.size, height: p.size,
              background: p.color,
              animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(250,204,21,0.15) 0%, transparent 60%)' }} />

      {/* Content */}
      <div ref={contentRef} className="relative text-center px-8 opacity-0">
        {/* Trophy / star burst icon */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.4), transparent)', animationDuration: '1s' }} />
          <div className="absolute inset-2 rounded-full flex items-center justify-center text-6xl"
            style={{ background: 'linear-gradient(135deg, #fde047, #f97316)', boxShadow: '0 0 40px rgba(250,204,21,0.6)' }}>
            {isRealmUnlock ? '🏆' : newlyMastered.length > 0 ? '⭐' : '🔓'}
          </div>
        </div>

        <h2 className="text-4xl font-black font-outfit text-gradient-gold mb-3">
          {isRealmUnlock ? 'Realm Unlocked!' : newlyMastered.length > 0 ? 'Node Mastered!' : 'Unlocked!'}
        </h2>

        {isRealmUnlock && (
          <p className="text-xl font-outfit font-semibold text-white mb-2">
            {realmName} is now open!
          </p>
        )}

        {newlyAvailable.length > 0 && (
          <p className="text-white/70 font-inter text-lg mb-4">
            🗺️ <span className="text-crystal-400 font-semibold">{newlyAvailable.length} new node{newlyAvailable.length > 1 ? 's' : ''}</span> unlocked ahead!
          </p>
        )}

        <p className="text-white/50 font-inter text-sm">Your journey continues...</p>

        {/* Decorative math symbols */}
        <div className="flex justify-center gap-4 mt-6 text-2xl">
          {['∑','√','π','∫','∞'].map((s, i) => (
            <span key={i} className="animate-sparkle text-white/20" style={{ animationDelay: `${i * 0.2}s` }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
          100% { transform: translateY(150vh) rotate(var(--r, 360deg)) translateX(var(--tx, 100px)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
