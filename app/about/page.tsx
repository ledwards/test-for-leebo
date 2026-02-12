// @ts-nocheck
'use client'

import About from '../../src/components/About'

export default function AboutPage() {
  const handleBack = () => {
    window.history.pushState({}, '', '/')
    window.location.href = '/'
  }

  return <About onBack={handleBack} />
}
