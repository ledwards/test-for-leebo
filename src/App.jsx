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
    if (view === 'deck-builder') {
      setView('sealed-pod')
      setDeckCards([])
    } else if (view === 'sealed-pod') {
      setView('set-selection')
      setSelectedSet(null)
    } else if (view === 'set-selection') {
      setView('landing')
    }
  }

  const handleBuildDeck = (cards, setCode) => {
    setDeckCards(cards)
    setSelectedSet(setCode) // Keep setCode for deck builder
    setView('deck-builder')
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
        <SealedPod setCode={selectedSet} onBack={handleBack} onBuildDeck={handleBuildDeck} />
      )}
      {view === 'deck-builder' && deckCards.length > 0 && selectedSet && (
        <DeckBuilder cards={deckCards} setCode={selectedSet} onBack={handleBack} />
      )}
    </div>
  )
}

export default App
