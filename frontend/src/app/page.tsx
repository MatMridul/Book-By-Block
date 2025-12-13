'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Zap, Shield, Coins, QrCode } from 'lucide-react'
import { api } from '@/lib/api'

interface Event {
  eventId: number
  name: string
  ticketContract: string
  basePrice: string
  totalSupply: number
  soldCount: number
  active: boolean
  creator: string
  createdAt: string
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true)
        setError(null)
        const response = await api.getEvents()
        if (response.success) {
          setEvents(response.data || [])
        } else {
          setError('Failed to load events')
        }
      } catch (error) {
        console.error('Failed to load events:', error)
        setError('Failed to connect to server')
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-purple via-primary-purple-dark to-accent-mint py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            The Future of
            <span className="block bg-gradient-to-r from-accent-mint to-white bg-clip-text text-transparent">
              Ticketing
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Blockchain-powered NFT tickets with anti-scalping protection, 
            dynamic QR verification, and transparent ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Explore Events
            </button>
            <Link href="/admin" className="btn-secondary text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
              Admin Dashboard
            </Link>
            <a 
              href={process.env.NEXT_PUBLIC_SCANNER_URL || 'https://scanner.bookbyblock.com'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-8 py-4 bg-accent-mint/20 border-accent-mint/30 text-accent-mint hover:bg-accent-mint/30 flex items-center justify-center space-x-2"
            >
              <QrCode className="w-5 h-5" />
              <span>Scanner App</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-dark-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why BookByBlock?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Shield className="w-12 h-12 text-primary-purple mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Anti-Scalping Protection</h3>
              <p className="text-dark-muted">Smart contracts enforce maximum resale prices and limit transfers</p>
            </div>
            <div className="card text-center">
              <Zap className="w-12 h-12 text-accent-mint mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dynamic QR Codes</h3>
              <p className="text-dark-muted">Anti-screenshot QR codes that refresh every 10 seconds</p>
            </div>
            <div className="card text-center">
              <Coins className="w-12 h-12 text-accent-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Low-Cost Transactions</h3>
              <p className="text-dark-muted">Built on Polygon for fast, cheap, and eco-friendly transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Live Events</h2>
            <Link href="/admin" className="btn-secondary">
              Create Event
            </Link>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card">
                  <div className="w-full h-48 bg-dark-border rounded-lg shimmer mb-4"></div>
                  <div className="h-6 bg-dark-border rounded shimmer mb-2"></div>
                  <div className="h-4 bg-dark-border rounded shimmer mb-4 w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-dark-border rounded shimmer w-1/3"></div>
                    <div className="h-4 bg-dark-border rounded shimmer w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-dark-border rounded-full mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-dark-muted" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-dark-muted mb-6">Be the first to create an event on BookByBlock!</p>
              <Link href="/admin" className="btn-primary">
                Create First Event
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.eventId} href={`/event/${event.eventId}`}>
                  <div className="card card-hover">
                    <div className="w-full h-48 bg-gradient-to-br from-primary-purple to-accent-mint rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">{event.name}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <p className="text-dark-muted mb-4">Contract: {event.ticketContract.slice(0, 10)}...</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-dark-muted">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-dark-muted">
                        <MapPin className="w-4 h-4 mr-2" />
                        Blockchain Event
                      </div>
                      <div className="flex items-center text-sm text-dark-muted">
                        <Users className="w-4 h-4 mr-2" />
                        {event.soldCount}/{event.totalSupply} sold
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-purple">
                        {event.basePrice} MATIC
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        event.active ? 'bg-accent-success/20 text-accent-success' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {event.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
