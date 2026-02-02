import React from 'react'
import '../components/AspectIcons.css'

// Utility to parse card text and replace aspect symbols and styled numbers

/**
 * Get CSS-based icon for an aspect using the sprite sheet
 */
function getAspectSymbol(aspect, size = 'small') {
  const aspectMap = {
    'Command': 'command',
    'Villainy': 'villainy',
    'Heroism': 'heroism',
    'Cunning': 'cunning',
    'Vigilance': 'vigilance',
    'Aggression': 'aggression'
  }
  
  const aspectClass = aspectMap[aspect]
  if (!aspectClass) return null
  
  const sizeClass = size === 'small' ? 'aspect-icon-small' : size === 'large' ? 'aspect-icon-large' : 'aspect-icon-medium'
  
  return (
    <span className={`aspect-icon aspect-icon-${aspectClass} ${sizeClass}`} aria-label={aspect} />
  )
}

/**
 * Parse text and replace patterns like [C=4 Command Villainy] with symbols
 * Handles newlines by splitting text and processing each line
 */
export function parseCardText(text) {
  if (!text) return null

  // Split by newlines to preserve line breaks
  const lines = text.split('\n')
  const result = []

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      result.push(<br key={`br-${lineIndex}`} />)
    }

    const parts = []
    let lastIndex = 0
    
    // Match patterns like [C=4 Command Villainy] or [C=3 Cunning] or [C=4]
    const pattern = /\[C=(\d+)(?:\s+([A-Za-z\s]+))?\]/g
    let match

    while ((match = pattern.exec(line)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const textBefore = line.substring(lastIndex, match.index)
        if (textBefore) {
          parts.push(textBefore)
        }
      }

      const number = match[1]
      const aspects = match[2] ? match[2].trim().split(/\s+/) : []

      // Add opening bracket
      parts.push('[')

      // Add styled number
      parts.push(
        <span key={`num-${lineIndex}-${match.index}`} className="resource-number">
          {number}
        </span>
      )

      // Add aspect symbols
      if (aspects.length > 0) {
        aspects.forEach((aspect, idx) => {
          const symbol = getAspectSymbol(aspect)
          if (symbol) {
            parts.push(
              <span key={`aspect-${lineIndex}-${match.index}-${idx}`} className="aspect-symbol-wrapper">
                {symbol}
              </span>
            )
          }
          // Add space between aspects except for the last one
          if (idx < aspects.length - 1) {
            parts.push(' ')
          }
        })
      }

      // Add closing bracket
      parts.push(']')

      lastIndex = pattern.lastIndex
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex))
    }

    // If no matches, add the whole line
    if (parts.length === 0) {
      parts.push(line)
    }

    result.push(...parts)
  })

  return result.length > 0 ? result : text
}
