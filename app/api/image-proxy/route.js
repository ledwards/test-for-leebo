// Image proxy to bypass CORS for deck image generation
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  // Only allow proxying from trusted image domains
  const allowedDomains = ['cdn.swu-db.com', 'swudb.com']
  try {
    const url = new URL(imageUrl)
    if (!allowedDomains.some(domain => url.hostname.endsWith(domain))) {
      return new Response('Domain not allowed', { status: 403 })
    }
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status })
    }

    const blob = await response.blob()
    return new Response(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response('Failed to fetch image', { status: 500 })
  }
}
