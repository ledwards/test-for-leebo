// @ts-nocheck
/**
 * GET /api/public/pack-quality - Public pack quality metrics
 *
 * Returns statistical validation that our pack generation matches
 * real-world collation rules. Designed for public transparency.
 *
 * Query params:
 *   - setCode: Set code (SOR, SHD, TWI, JTL, LOF, SEC, LAW)
 *   - all: If "true", returns summary for all sets
 */
import { jsonResponse, handleApiError } from '@/lib/utils'
import { getPackQualityData, getAvailableSets } from '@/src/services/packQualityService'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const setCode = url.searchParams.get('setCode')
    const all = url.searchParams.get('all') === 'true'

    // If requesting all sets summary
    if (all) {
      const sets = await getAvailableSets()
      return jsonResponse({
        sets,
        generatedAt: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      })
    }

    // If no set code provided, return available sets
    if (!setCode) {
      const sets = await getAvailableSets()
      return jsonResponse({
        message: 'Specify a setCode query parameter to get pack quality metrics',
        availableSets: sets,
        example: '/api/public/pack-quality?setCode=SOR',
      })
    }

    // Validate set code
    const validSets = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC', 'LAW']
    const normalizedSetCode = setCode.toUpperCase()
    if (!validSets.includes(normalizedSetCode)) {
      return jsonResponse({
        error: 'Invalid set code',
        validSets,
      }, { status: 400 })
    }

    // Get pack quality data
    const data = await getPackQualityData(normalizedSetCode)

    return jsonResponse(data, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    })
  } catch (error) {
    console.error('Error fetching pack quality data:', error)
    return handleApiError(error)
  }
}
