import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from 'dotenv';
import { BlockchainService } from './services/blockchain';
import { QRService } from './services/qr';

config();

const fastify = Fastify({ logger: true });
const blockchain = new BlockchainService();
const qrService = new QRService();

// CORS setup - CRITICAL for production deployment
fastify.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://bookbyblock.netlify.app',
      'https://*.netlify.app',
      'https://vercel.app',
      'https://*.vercel.app'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(origin);
      }
      return pattern === origin;
    });
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Swagger documentation
fastify.register(swagger, {
  openapi: {
    info: {
      title: 'BookByBlock API',
      description: 'Web3 Anti-Scalping Ticketing Platform API',
      version: '1.0.0'
    },
    servers: [{ url: 'http://localhost:3001' }]
  }
});

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});

// Health check
fastify.get('/health', async () => {
  return { 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

// 🎫 EVENT MANAGEMENT

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
    const { eventId } = request.params as any;
    
    const [event, stats] = await Promise.all([
      blockchain.getEvent(eventId),
      blockchain.getEventStats(eventId)
    ]);
    
    return {
      success: true,
      data: { ...event, ...stats }
    };
  } catch (error: any) {
    reply.code(404);
    return { success: false, error: 'Event not found' };
  }
});

// 🎟️ TICKET OPERATIONS

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
    const { eventId, buyerAddress } = request.body as any;
    
    // Get event to check price
    const event = await blockchain.getEvent(eventId);
    
    const result = await blockchain.mintTicket(eventId, buyerAddress, event.basePrice);
    
    return {
      success: true,
      data: {
        ...result,
        eventId,
        ticketContract: event.ticketContract
      },
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
    const { ticketContract, tokenId } = request.params as any;
    
    const ticketInfo = await blockchain.getTicketInfo(ticketContract, tokenId);
    
    return {
      success: true,
      data: ticketInfo
    };
  } catch (error: any) {
    reply.code(404);
    return { success: false, error: 'Ticket not found' };
  }
});

// 🔄 DYNAMIC QR GENERATION

// Generate dynamic QR code
fastify.get('/api/qr/:ticketContract/:tokenId', async (request, reply) => {
  try {
    const { ticketContract, tokenId } = request.params as any;
    
    // Verify ticket exists and is not burned
    const ticketInfo = await blockchain.getTicketInfo(ticketContract, tokenId);
    
    if (!ticketInfo.exists) {
      reply.code(404);
      return { success: false, error: 'Ticket not found or already used' };
    }
    
    const qrData = await qrService.generateQR(ticketContract, tokenId);
    
    return {
      success: true,
      data: {
        qrCode: qrData.qrCode,
        expiresAt: qrData.expiresAt,
        refreshIn: 10000 // 10 seconds
      }
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// 🔍 TICKET VERIFICATION

// Verify and burn ticket
fastify.post('/api/verify-ticket', {
  schema: {
    body: {
      type: 'object',
      required: ['qrData', 'eventId'],
      properties: {
        qrData: { type: 'string' },
        eventId: { type: 'string' }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { qrData, eventId } = request.body as any;
    
    // Verify QR signature and expiry
    const verification = qrService.verifyQR(qrData);
    
    if (!verification.valid) {
      reply.code(400);
      return { 
        success: false, 
        error: verification.reason,
        action: 'rejected'
      };
    }
    
    const { ticketContract, tokenId } = verification.payload!;
    
    // Check ticket ownership and status
    const ticketInfo = await blockchain.getTicketInfo(ticketContract, tokenId);
    
    if (!ticketInfo.exists) {
      reply.code(400);
      return { 
        success: false, 
        error: 'Ticket already used or invalid',
        action: 'rejected'
      };
    }
    
    // Burn ticket on blockchain
    const burnResult = await blockchain.burnTicket(eventId, tokenId);
    
    return {
      success: true,
      data: {
        action: 'accepted',
        ticketContract,
        tokenId,
        owner: ticketInfo.owner,
        burnTransaction: burnResult.transactionHash,
        blockNumber: burnResult.blockNumber
      },
      message: 'Ticket verified and burned successfully'
    };
    
  } catch (error: any) {
    reply.code(500);
    return { 
      success: false, 
      error: error.message,
      action: 'error'
    };
  }
});

// 📊 ANALYTICS

// Get platform analytics
fastify.get('/api/admin/analytics', async (request, reply) => {
  try {
    const totalEvents = await blockchain.getTotalEvents();
    const events = await blockchain.getAllEvents();
    
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    let activeEvents = 0;
    
    for (const event of events) {
      if (event.active) activeEvents++;
      totalTicketsSold += parseInt(event.soldCount);
      totalRevenue += parseFloat(event.basePrice) * parseInt(event.soldCount);
    }
    
    return {
      success: true,
      data: {
        totalEvents: totalEvents.toString(),
        totalTicketsSold,
        totalRevenue: totalRevenue.toFixed(4),
        activeEvents,
        ticketsScanned: 0, // Would need event tracking
        averageResalePrice: '0.000',
        topEvents: events.slice(0, 5).map(event => ({
          name: event.name,
          sold: parseInt(event.soldCount),
          revenue: (parseFloat(event.basePrice) * parseInt(event.soldCount)).toFixed(4)
        }))
      }
    };
  } catch (error: any) {
    reply.code(500);
    return { success: false, error: error.message };
  }
});

// 🚀 START SERVER

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    console.log('🎫 BookByBlock API Server Started!');
    console.log(`📡 Server: http://localhost:${port}`);
    console.log(`📚 Docs: http://localhost:${port}/docs`);
    console.log(`🔗 Factory: ${process.env.FACTORY_ADDRESS}`);
    console.log(`⛓️  Network: ${process.env.ALCHEMY_API_URL ? 'Testnet' : 'Local'}`);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
