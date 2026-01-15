// Reusable cost icon component
function CostIcon({ cost, size = 32 }) {
  if (cost === null || cost === undefined) return null

  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-flex', 
      alignItems: 'center',
      justifyContent: 'center',
      width: `${size}px`, 
      height: `${size}px` 
    }}>
      <img 
        src="/icons/cost.png" 
        alt="Cost" 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
      />
      <span style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: `${Math.round(size * 0.625)}px`, // 20px for 32px icon
        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1
      }}>
        {cost}
      </span>
    </div>
  )
}

export default CostIcon
