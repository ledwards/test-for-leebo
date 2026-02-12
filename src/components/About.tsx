// @ts-nocheck
import './About.css'

export interface AboutProps {
  onBack?: () => void
}

function About({ onBack }: AboutProps) {
  return (
    <div className="about-page">
      <div className="about-content">
        <section className="support-section">
          <a
            href="https://patreon.com/ProtectthePod"
            target="_blank"
            rel="noopener noreferrer"
            className="patreon-logo-link"
          >
            <img
              src="/patreon/friendofthepod.png"
              alt="Friends of the Pod - Patreon"
              className="patreon-logo"
            />
          </a>
          <h2>Support the Pod</h2>
          <p>
            Protect the Pod is free to use and <a href="https://github.com/ledwards/swupod" target="_blank" rel="noopener noreferrer" className="about-link">Open Source</a>.
            If you enjoy online SWU limited and want to help keep us running,
            consider becoming a <strong>Friend of the Pod</strong> on Patreon to get a role in the Discord
            and help cover hosting and development costs.
          </p>
          <a
            href="https://patreon.com/ProtectthePod"
            target="_blank"
            rel="noopener noreferrer"
            className="patreon-cta"
          >
            Become a Friend of the Pod
          </a>
        </section>

        <section className="teammates-section">
          <h2>Thanks to My Teammates</h2>
          <div className="teammate-logos">
            <a href="https://norcalswu.com" target="_blank" rel="noopener noreferrer" className="teammate-link">
              <img src="/about/NorCalSWU.png" alt="NorCal SWU" className="teammate-logo" />
            </a>
            <a href="https://bbbbbbasketball.net" target="_blank" rel="noopener noreferrer" className="teammate-link">
              <img src="/about/dd.png" alt="Dodonna's Disciples" className="teammate-logo" />
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
