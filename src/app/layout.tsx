import type { Metadata } from 'next'
import { Lato, Geist_Mono } from 'next/font/google'
import './globals.css'
import AppProviders from '@/providers/AppProviders'

const geistSans = Lato({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Hệ thống đánh giá',
  description: 'Hệ thống đánh giá trực tuyến',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
