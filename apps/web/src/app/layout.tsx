import type { Metadata } from 'next'
import './globals.css'

import { AuthWrapper } from '@/components/layout/AuthWrapper'

export const metadata: Metadata = {
  title: 'ISMS Flow — ISO 27001 Implementation Portal',
  description:
    'Implement ISO/IEC 27001:2022 end-to-end without consultants. Complete ISMS implementation, audit preparation, and continual improvement platform.',
  keywords: 'ISO 27001, ISMS, Information Security, Compliance, Audit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  )
}
