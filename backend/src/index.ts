import Fastify from 'fastify';
import cors from '@fastify/cors';
import { BlockchainService } from './services/blockchain';
import { QRService } from './services/qr';

// Optimize for Lambda - conditional dotenv loading
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Initialize Fastify with production optimizations
const fastify = Fastify({ 
  logger: process.env.NODE_ENV !== 'production',
  disableRequestLogging: process.env.NODE_ENV === 'production'
});

// Lazy initialization for better cold start performance
let blockchain: BlockchainService;
let qrService: QRService;

const getServices = () => {
  if (!blockchain) blockchain = new BlockchainService();
  if (!qrService) qrService = new QRService();
  return { blockchain, qrService };
};

// Optimized CORS for AWS
fastify.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://*.amplifyapp.com',
      'https://*.amazonaws.com'
    ];
    
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(origin);
      }
      return pattern === origin;
    });
    
    callback(null, isAllowed);
  },
  credentials: false
});

// Health check
fastify.get('/health', async () => ({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  version: '1.0.0'
}));

// Create new event
fastify.post('/api/admin/create-event', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'symbol', 'basePrice', 'totalSupply'],
      properties: {
        name: { type: 'string' },
        symbol: { type: 'string' },
        basePrice: { type: 'string' },
        totalSupply: { type: 'number' }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { blockchain } = getServices();
    const { name, symbol, basePrice, totalSupply } = request.body as any;
    
    const result = await blockchain.createEvent(name, symbol, basePrice, totalSupply);
    
    return {
      success: true,
      data: result,
      message: 'Event created successfully'
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// Get all events
fastify.get('/api/events', async (request, reply) => {
  try {
    const { blockchain } = getServices();
    const events = await blockchain.getAllEvents();
    return {
      success: true,
      data: events
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// Get event details
fastify.get('/api/events/:eventId', async (request, reply) => {
  try {
    const { blockchain } = getServices();
    const { eventId } = request.params as any;
    
    const event = await blockchain.getEvent(parseInt(eventId));
    
    return {
      success: true,
      data: event
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// Buy ticket
fastify.post('/api/buy', {
  schema: {
    body: {
      type: 'object',
      required: ['eventId', 'buyerAddress'],
      properties: {
        eventId: { type: 'string' },
        buyerAddress: { type: 'string' }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { blockchain } = getServices();
    const { eventId, buyerAddress } = request.body as any;
    
    const result = await blockchain.buyTicket(parseInt(eventId), buyerAddress);
    
    return {
      success: true,
      data: result,
      message: 'Ticket purchased successfully'
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// Get ticket info
fastify.get('/api/tickets/:ticketContract/:tokenId', async (request, reply) => {
  try {
    const { blockchain } = getServices();
    const { ticketContract, tokenId } = request.params as any;
    
    const ticketInfo = await blockchain.getTicketInfo(ticketContract, parseInt(tokenId));
    
    return {
      success: true,
      data: ticketInfo
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// Generate dynamic QR code
fastify.get('/api/qr/:ticketContract/:tokenId', async (request, reply) => {
  try {
    const { blockchain, qrService } = getServices();
    const { ticketContract, tokenId } = request.params as any;
    
    // Verify ticket exists and is not burned
    const ticketInfo = await blockchain.getTicketInfo(ticketContract, parseInt(tokenId));
    
    if (!ticketInfo.exists) {
      reply.code(404);
      return { success: false, error: 'Ticket not found or has been used' };
    }
    
    // Generate time-sensitive QR code
    const qrData = {
      contract: ticketContract,
      tokenId: parseInt(tokenId),
      owner: ticketInfo.owner,
      timestamp: Date.now(),
      signature: 'dynamic-signature' // In production, use cryptographic signature
    };
    
    const qrResult = await qrService.generateQR(ticketContract, tokenId.toString());
    
    return {
      success: true,
      data: {
        qrCode: qrResult.qrCode,
        validUntil: new Date(qrResult.expiresAt).toISOString(),
        ticketInfo
      }
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// Verify and use ticket
fastify.post('/api/verify-ticket', {
  schema: {
    body: {
      type: 'object',
      required: ['qrData'],
      properties: {
        qrData: { type: 'string' }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { blockchain } = getServices();
    const { qrData } = request.body as any;
    
    // Parse QR data
    const ticketData = JSON.parse(qrData);
    const { contract: ticketContract, tokenId } = ticketData;
    
    // Check ticket ownership and status
    const ticketInfo = await blockchain.getTicketInfo(ticketContract, tokenId);
    
    if (!ticketInfo.exists) {
      reply.code(400);
      return { success: false, error: 'Ticket has already been used or does not exist' };
    }
    
    // Verify timestamp (5-minute window)
    const now = Date.now();
    const qrTimestamp = ticketData.timestamp;
    if (now - qrTimestamp > 5 * 60 * 1000) {
      reply.code(400);
      return { success: false, error: 'QR code has expired. Please generate a new one.' };
    }
    
    return {
      success: true,
      data: {
        verified: true,
        ticketInfo,
        message: 'Ticket verified successfully'
      }
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// Get platform analytics
fastify.get('/api/analytics', async (request, reply) => {
  try {
    const { blockchain } = getServices();
    const totalEvents = await blockchain.getTotalEvents();
    const events = await blockchain.getAllEvents();
    
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    
    for (const event of events) {
      if (event) {
        totalTicketsSold += event.soldCount;
        totalRevenue += event.soldCount * parseFloat(event.basePrice);
      }
    }
    
    return {
      success: true,
      data: {
        totalEvents,
        totalTicketsSold,
        totalRevenue: totalRevenue.toFixed(4),
        averageTicketPrice: events.length > 0 ? 
          (events.reduce((sum, event) => sum + (event ? parseFloat(event.basePrice) : 0), 0) / events.length).toFixed(4) : 
          '0',
        recentEvents: events.slice(-5)
      }
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// Export app for Lambda
export const app = fastify;

// Start server only if not in Lambda environment
if (require.main === module) {
  const start = async () => {
    try {
      const port = parseInt(process.env.PORT || '3001');
      const host = process.env.HOST || '0.0.0.0';
      
      await fastify.listen({ port, host });
      
      console.log('🎫 BookByBlock API Server Started!');
      console.log(`📡 Server: http://localhost:${port}`);
      console.log(`🔗 Contract: ${process.env.CONTRACT_ADDRESS}`);
      console.log(`⛓️  Network: ${process.env.RPC_URL ? 'Production' : 'Local'}`);
      
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  
  start();
}
