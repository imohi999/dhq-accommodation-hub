import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import React from 'react'

export const metadata: Metadata = {
  title: 'DAP - DHQ Accommodation Platform',
  description: 'DHQ Accommodation Platform - Military Personnel Accommodation Management System',
  authors: [{ name: 'DHQ' }],
  icons: {
    icon: '/lovable-uploads/5fdd34e0-92c2-4d90-b14f-74d73614597d.png',
  },
  openGraph: {
    title: 'DAP - DHQ Accommodation Platform',
    description: 'DHQ Accommodation Platform - Military Personnel Accommodation Management System',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}