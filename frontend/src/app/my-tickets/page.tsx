'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Ticket, Calendar, MapPin, QrCode, ExternalLink } from 'lucide-react'

interface UserTicket {
  tokenId: string
  ticketContract: string
  eventName: string
  eventDate: string
  venue: string
  price: string
  status: 'valid' | 'used' | 'expired'
  resales: number
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState('')

  useEffect(() => {
    // Mock tickets data
    setTimeout(() => {
      setTickets([
        {
          tokenId: '1',
          ticketContract: '0x1234...5678',
          eventName: 'Blockchain Summit 2024',
          eventDate: '2024-01-15T10:00:00Z',
          venue: 'Tech Convention Center',
          price: '0.05',
          status: 'valid',
          resales: 0
        },
        {
          tokenId: '2',
          ticketContract: '0x8765...4321',
          eventName: 'Web3 Music Festival',
          eventDate: '2024-01-20T18:00:00Z',
          venue: 'Digital Arena',
          price: '0.08',
          status: 'valid',
          resales: 1
        },
        {
          tokenId: '3',
          ticketContract: '0xabcd...efgh',
          eventName: 'DeFi Workshop',
          eventDate: '2023-12-10T14:00:00Z',
          venue: 'Innovation Hub',
          price: '0.03',
          status: 'used',
          resales: 0
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-accent-success bg-accent-success/20 border-accent-success/30'
      case 'used': return 'text-dark-muted bg-dark-border/20 border-dark-border'
      case 'expired': return 'text-accent-error bg-accent-error/20 border-accent-error/30'
      default: return 'text-dark-muted bg-dark-border/20 border-dark-border'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'Valid'
      case 'used': return 'Used'
      case 'expired': return 'Expired'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">My Tickets</h1>
            <p className="text-dark-muted">
              Manage your NFT tickets and view entry QR codes
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter your wallet address (0x...)"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="input flex-1"
              />
              <button className="btn-primary">
                Load Tickets
              </button>
            </div>
            <p className="text-sm text-dark-muted mt-2">
              Enter your wallet address to view tickets owned by that address
            </p>
          </div>

          {/* Tickets Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-dark-border rounded shimmer mb-2"></div>
                      <div className="h-4 bg-dark-border rounded shimmer w-3/4"></div>
                    </div>
                    <div className="h-6 w-16 bg-dark-border rounded shimmer"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-dark-border rounded shimmer"></div>
                    <div className="h-4 bg-dark-border rounded shimmer w-2/3"></div>
                  </div>
                  <div className="h-10 bg-dark-border rounded shimmer"></div>
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-dark-muted" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
              <p className="text-dark-muted mb-6">
                You don't have any tickets yet. Browse events to get started!
              </p>
              <Link href="/" className="btn-primary">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {tickets.map((ticket) => (
                <div key={`${ticket.ticketContract}-${ticket.tokenId}`} className="card">
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{ticket.eventName}</h3>
                      <p className="text-sm text-dark-muted">Token #{ticket.tokenId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-dark-muted">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(ticket.eventDate).toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-dark-muted">
                      <MapPin className="w-4 h-4 mr-2" />
                      {ticket.venue}
                    </div>
                  </div>

                  {/* Ticket Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-dark-muted">Price Paid</div>
                      <div className="font-semibold">{ticket.price} ETH</div>
                    </div>
                    <div>
                      <div className="text-dark-muted">Resales</div>
                      <div className="font-semibold">{ticket.resales}/2</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {ticket.status === 'valid' ? (
                      <>
                        <Link 
                          href={`/ticket/${ticket.ticketContract}/${ticket.tokenId}`}
                          className="btn-primary flex-1 flex items-center justify-center space-x-2"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>View QR</span>
                        </Link>
                        <button className="btn-secondary flex items-center justify-center space-x-2">
                          <ExternalLink className="w-4 h-4" />
                          <span>Resell</span>
                        </button>
                      </>
                    ) : (
                      <button 
                        disabled
                        className="btn-secondary flex-1 opacity-50 cursor-not-allowed"
                      >
                        {ticket.status === 'used' ? 'Ticket Used' : 'Expired'}
                      </button>
                    )}
                  </div>

                  {/* Contract Info */}
                  <div className="mt-4 pt-4 border-t border-dark-border">
                    <div className="text-xs text-dark-muted">
                      Contract: {ticket.ticketContract}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {tickets.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="card text-center">
                <div className="text-2xl font-bold text-primary-purple mb-2">
                  {tickets.length}
                </div>
                <div className="text-dark-muted">Total Tickets</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-accent-success mb-2">
                  {tickets.filter(t => t.status === 'valid').length}
                </div>
                <div className="text-dark-muted">Valid Tickets</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-accent-mint mb-2">
                  {tickets.reduce((sum, t) => sum + parseFloat(t.price), 0).toFixed(3)}
                </div>
                <div className="text-dark-muted">Total Spent (ETH)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
