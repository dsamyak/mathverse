import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useWorldStore } from '../store/worldStore'

export default function Settings({ onClose }) {
  const panelRef = useRef()
  const { 
    reducedMotion, setReducedMotion, 
    qualityLevel, setQualityLevel, 
    textFallback, setTextFallback,
    captions, setCaptions 
  } = useWorldStore()

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    )
  }, [])

  const handleClose = () => {
    gsap.to(panelRef.current, {
      opacity: 0, y: 10, duration: 0.2,
      onComplete: onClose
    })
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 layer-modal"
      style={{ background: 'rgba(4,7,20,0.6)', backdropFilter: 'blur(8px)' }}>
      
      <div ref={panelRef} className="glass w-full max-w-md p-6 border-glow-ocean opacity-0 relative">
        <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/50">
          ✕
        </button>
        
        <h2 className="text-2xl font-black font-outfit text-white mb-6">Settings</h2>
        
        <div className="space-y-6">
          {/* Graphics Quality */}
          <div>
            <p className="text-sm font-outfit font-semibold text-white/70 mb-3">Graphics Quality</p>
            <div className="flex bg-white/5 rounded-xl p-1">
              {['low', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  onClick={() => setQualityLevel(level)}
                  className={`flex-1 py-2 rounded-lg text-sm font-inter font-medium capitalize transition-all ${qualityLevel === level ? 'bg-island-500/20 text-island-400 border border-island-400/30' : 'text-white/40 hover:text-white/70'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div>
            <p className="text-sm font-outfit font-semibold text-white/70 mb-3">Accessibility</p>
            
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-2 cursor-pointer hover:bg-white/10 transition-colors">
              <div>
                <p className="text-sm font-inter text-white font-medium">Reduced Motion</p>
                <p className="text-xs text-white/40 font-inter">Disables camera shake and animations</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-island-400" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-2 cursor-pointer hover:bg-white/10 transition-colors">
              <div>
                <p className="text-sm font-inter text-white font-medium">Captions</p>
                <p className="text-xs text-white/40 font-inter">Show subtitles for audio/narrative</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-island-400" checked={captions} onChange={(e) => setCaptions(e.target.checked)} />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <div>
                <p className="text-sm font-inter text-white font-medium text-amber-400">2D Text Mode (Fallback)</p>
                <p className="text-xs text-white/40 font-inter">Use accessible non-3D interface</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-amber-400" checked={textFallback} onChange={(e) => {
                setTextFallback(e.target.checked)
                if (e.target.checked) {
                   window.location.href = '/fallback' // Force reload to fallback
                }
              }} />
            </label>
          </div>
        </div>

        <button className="btn-primary w-full justify-center mt-8" onClick={handleClose}>
          Done
        </button>
      </div>
    </div>
  )
}
