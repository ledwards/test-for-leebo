'use client'

import '../src/styles/backgrounds.css'
import Button from '../src/components/Button'

export default function Error({ reset }) {
  return (
    <div className="page-background" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Barlow, system-ui, sans-serif',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{
        position: 'relative',
        marginBottom: '2rem',
      }}>
        <img
          src="/errorpurrgil.png"
          alt="Error"
          style={{
            maxWidth: '600px',
            width: '100%',
            display: 'block',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(to bottom, rgb(9, 9, 9) 0%, transparent 15%),
            linear-gradient(to top, rgb(9, 9, 9) 0%, transparent 15%),
            linear-gradient(to right, rgb(9, 9, 9) 0%, transparent 15%),
            linear-gradient(to left, rgb(9, 9, 9) 0%, transparent 15%)
          `,
          pointerEvents: 'none',
        }} />
      </div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Something Went Wrong
      </h1>
      <p style={{ color: '#888', maxWidth: '400px', lineHeight: 1.6 }}>
        An unexpected error occurred. Please try again.
      </p>
      <Button
        variant="primary"
        size="lg"
        onClick={() => reset()}
        style={{ marginTop: '2rem' }}
      >
        Try Again
      </Button>
    </div>
  )
}
