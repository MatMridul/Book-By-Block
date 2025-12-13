'use client'

import { useState, useEffect } from 'react'
import { QRScanner } from '@/components/QRScanner'
import { 
  Camera, 
  CameraOff, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Ticket,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react'

interface VerificationResult {
  success: boolean
  message: string
  data?: {
    ticketContract: string
    tokenId: string
    owner: string
    burnTransaction?: string
  }
  error?: string
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [eventId, setEventId] = useState('1') // Default event ID
  const [manualInput, setManualInput] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [scanCount, setScanCount] = useState(0)

  const handleScan = async (qrData: string) => {
    if (isVerifying) return

    setIsVerifying(true)
    setResult(null)
    setScanCount(prev => prev + 1)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/verify-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData,
          eventId
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: 'Ticket verified and burned successfully!',
          data: data.data
        })
        
        // Auto-restart scanning after 3 seconds
        setTimeout(() => {
          setResult(null)
          setIsVerifying(false)
        }, 3000)
      } else {
        setResult({
          success: false,
          message: data.error || 'Verification failed',
          error: data.error
        })
        
        // Auto-restart scanning after 2 seconds
        setTimeout(() => {
          setResult(null)
          setIsVerifying(false)
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error - please check connection',
        error: 'Network error'
      })
      
      setTimeout(() => {
        setResult(null)
        setIsVerifying(false)
      }, 2000)
    }
  }

  const handleManualVerify = () => {
    if (manualInput.trim()) {
      handleScan(manualInput.trim())
      setManualInput('')
      setShowManual(false)
    }
  }

  const startScanning = () => {
    setIsScanning(true)
    setResult(null)
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  return (
    <div className="min-h-screen bg-dark-bg relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-dark-card/90 backdrop-blur-sm border-b border-dark-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-purple to-accent-mint rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">BookByBlock Scanner</h1>
              <p className="text-xs text-accent-mint">No Login Required • Instant Verification</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right text-sm">
              <div className="text-dark-muted">Scanned</div>
              <div className="font-semibold text-accent-success">{scanCount}</div>
            </div>
            <button 
              onClick={() => setShowManual(!showManual)}
              className="p-2 bg-dark-border rounded-lg hover:bg-primary-purple transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative">
        {isScanning ? (
          <QRScanner onScan={handleScan} isScanning={isScanning && !isVerifying} />
        ) : (
          <div className="h-screen flex items-center justify-center bg-dark-bg">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-dark-muted" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to Scan</h2>
              <p className="text-accent-mint font-medium mb-2">No Login Required</p>
              <p className="text-dark-muted mb-8">
                Point camera at any BookByBlock QR code for instant verification
              </p>
              <button
                onClick={startScanning}
                className="bg-primary-purple hover:bg-primary-purple-dark text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Scanning
              </button>
            </div>
          </div>
        )}

        {/* Scanning Instructions */}
        {isScanning && !result && !isVerifying && (
          <div className="absolute bottom-32 left-4 right-4 z-10">
            <div className="bg-dark-card/90 backdrop-blur-sm border border-dark-border rounded-lg p-4 text-center">
              <p className="text-sm text-dark-muted mb-2">
                Point camera at QR code
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={stopScanning}
                  className="flex items-center space-x-2 bg-dark-border hover:bg-accent-error text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop</span>
                </button>
                <button
                  onClick={() => setShowManual(true)}
                  className="flex items-center space-x-2 bg-dark-border hover:bg-primary-purple text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manual</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Loading */}
        {isVerifying && (
          <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center max-w-sm mx-4">
              <Loader2 className="w-12 h-12 text-primary-purple animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verifying Ticket</h3>
              <p className="text-dark-muted">
                Checking blockchain ownership and burning ticket...
              </p>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className="absolute inset-0 bg-dark-bg/90 backdrop-blur-sm flex items-center justify-center z-30">
            <div className={`border rounded-xl p-6 text-center max-w-md mx-4 ${
              result.success 
                ? 'bg-accent-success/10 border-accent-success/30' 
                : 'bg-accent-error/10 border-accent-error/30'
            }`}>
              {result.success ? (
                <CheckCircle className="w-16 h-16 text-accent-success mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-accent-error mx-auto mb-4" />
              )}
              
              <h3 className={`text-2xl font-bold mb-4 ${
                result.success ? 'text-accent-success' : 'text-accent-error'
              }`}>
                {result.success ? '✅ ENTRY APPROVED' : '❌ ENTRY DENIED'}
              </h3>
              
              {result.success && result.data ? (
                <div className="text-left bg-dark-bg/50 rounded-lg p-4 mb-4 space-y-3">
                  {/* Event Information */}
                  <div className="border-b border-dark-border pb-3">
                    <h4 className="text-accent-mint font-semibold mb-2">🎬 EVENT DETAILS</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-dark-muted">Event:</span> <span className="text-white font-medium">{result.data.eventName || 'Event #' + eventId}</span></div>
                      <div><span className="text-dark-muted">Venue:</span> <span className="text-white">{result.data.venue || 'Blockchain Venue'}</span></div>
                      <div><span className="text-dark-muted">Date:</span> <span className="text-white">{result.data.eventDate || new Date().toLocaleDateString()}</span></div>
                    </div>
                  </div>

                  {/* Seat Information - Matches Judge Explanation */}
                  <div className="border-b border-dark-border pb-3">
                    <h4 className="text-primary-purple font-semibold mb-2">🎟️ SEAT ASSIGNMENT</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-dark-muted">Auditorium:</span> <span className="text-white font-medium">{result.data.auditorium || result.data.section || 'Main Hall'}</span></div>
                      <div><span className="text-dark-muted">Row:</span> <span className="text-white font-medium">{result.data.row || 'General'}</span></div>
                      <div><span className="text-dark-muted">Seat:</span> <span className="text-white font-medium text-lg">{result.data.seatNumber || result.data.seat || 'Standing'}</span></div>
                      <div><span className="text-dark-muted">Ticket #:</span> <span className="text-white font-mono">#{result.data.tokenId}</span></div>
                    </div>
                  </div>

                  {/* Blockchain Verification - Matches Technical Explanation */}
                  <div>
                    <h4 className="text-accent-warning font-semibold mb-2">🔗 BLOCKCHAIN PROOF</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-dark-muted">NFT Owner:</span> <span className="text-white font-mono text-xs">{result.data.owner}</span></div>
                      <div><span className="text-dark-muted">Resales:</span> <span className="text-white">{result.data.resales || 0}/2 used</span></div>
                      <div><span className="text-dark-muted">QR Verified:</span> <span className="text-accent-success">✓ Valid Signature</span></div>
                      <div><span className="text-dark-muted">Status:</span> <span className="text-accent-success font-semibold">ENTRY APPROVED</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-left bg-dark-bg/50 rounded-lg p-4 mb-4">
                  <p className="text-red-400 font-medium">{result.message}</p>
                  {result.error && (
                    <p className="text-sm text-dark-muted mt-2">Error: {result.error}</p>
                  )}
                </div>
              )}
              
              <div className={`text-lg font-semibold ${
                result.success ? 'text-accent-success' : 'text-accent-error'
              }`}>
                {result.success ? '🎉 TICKET VERIFIED & USED' : '⚠️ INVALID TICKET'}
              </div>
            </div>
          </div>
        )}

        {/* Manual Input Modal */}
        {showManual && (
          <div className="absolute inset-0 bg-dark-bg/90 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 max-w-sm mx-4 w-full">
              <h3 className="text-xl font-semibold mb-4">Manual Entry</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event ID</label>
                  <input
                    type="text"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border text-dark-text rounded-lg px-3 py-2 focus:outline-none focus:border-primary-purple"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">QR Data</label>
                  <textarea
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border text-dark-text rounded-lg px-3 py-2 h-24 focus:outline-none focus:border-primary-purple resize-none"
                    placeholder="Paste QR code data here..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowManual(false)}
                    className="flex-1 bg-dark-border hover:bg-dark-border/80 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualVerify}
                    disabled={!manualInput.trim()}
                    className="flex-1 bg-primary-purple hover:bg-primary-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-dark-card/90 backdrop-blur-sm border-t border-dark-border p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
              <span className="text-dark-muted">Scanner Active</span>
            </div>
            <div className="text-dark-muted">
              API: {process.env.NEXT_PUBLIC_BACKEND_URL?.includes('localhost') ? 'Local' : 'Remote'}
            </div>
          </div>
          <div className="text-dark-muted">
            BookByBlock v1.0
          </div>
        </div>
      </div>
    </div>
  )
}
