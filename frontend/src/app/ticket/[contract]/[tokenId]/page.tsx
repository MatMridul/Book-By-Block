'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { QrCode, RefreshCw, Shield, Clock, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TicketInfo {
  owner: string
  resales: string
  lastPrice: string
  exists: boolean
  burned: boolean
}

export default function TicketPage() {
  const params = useParams()
  const { contract, tokenId } = params
  
  const [qrCode, setQrCode] = useState('')
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)

  // Fetch ticket info
  useEffect(() => {
    const fetchTicketInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${contract}/${tokenId}`)
        if (response.ok) {
          const result = await response.json()
          setTicketInfo(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch ticket info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTicketInfo()
  }, [contract, tokenId])

  // Fetch QR code
  const fetchQR = async () => {
    if (!ticketInfo?.exists) return

    setRefreshing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qr/${contract}/${tokenId}`)
      if (response.ok) {
        const result = await response.json()
        setQrCode(result.data.qrCode)
        setTimeLeft(10)
      }
    } catch (error) {
      console.error('Failed to fetch QR:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Auto-refresh QR code every 10 seconds
  useEffect(() => {
    if (!ticketInfo?.exists) return

    fetchQR()
    
    const interval = setInterval(() => {
      fetchQR()
    }, 10000)

    return () => clearInterval(interval)
  }, [ticketInfo])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="h-8 bg-dark-border rounded shimmer mb-8 w-1/4"></div>
            <div className="card">
              <div className="w-64 h-64 bg-dark-border rounded-xl shimmer mx-auto mb-6"></div>
              <div className="h-6 bg-dark-border rounded shimmer mb-4"></div>
              <div className="h-4 bg-dark-border rounded shimmer w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!ticketInfo?.exists) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-accent-error" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
          <p className="text-dark-muted mb-6">
            This ticket may have been used or doesn't exist.
          </p>
          <Link href="/" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link href="/my-tickets" className="flex items-center text-dark-muted hover:text-primary-purple mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Tickets
          </Link>

          {/* Ticket Card */}
          <div className="card text-center">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Your Ticket</h1>
              <p className="text-dark-muted">
                Contract: {contract as string}
              </p>
              <p className="text-dark-muted">
                Token ID: #{tokenId}
              </p>
            </div>

            {/* QR Code Section */}
            <div className="qr-container mb-6">
              <div className="relative">
                {/* Refresh indicator */}
                <div className="qr-refresh-indicator"></div>
                
                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl inline-block mb-4 animate-qr-refresh">
                  {qrCode ? (
                    <img 
                      src={qrCode} 
                      alt="Dynamic QR Code" 
                      className="w-64 h-64 mx-auto"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Refresh Status */}
                <div className="flex items-center justify-center space-x-2 text-sm text-dark-muted">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refreshes in {timeLeft}s</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-accent-warning/10 border border-accent-warning/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-accent-warning mr-2" />
                <span className="font-semibold text-accent-warning">Anti-Screenshot Protection</span>
              </div>
              <p className="text-sm text-dark-muted">
                This QR code changes every 10 seconds and cannot be screenshot or shared. 
                Only show this to venue staff at entry.
              </p>
            </div>

            {/* Ticket Details */}
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-dark-bg rounded-lg p-4">
                <div className="text-sm text-dark-muted mb-1">Owner</div>
                <div className="font-mono text-sm break-all">{ticketInfo.owner}</div>
              </div>
              <div className="bg-dark-bg rounded-lg p-4">
                <div className="text-sm text-dark-muted mb-1">Resales</div>
                <div className="font-semibold">{ticketInfo.resales}/2</div>
              </div>
              <div className="bg-dark-bg rounded-lg p-4">
                <div className="text-sm text-dark-muted mb-1">Last Price</div>
                <div className="font-semibold">{ticketInfo.lastPrice} ETH</div>
              </div>
              <div className="bg-dark-bg rounded-lg p-4">
                <div className="text-sm text-dark-muted mb-1">Status</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-accent-success rounded-full mr-2"></div>
                  <span className="text-accent-success font-semibold">Valid</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button className="btn-secondary flex items-center justify-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>View on Blockchain</span>
              </button>
              <button className="btn-secondary flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh QR</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-8 pt-6 border-t border-dark-border text-left">
              <h3 className="font-semibold mb-3 flex items-center">
                <Clock className="w-4 h-4 text-primary-purple mr-2" />
                Entry Instructions
              </h3>
              <div className="space-y-2 text-sm text-dark-muted">
                <div>1. Arrive at the venue entrance</div>
                <div>2. Show this QR code to staff (do not screenshot)</div>
                <div>3. Staff will scan and verify your ticket</div>
                <div>4. Your ticket will be automatically burned after entry</div>
                <div>5. Keep your phone charged for the QR code</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
