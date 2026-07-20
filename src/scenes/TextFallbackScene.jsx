import { useNavigate } from 'react-router-dom'
import { useWorldMap } from '../api/worldApi'

export default function TextFallbackScene() {
  const navigate = useNavigate()
  const { data: realms = [], isLoading } = useWorldMap()

  if (isLoading) {
    return <div className="p-8 text-white">Loading accessible mode...</div>
  }

  return (
    <div className="min-h-screen bg-cosmic-950 text-white p-8 overflow-y-auto font-inter">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-white/20 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-ocean-400">MathVerse (Accessible 2D Mode)</h1>
            <p className="text-white/60">Navigate curriculum as a structured list.</p>
          </div>
          <button onClick={() => {
            window.location.href = '/' // Force reload to 3D mode
          }} className="px-4 py-2 bg-white/10 rounded hover:bg-white/20">
            Return to 3D Mode
          </button>
        </header>

        <main>
          <h2 className="text-2xl font-bold mb-6 text-gold-400">Curriculum Map</h2>
          
          <div className="space-y-8">
            {realms.map(realm => (
              <section key={realm.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold" style={{ color: realm.color }}>
                    Grade {realm.grade}: {realm.name}
                  </h3>
                  <span className="bg-white/10 px-3 py-1 rounded text-sm font-semibold">
                    {realm.isUnlocked ? `${realm.masteryPercent}% Mastered` : 'Locked'}
                  </span>
                </div>
                
                {realm.isUnlocked && realm.districts && (
                  <div className="space-y-4 mt-4 pl-4 border-l-2 border-white/10">
                    {realm.districts.map(district => (
                      <div key={district.id} className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-bold text-white mb-2">{district.name}</h4>
                        <ul className="space-y-2">
                          {(district.nodes || []).map(node => (
                            <li key={node.id} className="flex justify-between items-center p-2 rounded bg-white/5">
                              <span>{node.title}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                node.status === 'mastered' ? 'bg-island-500/20 text-island-400' :
                                node.status === 'available' ? 'bg-ocean-500/20 text-ocean-400' :
                                'bg-white/10 text-white/50'
                              }`}>
                                {node.status.toUpperCase()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {!realm.isUnlocked && (
                  <p className="text-white/40 italic">Complete previous grades to unlock.</p>
                )}
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
