import { useState } from 'react'
import './CardModal.css'
import { parseCardText } from '../utils/textParser'

function CardModal({ card, onClose }) {
  const [showBack, setShowBack] = useState(false)

  if (!card) return null

  const hasBackImage = card.backImageUrl && card.isLeader
  const currentImageUrl = showBack && hasBackImage ? card.backImageUrl : card.imageUrl

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common':
        return '#999'
      case 'Uncommon':
        return '#4CAF50'
      case 'Rare':
        return '#2196F3'
      case 'Legendary':
        return '#FF9800'
      default:
        return '#666'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-body">
          <div className="modal-image-container">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={card.name || 'Card'}
                className={`modal-card-image ${card.isLeader || card.isBase ? 'unrotated' : ''}`}
              />
            ) : (
              <div className="modal-placeholder">
                <div className="modal-card-name">{card.name || 'Card'}</div>
                <div className="modal-card-rarity" style={{ color: getRarityColor(card.rarity) }}>
                  {card.rarity}
                </div>
              </div>
            )}
            
            {hasBackImage && (
              <button 
                className="flip-button"
                onClick={() => setShowBack(!showBack)}
              >
                {showBack ? 'Show Front' : 'Show Back'}
              </button>
            )}
          </div>

          <div className="modal-details">
            <h2 className="modal-title">{card.name}</h2>
            {card.subtitle && <p className="modal-subtitle">{card.subtitle}</p>}
            
            <div className="modal-stats">
              <div className="stat-row">
                <span className="stat-label">Set:</span>
                <span className="stat-value">{card.set}</span>
              </div>
              
              <div className="stat-row">
                <span className="stat-label">Rarity:</span>
                <span className="stat-value" style={{ color: getRarityColor(card.rarity) }}>
                  {card.rarity}
                </span>
              </div>
              
              <div className="stat-row">
                <span className="stat-label">Type:</span>
                <span className="stat-value">{card.type}</span>
              </div>
              
              {card.aspects && card.aspects.length > 0 && (
                <div className="stat-row">
                  <span className="stat-label">Aspects:</span>
                  <span className="stat-value">{card.aspects.join(', ')}</span>
                </div>
              )}
              
              {card.cost !== null && card.cost !== undefined && (
                <div className="stat-row">
                  <span className="stat-label">Cost:</span>
                  <span className="stat-value">{card.cost}</span>
                </div>
              )}
              
              {card.power !== null && card.power !== undefined && (
                <div className="stat-row">
                  <span className="stat-label">Power:</span>
                  <span className="stat-value">{card.power}</span>
                </div>
              )}
              
              {card.hp !== null && card.hp !== undefined && (
                <div className="stat-row">
                  <span className="stat-label">Health:</span>
                  <span className="stat-value">{card.hp}</span>
                </div>
              )}
              
              {card.traits && card.traits.length > 0 && (
                <div className="stat-row">
                  <span className="stat-label">Traits:</span>
                  <span className="stat-value">{card.traits.join(', ')}</span>
                </div>
              )}
              
              {card.keywords && card.keywords.length > 0 && (
                <div className="stat-row">
                  <span className="stat-label">Keywords:</span>
                  <span className="stat-value">{card.keywords.join(', ')}</span>
                </div>
              )}
              
              {card.unique && (
                <div className="stat-row">
                  <span className="stat-label">Unique:</span>
                  <span className="stat-value">Yes</span>
                </div>
              )}
              
              {card.frontText && (
                <div className="stat-row full-width">
                  <span className="stat-label">Text:</span>
                  <span className="stat-value card-text">
                    {parseCardText(card.frontText) || card.frontText}
                  </span>
                </div>
              )}
              
              {card.backText && (
                <div className="stat-row full-width">
                  <span className="stat-label">Back Text:</span>
                  <span className="stat-value card-text">
                    {parseCardText(card.backText) || card.backText}
                  </span>
                </div>
              )}
              
              {card.epicAction && (
                <div className="stat-row full-width">
                  <span className="stat-label">Epic Action:</span>
                  <span className="stat-value card-text">
                    {parseCardText(card.epicAction) || card.epicAction}
                  </span>
                </div>
              )}
              
              {card.artist && (
                <div className="stat-row">
                  <span className="stat-label">Artist:</span>
                  <span className="stat-value">{card.artist}</span>
                </div>
              )}
              
              {card.number && (
                <div className="stat-row">
                  <span className="stat-label">Number:</span>
                  <span className="stat-value">{card.number}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardModal
