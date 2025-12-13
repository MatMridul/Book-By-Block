'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Ticket, Wallet, User, QrCode } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-dark-card border-b border-dark-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-purple to-accent-mint rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary-purple to-accent-mint bg-clip-text text-transparent">
              BookByBlock
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-primary-purple transition-colors">
              Events
            </Link>
            <Link href="/my-tickets" className="hover:text-primary-purple transition-colors">
              My Tickets
            </Link>
            <Link href="/admin" className="hover:text-primary-purple transition-colors">
              Admin
            </Link>
            <a 
              href={process.env.NEXT_PUBLIC_SCANNER_URL || 'https://scanner.bookbyblock.com'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:text-accent-mint transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Scanner</span>
            </a>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="btn-secondary flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-dark-border transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-dark-border">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="hover:text-primary-purple transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              <Link 
                href="/my-tickets" 
                className="hover:text-primary-purple transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Tickets
              </Link>
              <Link 
                href="/admin" 
                className="hover:text-primary-purple transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
              <a 
                href={process.env.NEXT_PUBLIC_SCANNER_URL || 'https://scanner.bookbyblock.com'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-accent-mint transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <QrCode className="w-4 h-4" />
                <span>Scanner App</span>
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-dark-border">
                <button className="btn-secondary flex items-center justify-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
                <button className="btn-primary flex items-center justify-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
