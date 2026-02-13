// @ts-nocheck
'use client'

import { useAuth } from '@/src/contexts/AuthContext'
import { notFound } from 'next/navigation'

export default function CasualLayout({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  const hasBetaAccess = user?.is_beta_tester || user?.is_admin
  if (!hasBetaAccess) notFound()

  return children
}
