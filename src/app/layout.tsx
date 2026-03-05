import type { Metadata } from 'next'
import './globals.css'

import { Pixelify_Sans, Smooch_Sans } from 'next/font/google';

const pixelify = Pixelify_Sans({
  weight: "500",
  subsets: ['latin']
})


const smooch_sans = Smooch_Sans({
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
      <body className={`${smooch_sans.className} ${pixelify.className}`}>
        {children}
      </body>
    </html>
  )
}
