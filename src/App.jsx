import { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import SetSelection from './components/SetSelection'
import SealedPod from './components/SealedPod'
import { initializeCardCache } from './utils/cardCache'

function App() {
  const [view, setView] = useState('landing') // 'landing', 'set-selection', 'sealed-pod'
  const [selectedSet, setSelectedSet] = useState(null)

  // Preload all cards on initial page load
  // This happens synchronously since cards are loaded from JSON import
  useEffect(() => {
    initializeCardCache().catch((error) => {
      console.error('Failed to load cards:', error)
    })
  }, [])

  const handleSealedClick = () => {
    setView('set-selection')
  }

  const handleSetSelect = (setCode) => {
    setSelectedSet(setCode)
    setView('sealed-pod')
  }

  const handleBack = () => {
    if (view === 'sealed-pod') {
      setView('set-selection')
      setSelectedSet(null)
    } else if (view === 'set-selection') {
      setView('landing')
    }
  }

  return (
    <div className="app">
      {view === 'landing' && (
        <LandingPage onSealedClick={handleSealedClick} />
      )}
      {view === 'set-selection' && (
        <SetSelection onSetSelect={handleSetSelect} onBack={handleBack} />
      )}
      {view === 'sealed-pod' && selectedSet && (
        <SealedPod setCode={selectedSet} onBack={handleBack} />
      )}
    </div>
  )
}

export default App
