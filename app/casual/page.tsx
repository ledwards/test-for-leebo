// @ts-nocheck
'use client'

import { useRouter } from 'next/navigation'
import './page.css'

interface CasualMode {
  id: string
  name: string
  description: string
  comingSoon: boolean
}

const CASUAL_MODES: CasualMode[] = [
  {
    id: 'chaos-draft',
    name: 'Chaos Draft',
    description: 'Draft with packs from 3 different sets',
    comingSoon: false,
  },
  {
    id: 'chaos-sealed',
    name: 'Chaos Sealed',
    description: 'Open 6 packs from 6 different sets',
    comingSoon: false,
  },
  {
    id: 'rotisserie',
    name: 'Rotisserie Draft',
    description: 'Snake draft from entire card pool, face-up',
    comingSoon: false,
  },
  {
    id: 'pack-wars',
    name: 'Pack Wars',
    description: 'Build deck from 2 packs',
    comingSoon: false,
  },
  {
    id: 'pack-blitz',
    name: 'Pack Blitz',
    description: 'Build deck from 1 pack',
    comingSoon: false,
  },
]

export default function CasualModePage() {
  const router = useRouter()

  const handleModeSelect = (mode: CasualMode) => {
    if (mode.comingSoon) {
      return // Don't navigate if coming soon
    }
    router.push(`/casual/${mode.id}`)
  }

  return (
    <div className="casual-page">
      <div className="casual-container">
        <h1>Casual Formats</h1>
        <p className="casual-subtitle">Alternative limited formats for casual play</p>

        <div className="casual-modes-grid">
          {CASUAL_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`casual-mode-card ${mode.comingSoon ? 'coming-soon' : ''}`}
              onClick={() => handleModeSelect(mode)}
              disabled={mode.comingSoon}
            >
              <h3>{mode.name}</h3>
              <p>{mode.description}</p>
              {mode.comingSoon && (
                <span className="coming-soon-badge">Coming Soon</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
