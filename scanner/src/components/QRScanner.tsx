'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerProps {
  onScan: (data: string) => void
  isScanning: boolean
}

export function QRScanner({ onScan, isScanning }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!isScanning) return

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      videoConstraints: {
        facingMode: 'environment' // Use back camera
      }
    }

    const scanner = new Html5QrcodeScanner('qr-scanner', config, false)
    scannerRef.current = scanner

    scanner.render(
      (decodedText) => {
        onScan(decodedText)
      },
      (error) => {
        // Ignore scanning errors (too frequent)
        console.debug('QR scan error:', error)
      }
    )

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [isScanning, onScan])

  return (
    <div className="scanner-container">
      <div id="qr-scanner" className="qr-scanner"></div>
      
      {/* Scanner Overlay */}
      <div className="scanner-overlay">
        <div className="scanner-frame">
          <div className="scanner-corners">
            <div className="scanner-corner top-left"></div>
            <div className="scanner-corner top-right"></div>
            <div className="scanner-corner bottom-left"></div>
            <div className="scanner-corner bottom-right"></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-20 left-4 right-4 bg-accent-error/20 border border-accent-error/30 text-accent-error p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
