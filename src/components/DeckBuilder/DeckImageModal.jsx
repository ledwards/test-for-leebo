/**
 * DeckImageModal Component
 *
 * Modal for displaying and downloading deck export images.
 */

import Button from '../Button'

export function DeckImageModal({ imageUrl, onClose, poolName, setCode, poolType }) {
  if (!imageUrl) return null

  const handleClose = () => {
    URL.revokeObjectURL(imageUrl)
    onClose()
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = imageUrl

    // Generate filename with pool name and timestamp
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    let hours = now.getHours()
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const timeStr = `${month}${day}_${hours}${minutes}${ampm}`

    const displayName = poolName || `${setCode} ${poolType === 'draft' ? 'Draft' : 'Sealed'}`
    // Sanitize filename - remove invalid characters
    const sanitizedName = displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const prefix = poolType === 'draft' ? 'ptp_draft' : 'ptp_sealed'

    a.download = `${prefix}_${sanitizedName}_${timeStr}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="deck-image-modal-overlay" onClick={handleClose}>
      <div className="deck-image-modal-content" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="icon"
          size="sm"
          className="deck-image-modal-close"
          onClick={handleClose}
        >
          ×
        </Button>
        <img
          src={imageUrl}
          alt="Deck Export"
          className="deck-image-modal-image"
        />
        <div className="deck-image-modal-actions">
          <Button
            variant="primary"
            className="deck-image-modal-download"
            onClick={handleDownload}
          >
            Download Image
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeckImageModal
