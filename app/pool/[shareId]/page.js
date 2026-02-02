'use client'

import { useEffect, useState } from 'react'
import { loadPool } from '../../../src/utils/poolApi'
import '../../../src/App.css'

export default function PoolRedirectPage({ params }) {
  const [shareId, setShareId] = useState(null)

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setShareId(resolvedParams.shareId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!shareId) return

    let retries = 0
    const maxRetries = 5

    const attemptLoad = async () => {
      try {
        const poolData = await loadPool(shareId)

        // Redirect based on pool type
        if (poolData.poolType === 'draft') {
          window.location.href = `/draft_pool/${shareId}`
        } else {
          window.location.href = `/sealed_pool/${shareId}`
        }
      } catch (err) {
        console.error(`Failed to load pool (attempt ${retries + 1}):`, err)

        if ((err.message.includes('not found') || err.message.includes('Pool not found')) && retries < maxRetries) {
          retries++
          await new Promise(resolve => setTimeout(resolve, 1000 * retries))
          return attemptLoad()
        }

        // If we can't determine the type, default to sealed
        window.location.href = `/sealed_pool/${shareId}`
      }
    }

    attemptLoad()
  }, [shareId])

  return (
    <div className="app">
      <div className="loading"></div>
    </div>
  )
}
