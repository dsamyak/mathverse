import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TitleScene from './scenes/TitleScene'
import HubScene from './scenes/HubScene'
import RealmScene from './scenes/RealmScene'
import Dashboard from './ui/Dashboard'
import TextFallbackScene from './scenes/TextFallbackScene'
import { useWorldStore } from './store/worldStore'

const queryClient = new QueryClient()

export default function App() {
  const textFallback = useWorldStore(s => s.textFallback)

  // Force fallback if state is set
  if (textFallback) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <TextFallbackScene />
        </Router>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<TitleScene />} />
          <Route path="/hub" element={<HubScene />} />
          <Route path="/realm/:id" element={<RealmScene />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fallback" element={<TextFallbackScene />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}
