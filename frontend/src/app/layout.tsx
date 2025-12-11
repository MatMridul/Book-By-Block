import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Web3Provider } from '@/components/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BookByBlock - Web3 Anti-Scalping Ticketing',
  description: 'Blockchain-powered NFT tickets with anti-scalping protection and dynamic QR verification',
  keywords: 'blockchain, NFT, tickets, web3, anti-scalping, polygon',
  authors: [{ name: 'BookByBlock Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#7C3AED',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-bg text-dark-text min-h-screen`}>
        <Web3Provider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-dark-card border-t border-dark-border py-8">
              <div className="container mx-auto px-4 text-center text-dark-muted">
                <p>&copy; 2024 BookByBlock. Disrupting ticketing with Web3 technology.</p>
                <p className="text-sm mt-2">Built on Polygon • Powered by blockchain • Secured by cryptography</p>
              </div>
            </footer>
          </div>
        </Web3Provider>
      </body>
    </html>
  )
}
