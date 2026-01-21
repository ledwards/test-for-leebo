'use client'

import './PassDirectionArrow.css'

function PassDirectionArrow({ direction }) {
  return (
    <div className={`pass-direction-arrow ${direction}`}>
      <div className="arrow-circle">
        <span className="arrow-symbol">
          {direction === 'left' ? '←' : '→'}
        </span>
      </div>
      <div className="arrow-label">
        Passing {direction}
      </div>
    </div>
  )
}

export default PassDirectionArrow
