'use client'

import { useRouter, usePathname } from 'next/navigation'
import './LogoHeader.css'

export default function LogoHeader({ className = '' }) {
  const router = useRouter()
  const pathname = usePathname()

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
        <img src="/ptp_logo400.png" alt="Protect the Pod" className="logo-header-image" />
      </a>
    </div>
  )
}
