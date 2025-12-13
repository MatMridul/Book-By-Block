// API Configuration - reads from environment variable
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Helper function for API calls with error handling
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
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
}

export const api = {
  // Health check
  async health() {
    return apiCall('/health');
  },

  // Events
  async getEvents() {
    return apiCall('/api/events');
  },

  async getEvent(eventId: string) {
    return apiCall(`/api/events/${eventId}`);
  },

  async createEvent(data: {
    name: string;
    symbol: string;
    basePrice: string;
    totalSupply: number;
  }) {
    return apiCall('/api/admin/create-event', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Tickets
  async buyTicket(eventId: string, walletAddress: string) {
    return apiCall('/api/buy', {
      method: 'POST',
      body: JSON.stringify({ eventId, buyerAddress: walletAddress })
    });
  },

  async getTicketInfo(contract: string, tokenId: string) {
    return apiCall(`/api/tickets/${contract}/${tokenId}`);
  },

  async getQR(contract: string, tokenId: string) {
    return apiCall(`/api/qr/${contract}/${tokenId}`);
  },

  async verifyTicket(payload: any) {
    return apiCall('/api/verify-ticket', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Analytics
  async getAnalytics() {
    return apiCall('/api/analytics');
  }
};
