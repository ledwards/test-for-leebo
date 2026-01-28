export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a2e',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Scheduled Maintenance
      </h1>
      <p style={{ color: '#888', maxWidth: '400px', lineHeight: 1.6 }}>
        We&apos;re upgrading our servers for better performance.
        Be back in a few minutes!
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        background: '#2a2a4e',
        borderRadius: '8px'
      }}>
        Improving real-time draft experience
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Maintenance - Protect the Pod',
}
