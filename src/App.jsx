import { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import SetSelection from './components/SetSelection'
import SealedPod from './components/SealedPod'
import DeckBuilder from './components/DeckBuilder'
import { initializeCardCache } from './utils/cardCache'

function App() {
  const [view, setView] = useState('landing') // 'landing', 'set-selection', 'sealed-pod', 'deck-builder'
  const [selectedSet, setSelectedSet] = useState(null)
  const [deckCards, setDeckCards] = useState([])
  const [showWarning, setShowWarning] = useState(false)

  // Preload all cards on initial page load
  // This happens synchronously since cards are loaded from JSON import
  useEffect(() => {
    initializeCardCache().catch((error) => {
      console.error('Failed to load cards:', error)
    })
  }, [])

  // Load persisted sealed pod from sessionStorage on mount
  useEffect(() => {
    const savedSealedPod = sessionStorage.getItem('sealedPod')
    if (savedSealedPod) {
      try {
        const data = JSON.parse(savedSealedPod)
        setSelectedSet(data.setCode)
        // Don't auto-navigate, let user choose
      } catch (e) {
        console.error('Failed to load saved sealed pod:', e)
      }
    }
  }, [])

  const handleSealedClick = () => {
    setView('set-selection')
  }

  const handleSetSelect = (setCode) => {
    setSelectedSet(setCode)
    setView('sealed-pod')
    // Clear any existing sealed pod data
    sessionStorage.removeItem('sealedPod')
  }

  const handleBack = () => {
    if (view === 'deck-builder') {
      // Deck builder state is auto-saved, just navigate back
      setView('sealed-pod')
      // Don't clear deckCards - keep them for restoration
    } else if (view === 'sealed-pod') {
      // Check if sealed pod exists in session
      const savedSealedPod = sessionStorage.getItem('sealedPod')
      if (savedSealedPod) {
        setShowWarning(true)
      } else {
        // No saved pod, safe to go back
        setView('set-selection')
        setSelectedSet(null)
      }
    } else if (view === 'set-selection') {
      setView('landing')
    }
  }

  const handleConfirmBack = () => {
    // Clear saved sealed pod and deck builder state
    sessionStorage.removeItem('sealedPod')
    sessionStorage.removeItem('deckBuilderState')
    setView('set-selection')
    setSelectedSet(null)
    setShowWarning(false)
  }

  const handleCancelBack = () => {
    setShowWarning(false)
  }

  const handleBuildDeck = (cards, setCode) => {
    setDeckCards(cards)
    setSelectedSet(setCode) // Keep setCode for deck builder
    setView('deck-builder')
  }

  const handleSealedPodGenerated = (packs, setCode) => {
    // Save sealed pod to sessionStorage
    sessionStorage.setItem('sealedPod', JSON.stringify({
      setCode,
      packs,
      timestamp: Date.now()
    }))
  }

  return (
    <div className="app">
      {showWarning && (
        <div className="warning-modal-overlay" onClick={handleCancelBack}>
          <div className="warning-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Warning</h2>
            <p>Going back will lose your current sealed pod and regenerate a new one. Are you sure you want to continue?</p>
            <div className="warning-modal-buttons">
              <button className="warning-button confirm" onClick={handleConfirmBack}>
                Yes, Go Back
              </button>
              <button className="warning-button cancel" onClick={handleCancelBack}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {view === 'landing' && (
        <LandingPage onSealedClick={handleSealedClick} />
      )}
      {view === 'set-selection' && (
        <SetSelection onSetSelect={handleSetSelect} onBack={handleBack} />
      )}
      {view === 'sealed-pod' && selectedSet && (
        <SealedPod 
          setCode={selectedSet} 
          onBack={handleBack} 
          onBuildDeck={handleBuildDeck}
          onPacksGenerated={handleSealedPodGenerated}
        />
      )}
      {view === 'deck-builder' && deckCards.length > 0 && selectedSet && (
        <DeckBuilder 
          cards={deckCards} 
          setCode={selectedSet} 
          onBack={handleBack}
          savedState={sessionStorage.getItem('deckBuilderState')}
        />
      )}
    </div>
  )
}

export default App
