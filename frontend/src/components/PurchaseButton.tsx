'use client';

import { useState, useCallback } from 'react';

interface PurchaseButtonProps {
  readonly eventId: number;
  readonly eventName: string;
  readonly price: string;
  readonly onPurchaseSuccess?: (ticket: PurchaseResult) => void;
}

interface PurchaseResult {
  readonly ticketId: number;
  readonly transactionHash: string;
  readonly ticket: TicketData;
}

interface TicketData {
  readonly ticketId: number;
  readonly eventId: number;
  readonly eventName: string;
  readonly owner: string;
  readonly purchaseDate: string;
  readonly transactionHash: string;
  readonly qrCode: string;
  readonly section: string;
  readonly row: number;
  readonly seat: number;
  readonly venue: string;
  readonly date: string;
  readonly time: string;
}

interface PurchaseState {
  readonly isLoading: boolean;
  readonly walletAddress: string;
  readonly error: string | null;
}

export default function PurchaseButton({ 
  eventId, 
  eventName, 
  price, 
  onPurchaseSuccess 
}: PurchaseButtonProps) {
  const [state, setState] = useState<PurchaseState>({
    isLoading: false,
    walletAddress: '',
    error: null
  });

  const connectWallet = useCallback(async (): Promise<string> => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const address = accounts[0] as string;
        setState(prev => ({ ...prev, walletAddress: address, error: null }));
        return address;
      } else {
        // For demo purposes when MetaMask is not available
        const mockAddress = '0x1234567890123456789012345678901234567890';
        setState(prev => ({ ...prev, walletAddress: mockAddress, error: null }));
        return mockAddress;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Fallback to mock address for demo
      const mockAddress = '0x1234567890123456789012345678901234567890';
      setState(prev => ({ ...prev, walletAddress: mockAddress, error: null }));
      return mockAddress;
    }
  }, []);

  const purchaseTicket = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const address = state.walletAddress || await connectWallet();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerAddress: address
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PurchaseResult = await response.json();
      
      if (result.ticketId && result.transactionHash) {
        alert(`Ticket purchased successfully!\nTicket ID: ${result.ticketId}\nTransaction: ${result.transactionHash}`);
        onPurchaseSuccess?.(result);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed. Please try again.';
      setState(prev => ({ ...prev, error: errorMessage }));
      alert(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [eventId, state.walletAddress, connectWallet, onPurchaseSuccess]);

  return (
    <div className="space-y-4">
      {state.walletAddress && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <p className="font-medium">Connected Wallet:</p>
          <p className="font-mono text-xs">
            {state.walletAddress.slice(0, 6)}...{state.walletAddress.slice(-4)}
          </p>
        </div>
      )}
      
      {state.error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {state.error}
        </div>
      )}
      
      <button
        onClick={purchaseTicket}
        disabled={state.isLoading}
        className="w-full bg-primary-purple text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:ring-2 focus:ring-primary-purple focus:ring-offset-2"
        type="button"
      >
        {state.isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Buy Ticket - ${price} ETH`
        )}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        {state.walletAddress 
          ? 'Click to purchase with connected wallet' 
          : 'Wallet will be connected automatically'
        }
      </p>
    </div>
  );
}
