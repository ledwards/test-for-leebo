/**
 * BulkMoveButtons Component
 *
 * Displays "+ All" and "- All" buttons for bulk moving cards between deck and pool.
 * Used in both Deck and Pool section headers.
 *
 * In Deck mode: Shows "- All" first (primary action is removing from deck)
 * In Pool mode: Shows "+ All" first (primary action is adding to deck)
 *
 * Can use DeckBuilderContext or receive props directly.
 */

import Button from '../Button'
import { useDeckBuilder } from '../../contexts/DeckBuilderContext'

export function BulkMoveButtons({
  cardPositions: cardPositionsProp,
  setCardPositions: setCardPositionsProp,
  mode = 'deck',
}) {
  // Try to get values from context
  let contextValue = null
  try {
    contextValue = useDeckBuilder()
  } catch {
    // Not inside a provider
  }

  const cardPositions = cardPositionsProp ?? contextValue?.cardPositions ?? {}
  const setCardPositions = setCardPositionsProp ?? contextValue?.setCardPositions
  const deckCardCount = Object.values(cardPositions)
    .filter(pos => pos.section === 'deck' && pos.visible && !pos.card.isBase && !pos.card.isLeader && pos.enabled !== false).length
  const poolCardCount = Object.values(cardPositions)
    .filter(pos => (pos.section === 'sideboard' || pos.enabled === false) && pos.visible && !pos.card.isBase && !pos.card.isLeader).length
  const isDeckEmpty = deckCardCount === 0
  const isPoolEmpty = poolCardCount === 0

  const handleAddAllToDecK = (e) => {
    e.stopPropagation()
    const poolCards = Object.entries(cardPositions)
      .filter(([_, position]) => (position.section === 'sideboard' || position.enabled === false) && position.visible && !position.card.isBase && !position.card.isLeader)
    setCardPositions(prev => {
      const updated = { ...prev }
      poolCards.forEach(([cardId]) => {
        updated[cardId] = { ...updated[cardId], section: 'deck', enabled: true }
      })
      return updated
    })
  }

  const handleRemoveAllFromDeck = (e) => {
    e.stopPropagation()
    const deckCards = Object.entries(cardPositions)
      .filter(([_, position]) => position.section === 'deck' && position.visible && !position.card.isBase && !position.card.isLeader && position.enabled !== false)
    setCardPositions(prev => {
      const updated = { ...prev }
      deckCards.forEach(([cardId]) => {
        updated[cardId] = { ...updated[cardId], section: 'sideboard', enabled: false }
      })
      return updated
    })
  }

  const addButton = (
    <Button
      key="add"
      variant="primary"
      size="xs"
      onClick={handleAddAllToDecK}
      className="add-all-button"
      disabled={isPoolEmpty}
    >
      + All
    </Button>
  )

  const removeButton = (
    <Button
      key="remove"
      variant="danger"
      size="xs"
      onClick={handleRemoveAllFromDeck}
      className="remove-all-button"
      disabled={isDeckEmpty}
    >
      - All
    </Button>
  )

  // In deck mode, show remove first (primary action)
  // In pool mode, show add first (primary action)
  if (mode === 'deck') {
    return <>{removeButton}{addButton}</>
  }
  return <>{addButton}{removeButton}</>
}

export default BulkMoveButtons
