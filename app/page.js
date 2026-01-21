'use client'

import { useState, useEffect } from 'react'
import '../src/App.css'
import LandingPage from '../src/components/LandingPage'
import SetSelection from '../src/components/SetSelection'
import SealedPod from '../src/components/SealedPod'
import DeckBuilder from '../src/components/DeckBuilder'
import TermsOfService from '../src/components/TermsOfService'
import PrivacyPolicy from '../src/components/PrivacyPolicy'
import { initializeCardCache } from '../src/utils/cardCache'

export default function Home() {
  const [view, setView] = useState('landing')
  const [selectedSet, setSelectedSet] = useState(null)
  const [deckCards, setDeckCards] = useState([])
  const [showWarning, setShowWarning] = useState(false)

  // Preload all cards on initial page load
  useEffect(() => {
    initializeCardCache().catch((error) => {
      console.error('Failed to load cards:', error)
    })
  }, [])

  // Handle URL-based routing for legal pages and set selection
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/terms-of-service') {
      setView('terms-of-service')
    } else if (path === '/privacy-policy') {
      setView('privacy-policy')
    } else if (path === '/sets') {
      setView('set-selection')
    }
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/terms-of-service') {
        setView('terms-of-service')
      } else if (path === '/privacy-policy') {
        setView('privacy-policy')
      } else if (path === '/sets') {
        setView('set-selection')
      } else if (path === '/' || path === '') {
        setView('landing')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Load persisted sealed pod from sessionStorage on mount
  useEffect(() => {
    const savedSealedPod = sessionStorage.getItem('sealedPod')
    if (savedSealedPod) {
      try {
        const data = JSON.parse(savedSealedPod)
        setSelectedSet(data.setCode)
      } catch (e) {
        console.error('Failed to load saved sealed pod:', e)
      }
    }
  }, [])

  const handleSealedClick = () => {
    window.location.href = '/sets'
  }

  const handleDraftClick = () => {
    window.location.href = '/draft'
  }

  const handleSetSelect = (setCode) => {
    // Navigate to create a new pool for this set
    window.location.href = `/pools/new?set=${setCode}`
  }

  const handleBack = () => {
    if (view === 'terms-of-service' || view === 'privacy-policy') {
      window.history.pushState({}, '', '/')
      setView('landing')
    } else if (view === 'deck-builder') {
      setView('sealed-pod')
    } else if (view === 'sealed-pod') {
      const savedSealedPod = sessionStorage.getItem('sealedPod')
      if (savedSealedPod) {
        setShowWarning(true)
      } else {
        setView('set-selection')
        setSelectedSet(null)
      }
    } else if (view === 'set-selection') {
      sessionStorage.removeItem('sealedPod')
      sessionStorage.removeItem('deckBuilderState')
      setDeckCards([])
      setSelectedSet(null)
      setView('landing')
    }
  }

  const handleConfirmBack = () => {
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
    sessionStorage.removeItem('deckBuilderState')
    setDeckCards(cards)
    setSelectedSet(setCode)
    setView('deck-builder')
  }

  const handleSealedPodGenerated = (packs, setCode) => {
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
        <LandingPage onSealedClick={handleSealedClick} onDraftClick={handleDraftClick} />
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
      {view === 'terms-of-service' && (
        <TermsOfService onBack={handleBack} />
      )}
      {view === 'privacy-policy' && (
        <PrivacyPolicy onBack={handleBack} />
      )}
    </div>
  )
}
