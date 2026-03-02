// @ts-nocheck
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/contexts/AuthContext'
import Button from '../../src/components/Button'
import '../formats/page.css'
import './casual.css'

const CARD_ART = {
  chaosDraft: 'https://cdn.starwarsunlimited.com//card_0202428_EN_The_Chaos_of_War_248678061a.png',
  chaosSealed: 'https://cdn.starwarsunlimited.com//card_0202428_EN_The_Chaos_of_War_248678061a.png',
  packWars: 'https://cdn.starwarsunlimited.com//card_06020444_EN_Let_s_Call_It_War_45a2c83395.png',
  packBlitz: 'https://cdn.starwarsunlimited.com//card_06020447_EN_Topple_the_Summit_d82f3cefcb.png',
  rotisserie: 'https://cdn.starwarsunlimited.com//card_SWH_01_493_AT_ST_HYP_ff73b562a5.png',
}

export default function CasualPage() {
  const router = useRouter()
  const { user } = useAuth()
  const hasBetaAccess = user?.is_beta_tester || user?.is_admin

  return (
    <div className="casual-page">
      <div className="casual-container">
        <div className="page-back-left">
          <Button variant="back" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>
        <h1>Casual Formats</h1>
        <p className="casual-subtitle">Alternative ways to play limited</p>

        <div className="casual-modes-grid">
          <button
            className="format-mode-card art-event glow-red"
            onClick={() => router.push('/casual/chaos-draft')}
          >
            <div
              className="format-mode-card-art"
              style={{ backgroundImage: `url("${CARD_ART.chaosDraft}")` }}
            />
            <div className="format-mode-card-content">
              <h3>Chaos Draft</h3>
              <p>Draft against bots with mixed sets</p>
            </div>
          </button>

          <button
            className="format-mode-card art-event glow-red"
            onClick={() => router.push('/formats/chaos-sealed')}
          >
            <div
              className="format-mode-card-art"
              style={{ backgroundImage: `url("${CARD_ART.chaosSealed}")` }}
            />
            <div className="format-mode-card-content">
              <h3>Chaos Sealed</h3>
              <p>6 packs from 6 different sets</p>
            </div>
          </button>

          {hasBetaAccess ? (
            <>
              <button
                className="format-mode-card art-event"
                onClick={() => router.push('/formats/pack-wars')}
              >
                <div
                  className="format-mode-card-art"
                  style={{ backgroundImage: `url("${CARD_ART.packWars}")` }}
                />
                <div className="format-mode-card-content">
                  <h3>Pack Wars</h3>
                  <p>Build a deck from 2 packs</p>
                </div>
              </button>

              <button
                className="format-mode-card art-event"
                onClick={() => router.push('/formats/pack-blitz')}
              >
                <div
                  className="format-mode-card-art"
                  style={{ backgroundImage: `url("${CARD_ART.packBlitz}")` }}
                />
                <div className="format-mode-card-content">
                  <h3>Pack Blitz</h3>
                  <p>Build a deck from 1 pack</p>
                </div>
              </button>

              <button
                className="format-mode-card art-unit glow-purple"
                onClick={() => router.push('/formats/rotisserie')}
              >
                <div
                  className="format-mode-card-art"
                  style={{ backgroundImage: `url("${CARD_ART.rotisserie}")` }}
                />
                <div className="format-mode-card-content">
                  <h3>Rotisserie</h3>
                  <p>Snake draft from full set</p>
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                className="format-mode-card art-event beta-locked"
                disabled
              >
                <div
                  className="format-mode-card-art"
                  style={{ backgroundImage: `url("${CARD_ART.packWars}")` }}
                />
                <div className="format-mode-card-content">
                  <h3>Pack Wars</h3>
                  <p>Build a deck from 2 packs</p>
                </div>
                <span className="beta-badge-overlay">Beta</span>
              </button>

              <button
                className="format-mode-card art-event beta-locked"
                disabled
              >
                <div
                  className="format-mode-card-art"
                  style={{ backgroundImage: `url("${CARD_ART.packBlitz}")` }}
                />
                <div className="format-mode-card-content">
                  <h3>Pack Blitz</h3>
                  <p>Build a deck from 1 pack</p>
                </div>
                <span className="beta-badge-overlay">Beta</span>
              </button>

              <button
                className="format-mode-card art-unit glow-purple beta-locked"
                disabled
              >
                <div
                  className="format-mode-card-art"
                  style={{ backgroundImage: `url("${CARD_ART.rotisserie}")` }}
                />
                <div className="format-mode-card-content">
                  <h3>Rotisserie</h3>
                  <p>Snake draft from full set</p>
                </div>
                <span className="beta-badge-overlay">Beta</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
