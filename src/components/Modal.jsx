import { useEffect, useCallback } from 'react'
import './Modal.css'
import Button from './Button'

/**
 * Reusable Modal Component
 *
 * Usage:
 *   <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm">
 *     <p>Are you sure?</p>
 *     <Modal.Actions>
 *       <button onClick={handleConfirm}>Yes</button>
 *       <button onClick={() => setShowModal(false)}>No</button>
 *     </Modal.Actions>
 *   </Modal>
 *
 * Props:
 *   - isOpen: boolean - whether modal is visible
 *   - onClose: function - called when overlay clicked or escape pressed
 *   - title: string (optional) - modal title
 *   - variant: 'default' | 'danger' | 'image' - styling variant
 *   - showCloseButton: boolean - show X button (default: false)
 *   - className: string - additional class for modal content
 *   - children: content to render inside modal
 */
export function Modal({
  isOpen,
  onClose,
  title,
  variant = 'default',
  showCloseButton = false,
  className = '',
  children
}) {
  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && onClose) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  const variantClass = variant !== 'default' ? `modal--${variant}` : ''

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className={`modal-content ${variantClass} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <Button
            variant="icon"
            size="sm"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </Button>
        )}
        {title && (
          <h2 className={`modal-title ${variant === 'danger' ? 'modal-title--danger' : ''}`}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}

/**
 * Modal.Actions - container for action buttons at bottom of modal
 */
Modal.Actions = function ModalActions({ children, className = '' }) {
  return (
    <div className={`modal-actions ${className}`}>
      {children}
    </div>
  )
}

/**
 * Modal.Body - container for modal body content with standard padding
 */
Modal.Body = function ModalBody({ children, className = '' }) {
  return (
    <div className={`modal-body ${className}`}>
      {children}
    </div>
  )
}

export default Modal
