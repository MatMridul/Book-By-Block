'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Clock, Shield, Zap, ArrowLeft } from 'lucide-react'
import PurchaseButton from '@/components/PurchaseButton'
import QRDemo from '@/components/QRDemo'

interface Event {
  eventId: number
  name: string
  description: string
  ticketContract: string
  basePrice: string
  totalSupply: number
  soldCount: number
  active: boolean
  creator: string
  createdAt: string
  venue: string
  date: string
  time: string
  image: string
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasedTicket, setPurchasedTicket] = useState<any>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`)
        if (!response.ok) {
          throw new Error('Event not found')
        }
        const eventData = await response.json()
        setEvent(eventData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading event details...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Event not found'}</div>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  const availableTickets = event.totalSupply - event.soldCount
  const soldPercentage = (event.soldCount / event.totalSupply) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-white hover:text-accent-mint mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Events
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            {/* Event Image */}
            <div className="w-full h-64 bg-gradient-to-br from-primary-purple to-accent-mint rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-2xl text-center px-4">{event.name}</span>
            </div>

            {/* Event Info */}
            <div className="bg-dark-surface rounded-lg p-6">
              <h1 className="text-3xl font-bold text-white mb-4">{event.name}</h1>
              <p className="text-dark-muted mb-6">{event.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-dark-muted">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-dark-muted">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-dark-muted">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center text-dark-muted">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{availableTickets} available</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-dark-muted mb-2">
                  <span>Tickets Sold</span>
                  <span>{event.soldCount} / {event.totalSupply}</span>
                </div>
                <div className="w-full bg-dark-bg rounded-full h-2">
                  <div 
                    className="bg-accent-mint h-2 rounded-full transition-all duration-300"
                    style={{ width: `${soldPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-dark-bg rounded-lg p-4">
                <div className="flex items-center text-accent-mint mb-2">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Smart Contract</span>
                </div>
                <p className="text-xs text-dark-muted font-mono break-all">
                  {event.ticketContract}
                </p>
              </div>
            </div>
          </div>

          {/* Purchase & Demo Section */}
          <div className="space-y-6">
            {/* Purchase Section */}
            <div className="bg-dark-surface rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Purchase Ticket</h2>
              <div className="mb-6">
                <div className="text-3xl font-bold text-accent-mint mb-2">
                  {event.basePrice} ETH
                </div>
                <p className="text-dark-muted">Base price per ticket</p>
              </div>

              <PurchaseButton
                eventId={event.eventId}
                eventName={event.name}
                price={event.basePrice}
                onPurchaseSuccess={(ticket) => setPurchasedTicket(ticket)}
              />

              {purchasedTicket && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg">
                  <p className="text-green-400 font-medium">Ticket Purchased Successfully!</p>
                  <p className="text-sm text-green-300">Ticket ID: {purchasedTicket.ticketId}</p>
                  <p className="text-xs text-green-300 font-mono break-all">
                    TX: {purchasedTicket.transactionHash}
                  </p>
                </div>
              )}
            </div>

            {/* QR Demo Section */}
            <div className="bg-dark-surface rounded-lg p-6">
              <div className="flex items-center text-accent-mint mb-4">
                <Zap className="w-5 h-5 mr-2" />
                <h2 className="text-xl font-bold text-white">Security Demo</h2>
              </div>
              
              <QRDemo 
                eventId={eventId} 
                ticketId={purchasedTicket?.ticketId || "12345"} 
              />
            </div>

            {/* Features */}
            <div className="bg-dark-surface rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Event Features</h3>
              <div className="space-y-3">
                <div className="flex items-center text-dark-muted">
                  <Shield className="w-4 h-4 mr-3 text-accent-mint" />
                  <span>Blockchain-verified tickets</span>
                </div>
                <div className="flex items-center text-dark-muted">
                  <Zap className="w-4 h-4 mr-3 text-accent-mint" />
                  <span>Dynamic QR codes (10s refresh)</span>
                </div>
                <div className="flex items-center text-dark-muted">
                  <Users className="w-4 h-4 mr-3 text-accent-mint" />
                  <span>Anti-fraud protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
