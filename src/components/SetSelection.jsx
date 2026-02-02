import { useState, useEffect } from 'react'
import './SetSelection.css'
import { fetchSets } from '../utils/api'
import Button from './Button'

function SetSelection({ onSetSelect, onBack }) {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageFallbacks, setImageFallbacks] = useState({})
  const [failedImages, setFailedImages] = useState(new Set())
  const [isVertical, setIsVertical] = useState(false)

  // Map set codes to their set numbers for sorting
  const getSetNumber = (setCode) => {
    const setCodeMap = {
      'SOR': 1, // Spark of Rebellion
      'SHD': 2, // Shadows of the Galaxy
      'TWI': 3, // Twilight of the Republic
      'JTL': 4, // Jump to Lightspeed
      'LOF': 5, // Legends of the Force
      'SEC': 6, // Secrets of Power
      // Future sets will be 7, 8, 9, etc.
    }
    return setCodeMap[setCode] || 999 // Unknown sets go to end
  }

  // Sort sets in display order: [7, 8, 9, 4, 5, 6, 1, 2, 3]
  // This creates the layout: Row 1: [7, 8, 9] or [4, 5, 6], Row 2: [1, 2, 3]
  // When vertical (single column), sort in reverse set number order (6, 5, 4, 3, 2, 1)
  const sortSetsForDisplay = (sets, vertical = false) => {
    return [...sets].sort((a, b) => {
      const numA = getSetNumber(a.code)
      const numB = getSetNumber(b.code)

      // When vertical, reverse order by set number
      if (vertical) {
        return numB - numA // Reverse: highest number first
      }

      // Define display order: [7, 8, 9, 4, 5, 6, 1, 2, 3]
      // Future-proof: when 7, 8, 9 come out, they'll be at the top
      const displayOrder = [7, 8, 9, 4, 5, 6, 1, 2, 3]
      const indexA = displayOrder.indexOf(numA)
      const indexB = displayOrder.indexOf(numB)

      // If not in display order, put at end
      if (indexA === -1 && indexB === -1) return numA - numB
      if (indexA === -1) return 1
      if (indexB === -1) return -1

      return indexA - indexB
    })
  }

  // Check if we're in vertical (single column) mode
  useEffect(() => {
    const checkVertical = () => {
      setIsVertical(window.innerWidth <= 900)
    }

    checkVertical()
    window.addEventListener('resize', checkVertical)
    return () => window.removeEventListener('resize', checkVertical)
  }, [])

  const [rawSets, setRawSets] = useState([])

  useEffect(() => {
    const loadSets = async () => {
      try {
        setLoading(true)
        const setsData = await fetchSets()
        setRawSets(setsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSets()
  }, [])

  // Sort sets whenever rawSets or isVertical changes
  useEffect(() => {
    if (rawSets.length > 0) {
      const sortedSets = sortSetsForDisplay(rawSets, isVertical)
      setSets(sortedSets)
    }
  }, [rawSets, isVertical])

  if (loading) {
    return (
      <div className="set-selection">
        <div className="loading"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="set-selection">
        <div className="error">Error: {error}</div>
        <Button variant="back" onClick={onBack}>Go Back</Button>
      </div>
    )
  }

  const handleImageError = (setCode, e) => {
    // Try fallback URLs if primary pack art fails
    const fallbacks = [
      `https://swudb.com/images/packs/${setCode.toLowerCase()}.jpg`,
      `https://swudb.com/images/booster/${setCode}.jpg`,
      `https://swudb.com/images/sets/${setCode}.jpg`,
    ]

    const currentAttempt = imageFallbacks[setCode] || 0

    if (currentAttempt < fallbacks.length) {
      // Try next fallback URL
      e.target.src = fallbacks[currentAttempt]
      setImageFallbacks(prev => ({ ...prev, [setCode]: currentAttempt + 1 }))
    } else {
      // All fallbacks failed, mark as failed to show placeholder
      setFailedImages(prev => new Set([...prev, setCode]))
      e.target.style.display = 'none'
    }
  }

  return (
    <div className="set-selection">
      <h1>Select a Set</h1>
      <div className="sets-grid">
        {sets.map((set) => (
          <div
            key={set.code}
            className="set-card"
            onClick={() => onSetSelect(set.code)}
          >
            <div className="set-image-container">
              {set.imageUrl && !failedImages.has(set.code) && (
                <img
                  src={set.imageUrl}
                  alt={`${set.name} booster pack`}
                  className="set-image"
                  onError={(e) => handleImageError(set.code, e)}
                />
              )}
              <div className="set-image-placeholder" style={{ display: (!set.imageUrl || failedImages.has(set.code)) ? 'flex' : 'none' }}>
                <div className="placeholder-text">{set.name}</div>
                <div className="placeholder-code">{set.code}</div>
              </div>
            </div>
            <div className="set-info">
              <h3>{set.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SetSelection
