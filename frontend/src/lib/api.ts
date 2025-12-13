// API Configuration - reads from environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://43.205.239.215:3001';

// Helper function for API calls with error handling
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Call failed:', error);
    throw error;
  }
}

export const api = {
  // Health check
  async health() {
    return apiCall('/health');
  },

  // Events - matching backend endpoints
  async getEvents() {
    return apiCall('/events');
  },

  async getEvent(eventId: string) {
    return apiCall(`/events/${eventId}`);
  },

  async createEvent(data: {
    name: string;
    symbol: string;
    basePrice: string;
    totalSupply: number;
  }) {
    return apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Tickets
  async buyTicket(eventId: string, walletAddress: string) {
    return apiCall(`/purchase/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ buyerAddress: walletAddress })
    });
  },

  async getTicketInfo(contract: string, tokenId: string) {
    return apiCall(`/tickets/${contract}/${tokenId}`);
  },

  async getQR(contract: string, tokenId: string) {
    return apiCall(`/qr/${contract}/${tokenId}`);
  },

  async verifyTicket(payload: any) {
    return apiCall('/verify-ticket', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Analytics
  async getAnalytics() {
    return apiCall('/analytics');
  }
};
