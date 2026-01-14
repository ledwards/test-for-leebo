import { useState, useEffect } from 'react'
import './SetSelection.css'
import { fetchSets } from '../utils/api'

function SetSelection({ onSetSelect, onBack }) {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageFallbacks, setImageFallbacks] = useState({})
  const [failedImages, setFailedImages] = useState(new Set())

  useEffect(() => {
    const loadSets = async () => {
      try {
        setLoading(true)
        const setsData = await fetchSets()
        // Filter to first 6 sets for now (or all if less than 6)
        setSets(setsData.slice(0, 6))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSets()
  }, [])

  if (loading) {
    return (
      <div className="set-selection">
        <div className="loading">Loading sets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="set-selection">
        <div className="error">Error: {error}</div>
        <button onClick={onBack}>Go Back</button>
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
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>
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
