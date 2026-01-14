import React from 'react'

// Utility to parse card text and replace aspect symbols and styled numbers

/**
 * Get SVG symbol for an aspect
 */
function getAspectSymbol(aspect) {
  const symbols = {
    'Command': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="16" height="16">
        <circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3.5" fill="#2E7D32"/>
        <path d="M12 3 L12 7 M12 17 L12 21 M3 12 L7 12 M17 12 L21 12" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 8 L10 10 M14 10 L16 8 M8 16 L10 14 M14 14 L16 16" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'Villainy': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="16" height="16">
        <path d="M12 3 L9 9 L12 15 L15 9 Z" fill="#1a1a1a" stroke="#000" strokeWidth="1.5"/>
        <path d="M9 9 L15 9 M9 13 L15 13" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
        <rect x="10" y="13" width="4" height="3" fill="#000" stroke="#000" strokeWidth="1"/>
        <path d="M8 18 L10 20 L12 18 L14 20 L16 18" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'Heroism': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="16" height="16">
        <path d="M12 3 L9 10 L12 17 L15 10 Z" fill="#fff" stroke="#ddd" strokeWidth="1.5"/>
        <circle cx="12" cy="10" r="3.5" fill="#ddd" stroke="#bbb" strokeWidth="1"/>
        <path d="M12 7 L12 13" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'Cunning': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="16" height="16">
        <circle cx="12" cy="12" r="9" fill="#FFC107" stroke="#F57C00" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="#F57C00"/>
        <path d="M5 12 Q12 5 19 12 Q12 19 5 12" fill="none" stroke="#F57C00" strokeWidth="2"/>
        <path d="M8 8 Q12 4 16 8 M8 16 Q12 20 16 16" fill="none" stroke="#F57C00" strokeWidth="1.5"/>
      </svg>
    ),
    'Vigilance': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="16" height="16">
        <path d="M7 9 Q12 4 17 9" fill="#2196F3" stroke="#1565C0" strokeWidth="1.5"/>
        <path d="M7 15 Q12 20 17 15" fill="#2196F3" stroke="#1565C0" strokeWidth="1.5"/>
        <circle cx="10" cy="12" r="2.5" fill="#1565C0"/>
        <circle cx="14" cy="12" r="2.5" fill="#1565C0"/>
      </svg>
    ),
    'Aggression': (
      <svg className="aspect-symbol" viewBox="0 0 24 24" width="16" height="16">
        <circle cx="12" cy="12" r="10" fill="#F44336" stroke="#C62828" strokeWidth="1.5"/>
        <path d="M12 3 L13.5 8 L12 6 L10.5 8 Z M12 21 L13.5 16 L12 18 L10.5 16 Z M3 12 L8 10.5 L6 12 L8 13.5 Z M21 12 L16 10.5 L18 12 L16 13.5 Z" fill="#C62828"/>
        <circle cx="12" cy="12" r="2" fill="#C62828"/>
      </svg>
    ),
  }
  return symbols[aspect] || null
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
