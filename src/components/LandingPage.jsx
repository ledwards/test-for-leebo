import './LandingPage.css'

function LandingPage({ onSealedClick }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Star Wars: Unlimited</h1>
        <h2>Sealed Pod Simulator</h2>
        <div className="mode-selection">
          <button className="mode-button sealed-button" onClick={onSealedClick}>
            Sealed
          </button>
          <button className="mode-button draft-button" disabled>
            Draft
            <span className="coming-soon">(Coming Soon)</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
