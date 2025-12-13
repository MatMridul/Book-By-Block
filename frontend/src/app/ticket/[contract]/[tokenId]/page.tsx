'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, Clock, Shield, QrCode, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

interface TicketInfo {
  owner: string
  resales: number
  lastPrice: string
  exists: boolean
}

interface QRData {
  qrCode: string
  validUntil: string
  ticketInfo: TicketInfo
}

export default function TicketQRPage() {
  const params = useParams()
  const router = useRouter()
  const contract = params.contract as string
  const tokenId = params.tokenId as string
  
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(10)
  const [refreshing, setRefreshing] = useState(false)

  const generateQR = useCallback(async () => {
    try {
      setRefreshing(true)
      setError(null)
      const response = await api.getQR(contract, tokenId)
      if (response.success) {
        setQrData(response.data)
        setCountdown(10) // Reset countdown
      } else {
        setError(response.error || 'Failed to generate QR code')
      }
    } catch (error) {
      console.error('Failed to generate QR:', error)
      setError('Failed to generate QR code')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [contract, tokenId])

  // Initial load
  useEffect(() => {
    generateQR()
  }, [generateQR])

  // Auto-refresh countdown and QR generation
  useEffect(() => {
    if (!qrData || error) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateQR()
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [qrData, error, generateQR])

  const manualRefresh = () => {
    generateQR()
  }

  if (loading && !qrData) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-8 bg-dark-border rounded shimmer mb-8 w-32 mx-auto"></div>
            <div className="card">
              <div className="w-80 h-80 bg-dark-border rounded-lg shimmer mx-auto mb-6"></div>
              <div className="h-6 bg-dark-border rounded shimmer mb-4"></div>
              <div className="h-4 bg-dark-border rounded shimmer w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !qrData) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => router.back()}
              className="btn-secondary mb-8 inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <div className="card text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Unable to Load Ticket</h1>
              <p className="text-dark-muted mb-6">{error}</p>
              <button onClick={generateQR} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              onClick={manualRefresh}
              disabled={refreshing}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Ticket Info */}
          <div className="card mb-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Your Ticket</h1>
              <p className="text-dark-muted">
                Token #{tokenId} • {contract.slice(0, 10)}...{contract.slice(-8)}
              </p>
            </div>

            {qrData?.ticketInfo && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-dark-bg rounded-lg">
                  <div className="text-lg font-semibold">{qrData.ticketInfo.resales}/2</div>
                  <div className="text-sm text-dark-muted">Resales Used</div>
                </div>
                <div className="text-center p-4 bg-dark-bg rounded-lg">
                  <div className={`text-lg font-semibold ${qrData.ticketInfo.exists ? 'text-accent-success' : 'text-red-400'}`}>
                    {qrData.ticketInfo.exists ? 'Valid' : 'Used'}
                  </div>
                  <div className="text-sm text-dark-muted">Status</div>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="card text-center">
            {qrData?.ticketInfo?.exists ? (
              <>
                {/* Countdown Timer */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Clock className="w-5 h-5 text-accent-mint" />
                  <span className="text-lg font-semibold">
                    Refreshes in {countdown}s
                  </span>
                </div>

                {/* QR Code */}
                <div className="relative inline-block mb-6">
                  <div className={`transition-opacity duration-300 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
                    {qrData?.qrCode ? (
                      <img
                        src={qrData.qrCode}
                        alt="Dynamic QR Code"
                        className="w-80 h-80 mx-auto border-4 border-primary-purple rounded-lg"
                      />
                    ) : (
                      <div className="w-80 h-80 bg-dark-border rounded-lg flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-dark-muted" />
                      </div>
                    )}
                  </div>
                  
                  {refreshing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-primary-purple animate-spin" />
                    </div>
                  )}
                </div>

                {/* Security Info */}
                <div className="bg-primary-purple/10 border border-primary-purple/20 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-primary-purple" />
                    <span className="font-semibold text-primary-purple">Anti-Screenshot Protection</span>
                  </div>
                  <p className="text-sm text-dark-muted">
                    This QR code refreshes every 10 seconds and contains cryptographic signatures 
                    to prevent fraud and unauthorized screenshots.
                  </p>
                </div>
              </>
            ) : (
              <div className="py-12">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Ticket Already Used</h2>
                <p className="text-dark-muted">
                  This ticket has been scanned and verified. It cannot be used again.
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">How to Use Your Ticket</h3>
            <div className="space-y-3 text-sm text-dark-muted">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-purple text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-medium text-white">Present at Entry</div>
                  <div>Show this QR code to the scanner at the event entrance</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-purple text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-medium text-white">Wait for Verification</div>
                  <div>The scanner will verify your ticket on the blockchain</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-purple text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-medium text-white">Entry Granted</div>
                  <div>Once verified, your ticket will be marked as used</div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mt-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
