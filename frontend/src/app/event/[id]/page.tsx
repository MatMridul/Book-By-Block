'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, MapPin, Users, Clock, Shield, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EventDetails {
  id: string
  name: string
  description: string
  longDescription: string
  date: string
  venue: string
  price: string
  totalSupply: string
  soldCount: string
  category: string
  organizer: string
  features: string[]
}

export default function EventPage() {
  const params = useParams()
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  useEffect(() => {
    // Mock event data
    setTimeout(() => {
      setEvent({
        id: params.id as string,
        name: 'Blockchain Summit 2024',
        description: 'The future of decentralized technology',
        longDescription: 'Join industry leaders, developers, and innovators for the most comprehensive blockchain conference of the year. Explore the latest in DeFi, NFTs, Web3, and enterprise blockchain solutions.',
        date: '2024-01-15T10:00:00Z',
        venue: 'Tech Convention Center, San Francisco',
        price: '0.05',
        totalSupply: '500',
        soldCount: '342',
        category: 'Conference',
        organizer: 'Blockchain Foundation',
        features: ['Anti-scalping protection', 'Dynamic QR verification', 'Resale controls', 'Blockchain ownership']
      })
      setLoading(false)
    }, 1000)
  }, [params.id])

  const handlePurchase = async () => {
    if (!walletAddress) {
      alert('Please enter your wallet address')
      return
    }

    setPurchasing(true)
    
    try {
      // Mock purchase API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event?.id,
          buyerAddress: walletAddress
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Ticket purchased! Token ID: ${result.data.tokenId}`)
        // Redirect to ticket page
        window.location.href = `/ticket/${result.data.ticketContract}/${result.data.tokenId}`
      } else {
        throw new Error('Purchase failed')
      }
    } catch (error) {
      alert('Purchase failed. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-dark-border rounded shimmer mb-8 w-1/4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="w-full h-64 bg-dark-border rounded-xl shimmer mb-6"></div>
                <div className="h-8 bg-dark-border rounded shimmer mb-4"></div>
                <div className="h-4 bg-dark-border rounded shimmer mb-2 w-3/4"></div>
                <div className="h-4 bg-dark-border rounded shimmer mb-6 w-1/2"></div>
              </div>
              <div className="card">
                <div className="h-32 bg-dark-border rounded shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Link href="/" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const soldPercentage = (parseInt(event.soldCount) / parseInt(event.totalSupply)) * 100

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/" className="flex items-center text-dark-muted hover:text-primary-purple mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-2">
              {/* Event Image */}
              <div className="w-full h-64 bg-gradient-to-br from-primary-purple to-accent-mint rounded-xl mb-6 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2">{event.category}</div>
                  <div className="text-lg opacity-90">{event.name}</div>
                </div>
              </div>

              {/* Event Info */}
              <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
              <p className="text-xl text-dark-muted mb-6">{event.description}</p>

              {/* Event Details Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-primary-purple mr-3" />
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div className="text-dark-muted">{new Date(event.date).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary-purple mr-3" />
                  <div>
                    <div className="font-medium">Venue</div>
                    <div className="text-dark-muted">{event.venue}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-primary-purple mr-3" />
                  <div>
                    <div className="font-medium">Capacity</div>
                    <div className="text-dark-muted">{event.totalSupply} tickets</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary-purple mr-3" />
                  <div>
                    <div className="font-medium">Organizer</div>
                    <div className="text-dark-muted">{event.organizer}</div>
                  </div>
                </div>
              </div>

              {/* Long Description */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">About This Event</h3>
                <p className="text-dark-muted leading-relaxed">{event.longDescription}</p>
              </div>

              {/* Features */}
              <div className="card mt-6">
                <h3 className="text-xl font-semibold mb-4">Web3 Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {event.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Shield className="w-4 h-4 text-accent-success mr-2" />
                      <span className="text-dark-muted">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-purple mb-2">
                    {event.price} ETH
                  </div>
                  <div className="text-dark-muted">per ticket</div>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sold</span>
                    <span>{event.soldCount}/{event.totalSupply}</span>
                  </div>
                  <div className="w-full bg-dark-border rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-purple to-accent-mint h-2 rounded-full transition-all duration-300"
                      style={{ width: `${soldPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-dark-muted mt-2">
                    {Math.round(soldPercentage)}% sold
                  </div>
                </div>

                {/* Wallet Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="input w-full"
                  />
                  <div className="text-xs text-dark-muted mt-1">
                    Ticket will be minted to this address
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || soldPercentage >= 100}
                  className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 ${
                    soldPercentage >= 100
                      ? 'bg-dark-border text-dark-muted cursor-not-allowed'
                      : purchasing
                      ? 'bg-primary-purple-dark text-white cursor-wait'
                      : 'btn-primary'
                  }`}
                >
                  {soldPercentage >= 100 
                    ? 'Sold Out' 
                    : purchasing 
                    ? 'Processing...' 
                    : 'Buy Ticket'
                  }
                </button>

                {/* Security Features */}
                <div className="mt-6 pt-6 border-t border-dark-border">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Zap className="w-4 h-4 text-accent-mint mr-2" />
                    Security Features
                  </h4>
                  <div className="space-y-2 text-sm text-dark-muted">
                    <div>✓ Blockchain ownership verification</div>
                    <div>✓ Anti-scalping price controls</div>
                    <div>✓ Dynamic QR code protection</div>
                    <div>✓ Immutable transaction history</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
