'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRDemoProps {
  readonly eventId: string;
  readonly ticketId: string;
}

interface QRState {
  readonly data: string;
  readonly countdown: number;
  readonly isActive: boolean;
}

export default function QRDemo({ eventId, ticketId }: QRDemoProps) {
  const [state, setState] = useState<QRState>({
    data: '',
    countdown: 10,
    isActive: false
  });

  const generateQR = useCallback(() => {
    const currentTime = Math.floor(Date.now() / 10000) * 10000;
    const newQrData = `${eventId}-${ticketId}-${currentTime}`;
    
    setState(prev => ({
      ...prev,
      data: newQrData,
      countdown: 10
    }));
  }, [eventId, ticketId]);

  const toggleDemo = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  }, []);

  useEffect(() => {
    if (!state.isActive) return;

    generateQR();
    
    const qrInterval = setInterval(generateQR, 10000);
    const countdownInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        countdown: prev.countdown <= 1 ? 10 : prev.countdown - 1
      }));
    }, 1000);

    return () => {
      clearInterval(qrInterval);
      clearInterval(countdownInterval);
    };
  }, [state.isActive, generateQR]);

  const qrCodeElement = useMemo(() => (
    <QRCodeSVG 
      value={state.data} 
      size={200}
      level="M"
      includeMargin
      className="mx-auto border-2 border-gray-200 p-2 rounded-lg"
    />
  ), [state.data]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
        Dynamic QR Code Demo
      </h3>
      
      {!state.isActive ? (
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            This demonstrates the security feature where QR codes refresh every 10 seconds
          </p>
          <button
            onClick={toggleDemo}
            className="bg-primary-purple text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            type="button"
          >
            Start QR Demo
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="mb-4">
            {qrCodeElement}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">QR Code refreshes in:</p>
            <div className="text-3xl font-bold text-primary-purple tabular-nums">
              {state.countdown}s
            </div>
          </div>
          
          <div className="text-xs text-gray-500 font-mono break-all bg-gray-50 p-2 rounded">
            Current QR: {state.data}
          </div>
          
          <button
            onClick={toggleDemo}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            type="button"
          >
            Stop Demo
          </button>
        </div>
      )}
    </div>
  );
}
