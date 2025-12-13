'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Clock, Shield, Zap, ArrowLeft, Wallet } from 'lucide-react'
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

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<any>(null)

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true)
        setError(null)
        const response = await api.getEvent(eventId)
        if (response.success) {
          setEvent(response.data)
        } else {
          setError('Event not found')
        }
      } catch (error) {
        console.error('Failed to load event:', error)
        setError('Failed to load event details')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const handleBuyTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress || !event) return

    setBuying(true)
    try {
      const response = await api.buyTicket(eventId, walletAddress)
      setPurchaseResult(response)
      if (response.success) {
        setShowBuyModal(false)
        setWalletAddress('')
        // Refresh event data
        const eventResponse = await api.getEvent(eventId)
        if (eventResponse.success) {
          setEvent(eventResponse.data)
        }
      }
    } catch (error) {
      setPurchaseResult({ success: false, error: 'Failed to purchase ticket' })
    } finally {
      setBuying(false)
    }
  }

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setWalletAddress(accounts[0])
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
      alert('Please install MetaMask to connect your wallet')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-dark-border rounded shimmer mb-8 w-32"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-dark-border rounded-lg shimmer"></div>
              <div className="space-y-4">
                <div className="h-8 bg-dark-border rounded shimmer"></div>
                <div className="h-4 bg-dark-border rounded shimmer w-3/4"></div>
                <div className="h-20 bg-dark-border rounded shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <button
              onClick={() => router.back()}
              className="btn-secondary mb-8 inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="card">
              <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
              <p className="text-dark-muted">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const availableTickets = event.totalSupply - event.soldCount
  const soldPercentage = (event.soldCount / event.totalSupply) * 100

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="btn-secondary mb-8 inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </button>

          {/* Purchase Result */}
          {purchaseResult && (
            <div className={`p-4 rounded-lg mb-6 ${purchaseResult.success ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
              {purchaseResult.success ? (
                <div>
                  <p className="text-green-400">Ticket purchased successfully!</p>
                  <p className="text-sm mt-2">Token ID: {purchaseResult.data?.tokenId}</p>
                  <p className="text-sm">Contract: {purchaseResult.data?.ticketContract}</p>
                  <p className="text-sm">TX: {purchaseResult.data?.transactionHash}</p>
                </div>
              ) : (
                <p className="text-red-400">{purchaseResult.error}</p>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Event Image */}
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-primary-purple to-accent-mint rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-2">{event.name}</h2>
                  <p className="text-lg opacity-90">NFT Event Ticket</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                event.active ? 'bg-accent-success text-white' : 'bg-red-500 text-white'
              }`}>
                {event.active ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
                <p className="text-dark-muted text-lg">
                  Blockchain-powered NFT ticket with anti-scalping protection and dynamic QR verification.
                </p>
              </div>

              {/* Event Info */}
              <div className="space-y-4">
                <div className="flex items-center text-dark-muted">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>Created: {new Date(event.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-dark-muted">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>Contract: {event.ticketContract}</span>
                </div>
                <div className="flex items-center text-dark-muted">
                  <Users className="w-5 h-5 mr-3" />
                  <span>{event.soldCount} of {event.totalSupply} tickets sold</span>
                </div>
                <div className="flex items-center text-dark-muted">
                  <Wallet className="w-5 h-5 mr-3" />
                  <span>Creator: {event.creator.slice(0, 10)}...{event.creator.slice(-8)}</span>
                </div>
              </div>

              {/* Availability Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Availability</span>
                  <span>{availableTickets} remaining</span>
                </div>
                <div className="w-full bg-dark-border rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-accent-success to-accent-mint h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(100 - soldPercentage, 5)}%` }}
                  ></div>
                </div>
              </div>

              {/* Price and Buy Button */}
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-primary-purple">{event.basePrice} MATIC</div>
                    <div className="text-dark-muted">Per ticket</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{soldPercentage.toFixed(1)}%</div>
                    <div className="text-dark-muted">Sold</div>
                  </div>
                </div>

                {event.active && availableTickets > 0 ? (
                  <button
                    onClick={() => setShowBuyModal(true)}
                    className="btn-primary w-full text-lg py-3"
                  >
                    Buy Ticket
                  </button>
                ) : (
                  <button disabled className="btn-secondary w-full text-lg py-3 opacity-50 cursor-not-allowed">
                    {!event.active ? 'Event Inactive' : 'Sold Out'}
                  </button>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-dark-card rounded-lg">
                  <Shield className="w-8 h-8 text-primary-purple mx-auto mb-2" />
                  <div className="font-medium">Anti-Scalping</div>
                  <div className="text-sm text-dark-muted">Protected resale</div>
                </div>
                <div className="text-center p-4 bg-dark-card rounded-lg">
                  <Zap className="w-8 h-8 text-accent-mint mx-auto mb-2" />
                  <div className="font-medium">Dynamic QR</div>
                  <div className="text-sm text-dark-muted">Secure verification</div>
                </div>
              </div>
            </div>
          </div>

          {/* Buy Ticket Modal */}
          {showBuyModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Buy Ticket</h2>
                
                <form onSubmit={handleBuyTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Wallet Address</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="input flex-1"
                        placeholder="0x..."
                      />
                      <button
                        type="button"
                        onClick={connectWallet}
                        className="btn-secondary px-4"
                      >
                        Connect
                      </button>
                    </div>
                  </div>

                  <div className="bg-dark-bg p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Price:</span>
                      <span className="font-semibold">{event.basePrice} MATIC</span>
                    </div>
                    <div className="flex justify-between text-sm text-dark-muted">
                      <span>Gas fees:</span>
                      <span>~0.001 MATIC</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBuyModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={buying || !walletAddress}
                      className="btn-primary flex-1"
                    >
                      {buying ? 'Purchasing...' : 'Buy Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
