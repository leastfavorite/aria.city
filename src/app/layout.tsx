import type { Metadata } from 'next'
import './globals.css'

import { Pixelify_Sans, DM_Sans } from 'next/font/google';

const pixelify = Pixelify_Sans({
  weight: "500",
  subsets: ['latin']
})

const dm_sans = DM_Sans({
  weight: 'variable'
})

export const metadata: Metadata = {
  title: 'aria city',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dm_sans.className}`}>
        {children}
      </body>
    </html>
  )
}
