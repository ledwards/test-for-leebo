'use client'

import { AuthProvider } from '../src/contexts/AuthContext'
import AuthWidget from '../src/components/AuthWidget'
import '../src/index.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://protectthepod.com'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Primary Meta Tags */}
        <title>Protect the Pod - Star Wars Unlimited Limited Simulator</title>
        <meta name="title" content="Protect the Pod - Star Wars Unlimited Limited Simulator" />
        <meta name="description" content="The fan-made open source Star Wars Unlimited limited format simulator. Draft and build sealed pools with friends, then export to Karabast to play!" />
        <meta name="keywords" content="Star Wars Unlimited, SWU, draft, sealed, limited, simulator, Karabast, trading card game, TCG" />
        <meta name="author" content="Protect the Pod" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no" />
        <meta charSet="utf-8" />

        {/* Canonical URL */}
        <link rel="canonical" href={siteUrl} />

        {/* Open Graph / Facebook / Discord */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content="Protect the Pod - Star Wars Unlimited Limited Simulator" />
        <meta property="og:description" content="The fan-made open source Star Wars Unlimited limited format simulator. Draft and build sealed pools with friends, then export to Karabast to play!" />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Protect the Pod - Star Wars Unlimited Limited Simulator" />
        <meta property="og:site_name" content="Protect the Pod" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content="Protect the Pod - Star Wars Unlimited Limited Simulator" />
        <meta name="twitter:description" content="The fan-made open source Star Wars Unlimited limited format simulator. Draft and build sealed pools with friends, then export to Karabast to play!" />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:image:alt" content="Protect the Pod - Star Wars Unlimited Limited Simulator" />

        {/* Theme Color (affects browser UI and Discord embed color) */}
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="msapplication-TileColor" content="#1a1a2e" />

        {/* Apple-specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Protect the Pod" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;800&display=swap" rel="stylesheet" />

        {/* Favicons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <AuthProvider>
          <AuthWidget showOnlyWhenLoggedIn={true} />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
