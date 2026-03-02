// @ts-nocheck
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initializeCardCache } from '../../src/utils/cardCache'
import SetSelection from '../../src/components/SetSelection'
import '../../src/App.css'

export default function SoloSealedPage() {
  const router = useRouter()

  useEffect(() => {
    initializeCardCache().catch((error) => {
      console.error('Failed to load cards:', error)
    })
  }, [])

  const handleSetSelect = (setCode: string) => {
    window.location.href = `/pools/new?set=${setCode}`
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="app">
      <SetSelection onSetSelect={handleSetSelect} onBack={handleBack} title="Solo Sealed" />
    </div>
  )
}
