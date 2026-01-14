import { useState, useEffect } from 'react'
import './SetSelection.css'
import { fetchSets } from '../utils/api'

function SetSelection({ onSetSelect, onBack }) {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
            {set.imageUrl && (
              <img src={set.imageUrl} alt={set.name} className="set-image" />
            )}
            <div className="set-info">
              <h3>{set.name}</h3>
              <p className="set-code">{set.code}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SetSelection
