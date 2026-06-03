import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'SICE - Sistema de Información de Convivencia Escolar',
  description: 'Sistema para registro y gestión de casos de convivencia escolar provenientes de SAC y SIUCE',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        
        {/* Toaster de forma global */}
        <Toaster position="top-right" reverseOrder={false} />
        
      </body>
    </html>
  )
}