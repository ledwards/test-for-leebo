'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import './LogoHeader.css'

export default function LogoHeader({ className = '' }) {
  const router = useRouter()
  const pathname = usePathname()
  const [subtitleOpacity, setSubtitleOpacity] = useState(1)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Fade from 1 to 0 over 50px of scroll
      const opacity = Math.max(0, 1 - scrollY / 50)
      setSubtitleOpacity(opacity)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Set initial opacity based on current scroll position
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't show on homepage
  if (pathname === '/') {
    return null
  }

  const handleClick = (e) => {
    e.preventDefault()
    router.push('/')
  }

  return (
    <div className={`logo-header ${className}`}>
      <a href="/" onClick={handleClick} className="logo-header-link">
        <img src="/ptp_logotype.png" alt="Protect the Pod" className="logo-header-image" />
      </a>
      <span
        className="logo-header-subtitle"
        style={{ opacity: subtitleOpacity }}
      >
        The Fan-Made Vibe Coded<br />
        Star Wars Unlimited Limited Simulator
      </span>
    </div>
  )
}
