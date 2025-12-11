'use client'

import { ReactNode } from 'react'

// Simplified Web3 provider for demo
// In production, would use wagmi/web3modal
export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  )
}
