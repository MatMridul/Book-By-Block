const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  // Events
  async getEvents() {
    const response = await fetch(`${API_BASE}/api/events`);
    return response.json();
  },

  async createEvent(data: {
    name: string;
    symbol: string;
    basePrice: string;
    totalSupply: number;
  }) {
    const response = await fetch(`${API_BASE}/api/admin/create-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Tickets
  async buyTicket(eventId: string, walletAddress: string) {
    const response = await fetch(`${API_BASE}/api/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, buyerAddress: walletAddress })
    });
    return response.json();
  },

  async getQR(contract: string, tokenId: string) {
    const response = await fetch(`${API_BASE}/api/qr/${contract}/${tokenId}`);
    return response.json();
  },

  async verifyTicket(payload: any) {
    const response = await fetch(`${API_BASE}/api/verify-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return response.json();
  }
};
