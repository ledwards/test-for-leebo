'use client'

import { AuthProvider } from '../src/contexts/AuthContext'
import AuthWidget from '../src/components/AuthWidget'
import LogoHeader from '../src/components/LogoHeader'
import '../src/index.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Protect the Pod</title>
        <meta name="description" content="The Fan-Made Open Source Star Wars Unlimited Limited Simulator" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;800&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <AuthProvider>
          <LogoHeader />
          <AuthWidget showOnlyWhenLoggedIn={true} />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
