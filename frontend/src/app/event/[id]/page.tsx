'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, MapPin, Users, Shield, Zap } from 'lucide-react'
import { api } from '@/lib/api'

interface Event {
  eventId: string
  name: string
  ticketContract: string
  basePrice: string
  totalSupply: string
  soldCount: string
  active: boolean
  creator: string
}

export default function EventPage() {
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await api.getEvents()
        if (response.success) {
          const foundEvent = response.data?.find((e: Event) => e.eventId === eventId)
          setEvent(foundEvent || null)
        }
      } catch (error) {
        console.error('Failed to load event:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !walletAddress) return
    
    setPurchasing(true)
    try {
      const response = await api.buyTicket(eventId, walletAddress)
      setResult(response)
    } catch (error) {
      setResult({ success: false, error: 'Failed to purchase ticket' })
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#E6E6E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED] mx-auto mb-4"></div>
          <p>Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#E6E6E6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-400">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const availableTickets = parseInt(event.totalSupply) - parseInt(event.soldCount)
  const soldOut = availableTickets <= 0

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E6E6E6]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
          <div className="h-64 bg-gradient-to-r from-[#7C3AED] to-[#24E3C0] flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white text-center">{event.name}</h1>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Event Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="text-[#24E3C0]" size={20} />
                    <span>{event.soldCount} / {event.totalSupply} tickets sold</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Shield className="text-[#7C3AED]" size={20} />
                    <span>Anti-scalping protection enabled</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Zap className="text-[#24E3C0]" size={20} />
                    <span>Dynamic QR verification</span>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-[#0D0D0D] rounded-lg">
                  <h3 className="font-semibold mb-2">Contract Details</h3>
                  <p className="text-sm text-gray-400 break-all">{event.ticketContract}</p>
                </div>
              </div>
              
              <div>
                <div className="bg-[#0D0D0D] rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Purchase Ticket</h3>
                  
                  {result && (
                    <div className={`p-4 rounded-lg mb-4 ${result.success ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
                      {result.success ? (
                        <div>
                          <p className="text-green-400">Ticket purchased successfully!</p>
                          <p className="text-sm mt-2">Token ID: {result.data?.tokenId}</p>
                          <p className="text-sm">TX: {result.data?.transactionHash}</p>
                        </div>
                      ) : (
                        <p className="text-red-400">{result.error}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-[#7C3AED] mb-2">
                      {event.basePrice} MATIC
                    </div>
                    <p className="text-gray-400">Base price per ticket</p>
                  </div>
                  
                  {!soldOut ? (
                    <form onSubmit={handlePurchase} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Wallet Address
                        </label>
                        <input
                          type="text"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="0x7270c5186c95cfd847d3321d2e873d6a52e57d6e"
                          className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg px-3 py-2 text-sm"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Enter the wallet address to receive the NFT ticket
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={purchasing || !walletAddress}
                        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 py-3 rounded-lg font-semibold"
                      >
                        {purchasing ? 'Processing...' : 'Buy Ticket'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-red-400 font-semibold">SOLD OUT</p>
                      <p className="text-gray-400 text-sm mt-2">
                        All tickets have been sold
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-xs text-gray-400">
                    <p>• Max 2 resales per ticket</p>
                    <p>• 110% max resale price</p>
                    <p>• Blockchain verified ownership</p>
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
