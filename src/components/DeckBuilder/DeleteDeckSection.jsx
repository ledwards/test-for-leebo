/**
 * DeleteDeckSection Component
 *
 * Delete button and confirmation modal for deck deletion.
 */

import { useState } from 'react'
import Button from '../Button'
import Modal from '../Modal'
import { deletePool } from '../../utils/poolApi'

export function DeleteDeckSection({ shareId, isOwner, setErrorMessage, setMessageType }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!shareId || !isOwner) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePool(shareId)
      window.location.href = '/history'
    } catch (err) {
      console.error('Failed to delete:', err)
      setErrorMessage('Failed to delete deck')
      setMessageType('error')
      setShowDeleteConfirm(false)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="delete-deck-section">
        <hr className="delete-deck-divider" />
        <Button
          variant="danger"
          className="delete-deck-button"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Delete Deck
        </Button>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        title="Delete Deck?"
        variant="danger"
      >
        <Modal.Body>
          <p>Are you sure you want to delete this deck? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Actions>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
}

export default DeleteDeckSection
