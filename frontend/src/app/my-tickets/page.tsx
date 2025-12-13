'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Ticket, QrCode, Calendar, MapPin, Wallet, RefreshCw } from 'lucide-react'

interface UserTicket {
  tokenId: string
  eventId: string
  eventName: string
  ticketContract: string
  owner: string
  resales: number
  lastPrice: string
  exists: boolean
  eventActive: boolean
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        setWalletAddress(accounts[0])
        // In a real implementation, you would fetch tickets for this address
        // For now, we'll show a placeholder
        setTickets([])
        setLoading(false)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        setError('Failed to connect wallet')
        setLoading(false)
      }
    } else {
      setError('Please install MetaMask to view your tickets')
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
            // Fetch tickets for connected wallet
            setTickets([]) // Placeholder
          }
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const refreshTickets = async () => {
    if (!walletAddress) return
    
    setLoading(true)
    try {
      // In a real implementation, you would call an API to get user tickets
      // This would involve querying blockchain events or a backend service
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTickets([]) // Placeholder
    } catch (error) {
      setError('Failed to refresh tickets')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-dark-border rounded shimmer mb-8 w-48"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card">
                  <div className="h-48 bg-dark-border rounded-lg shimmer mb-4"></div>
                  <div className="h-6 bg-dark-border rounded shimmer mb-2"></div>
                  <div className="h-4 bg-dark-border rounded shimmer w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card max-w-md mx-auto">
              <div className="w-24 h-24 bg-primary-purple/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Wallet className="w-12 h-12 text-primary-purple" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-dark-muted mb-6">
                Connect your wallet to view your NFT tickets and access dynamic QR codes.
              </p>
              <button
                onClick={connectWallet}
                className="btn-primary w-full"
              >
                Connect Wallet
              </button>
              {error && (
                <p className="text-red-400 text-sm mt-4">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
              <p className="text-dark-muted">
                Connected: {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
              </p>
            </div>
            <button
              onClick={refreshTickets}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Tickets Grid */}
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-dark-border rounded-full mx-auto mb-6 flex items-center justify-center">
                <Ticket className="w-12 h-12 text-dark-muted" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Tickets Yet</h3>
              <p className="text-dark-muted mb-6">
                You haven't purchased any tickets yet. Browse events to get started!
              </p>
              <Link href="/" className="btn-primary">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={`${ticket.ticketContract}-${ticket.tokenId}`} className="card">
                  {/* Ticket Visual */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-primary-purple to-accent-mint rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Ticket className="w-12 h-12 mx-auto mb-2" />
                      <div className="font-bold">#{ticket.tokenId}</div>
                      <div className="text-sm opacity-90">{ticket.eventName}</div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                      ticket.exists ? 'bg-accent-success text-white' : 'bg-red-500 text-white'
                    }`}>
                      {ticket.exists ? 'Valid' : 'Used'}
                    </div>
                  </div>

                  {/* Ticket Info */}
                  <h3 className="text-lg font-semibold mb-2">{ticket.eventName}</h3>
                  
                  <div className="space-y-2 mb-4 text-sm text-dark-muted">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Token ID: {ticket.tokenId}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Contract: {ticket.ticketContract.slice(0, 10)}...</span>
                    </div>
                    <div className="flex items-center">
                      <Ticket className="w-4 h-4 mr-2" />
                      <span>Resales: {ticket.resales}/2</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {ticket.exists ? (
                      <Link
                        href={`/ticket/${ticket.ticketContract}/${ticket.tokenId}`}
                        className="btn-primary flex-1 text-center flex items-center justify-center space-x-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View QR</span>
                      </Link>
                    ) : (
                      <button disabled className="btn-secondary flex-1 opacity-50 cursor-not-allowed">
                        Ticket Used
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <QrCode className="w-12 h-12 text-primary-purple mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Dynamic QR Codes</h3>
              <p className="text-dark-muted text-sm">
                Your tickets generate new QR codes every 10 seconds for maximum security
              </p>
            </div>
            <div className="card text-center">
              <Ticket className="w-12 h-12 text-accent-mint mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">NFT Ownership</h3>
              <p className="text-dark-muted text-sm">
                Your tickets are NFTs stored securely on the blockchain
              </p>
            </div>
            <div className="card text-center">
              <RefreshCw className="w-12 h-12 text-accent-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Anti-Scalping</h3>
              <p className="text-dark-muted text-sm">
                Smart contracts prevent scalping with resale limits and price caps
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
