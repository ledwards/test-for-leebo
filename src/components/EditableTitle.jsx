'use client'

import { useState, useRef, useEffect } from 'react'
import './EditableTitle.css'

export default function EditableTitle({
  value,
  onSave,
  onTitleClick,
  isEditable = false,
  editDisabled = false,
  placeholder = 'Untitled',
  className = ''
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const inputRef = useRef(null)

  useEffect(() => {
    setEditValue(value || '')
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    if (!isEditable) return
    setEditValue(value || '')
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmedValue = editValue.trim()
    setIsEditing(false)
    if (trimmedValue !== value && onSave) {
      onSave(trimmedValue || null)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value || '')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className={`editable-title editing ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="editable-title-input"
        />
      </div>
    )
  }

  return (
    <div className={`editable-title ${isEditable || editDisabled ? 'hoverable' : ''} ${className}`}>
      <span
        className={`editable-title-text ${onTitleClick ? 'clickable' : ''}`}
        onClick={onTitleClick}
        style={onTitleClick ? { cursor: 'pointer' } : undefined}
      >
        {value || placeholder}
      </span>
      {(isEditable || editDisabled) && (
        <button
          className={`editable-title-edit-button ${editDisabled ? 'disabled' : ''}`}
          onClick={editDisabled ? undefined : handleStartEdit}
          aria-label={editDisabled ? "Cannot edit" : "Edit title"}
          disabled={editDisabled}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      )}
    </div>
  )
}
