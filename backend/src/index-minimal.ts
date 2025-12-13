import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Input validation helpers
const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const sanitizeString = (input: string): string => {
  return input.replace(/[<>\"'&]/g, '').trim().substring(0, 200);
};

const isValidEventId = (id: any): boolean => {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0 && num <= 1000000;
};

// Mock events data with enhanced structure
const mockEvents = [
  {
    eventId: 1,
    name: "Rock Concert - The Legends",
    description: "Experience the greatest rock legends live in concert. An unforgettable night of classic rock hits.",
    basePrice: "0.05",
    totalSupply: 500,
    soldCount: 125,
    active: true,
    creator: "0x1234567890123456789012345678901234567890",
    ticketContract: "0x96E3120D70eD1fB73E2751d9399B3D4F8794391f",
    createdAt: new Date().toISOString(),
    venue: "Madison Square Garden",
    date: "2024-02-15",
    time: "20:00",
    image: "/api/placeholder/400/300"
  },
  {
    eventId: 2,
    name: "Tech Conference 2024",
    description: "Join industry leaders for cutting-edge tech talks, networking, and innovation showcases.",
    basePrice: "0.02",
    totalSupply: 1000,
    soldCount: 750,
    active: true,
    creator: "0x2345678901234567890123456789012345678901",
    ticketContract: "0x96E3120D70eD1fB73E2751d9399B3D4F8794391f",
    createdAt: new Date().toISOString(),
    venue: "Convention Center",
    date: "2024-03-10",
    time: "09:00",
    image: "/api/placeholder/400/300"
  },
  {
    eventId: 3,
    name: "Football Championship",
    description: "The ultimate championship match. Two top teams battle for the title in this epic showdown.",
    basePrice: "0.1",
    totalSupply: 50000,
    soldCount: 35000,
    active: true,
    creator: "0x3456789012345678901234567890123456789012",
    ticketContract: "0x96E3120D70eD1fB73E2751d9399B3D4F8794391f",
    createdAt: new Date().toISOString(),
    venue: "National Stadium",
    date: "2024-04-20",
    time: "15:00",
    image: "/api/placeholder/400/300"
  },
  {
    eventId: 4,
    name: "Art Gallery Opening",
    description: "Exclusive opening of contemporary art exhibition featuring renowned international artists.",
    basePrice: "0.01",
    totalSupply: 200,
    soldCount: 45,
    active: true,
    creator: "0x4567890123456789012345678901234567890123",
    ticketContract: "0x96E3120D70eD1fB73E2751d9399B3D4F8794391f",
    createdAt: new Date().toISOString(),
    venue: "Modern Art Museum",
    date: "2024-01-25",
    time: "18:00",
    image: "/api/placeholder/400/300"
  },
  {
    eventId: 5,
    name: "Comedy Night Special",
    description: "Laugh out loud with top comedians performing their best material in an intimate setting.",
    basePrice: "0.03",
    totalSupply: 300,
    soldCount: 180,
    active: true,
    creator: "0x5678901234567890123456789012345678901234",
    ticketContract: "0x96E3120D70eD1fB73E2751d9399B3D4F8794391f",
    createdAt: new Date().toISOString(),
    venue: "Comedy Club Downtown",
    date: "2024-02-28",
    time: "21:00",
    image: "/api/placeholder/400/300"
  }
] as const;

// Mock tickets storage with proper typing
interface MockTicket {
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

const mockTickets: MockTicket[] = [];

// Rate limiting (simple in-memory)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimiter.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

// Security middleware
app.use((req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      timestamp: new Date().toISOString()
    });
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Root route with API documentation
app.get('/', (req, res) => {
  res.json({ 
    message: 'BookByBlock Backend API v2.0', 
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    security: 'Enhanced with input validation and rate limiting',
    endpoints: {
      health: 'GET /health',
      events: 'GET /events',
      event: 'GET /events/:id',
      purchase: 'POST /purchase/:eventId',
      verify: 'POST /verify-ticket',
      tickets: 'GET /tickets/:address'
    }
  });
});

// Health check with enhanced info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0',
    security: 'active'
  });
});

// Get all events
app.get('/events', (req, res) => {
  res.json(mockEvents);
});

// Get single event with validation
app.get('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  
  if (!isValidEventId(eventId)) {
    return res.status(400).json({ 
      error: 'Invalid event ID',
      timestamp: new Date().toISOString()
    });
  }
  
  const event = mockEvents.find(e => e.eventId === eventId);
  
  if (!event) {
    return res.status(404).json({ 
      error: 'Event not found',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json(event);
});

// Create event (mock implementation)
app.post('/events', (req, res) => {
  const eventId = Math.floor(Math.random() * 1000) + 1000;
  const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  res.status(201).json({
    success: true,
    eventId,
    transactionHash,
    timestamp: new Date().toISOString()
  });
});

// Purchase ticket with enhanced validation and security
app.post('/purchase/:eventId', (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const { buyerAddress } = req.body;
    
    // Validation
    if (!isValidEventId(eventId)) {
      return res.status(400).json({ 
        error: 'Invalid event ID',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!buyerAddress || typeof buyerAddress !== 'string') {
      return res.status(400).json({ 
        error: 'Valid buyer address required',
        timestamp: new Date().toISOString()
      });
    }
    
    // For demo, allow any address format but sanitize
    const sanitizedAddress = sanitizeString(buyerAddress);
    if (sanitizedAddress.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid buyer address format',
        timestamp: new Date().toISOString()
      });
    }
    
    const event = mockEvents.find(e => e.eventId === eventId);
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!event.active) {
      return res.status(400).json({ 
        error: 'Event is not active',
        timestamp: new Date().toISOString()
      });
    }
    
    if (event.soldCount >= event.totalSupply) {
      return res.status(400).json({ 
        error: 'Event is sold out',
        timestamp: new Date().toISOString()
      });
    }
    
    const ticketId = Math.floor(Math.random() * 100000) + 10000;
    const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    const timestamp = new Date().toISOString();
    
    // Create mock ticket with sanitized data
    const ticket: MockTicket = {
      ticketId,
      eventId,
      eventName: event.name,
      owner: sanitizedAddress,
      purchaseDate: timestamp,
      transactionHash,
      qrCode: `${eventId}-${ticketId}-${Date.now()}`,
      section: "A",
      row: Math.floor(Math.random() * 20) + 1,
      seat: Math.floor(Math.random() * 30) + 1,
      venue: event.venue,
      date: event.date,
      time: event.time
    };
    
    mockTickets.push(ticket);
    
    res.status(201).json({
      success: true,
      ticketId,
      transactionHash,
      ticket,
      timestamp
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user tickets with validation
app.get('/tickets/:address', (req, res) => {
  const address = req.params.address;
  
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ 
      error: 'Valid address required',
      timestamp: new Date().toISOString()
    });
  }
  
  const sanitizedAddress = sanitizeString(address);
  const userTickets = mockTickets.filter(
    t => t.owner.toLowerCase() === sanitizedAddress.toLowerCase()
  );
  
  res.json({
    tickets: userTickets,
    count: userTickets.length,
    timestamp: new Date().toISOString()
  });
});

// Verify ticket with dynamic QR (10-second refresh) and validation
app.post('/verify-ticket', (req, res) => {
  try {
    const { eventId, ticketId, signature } = req.body;
    
    // Basic validation
    if (eventId && !isValidEventId(eventId)) {
      return res.status(400).json({
        error: 'Invalid event ID',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate rotating QR data every 10 seconds
    const currentTime = Math.floor(Date.now() / 10000) * 10000;
    const qrData = `${eventId || 1}-${ticketId || 12345}-${currentTime}`;
    const nextRefresh = currentTime + 10000;
    
    res.json({
      valid: true,
      eventName: "Demo Concert",
      ticketId: ticketId || "12345",
      owner: "0x1234567890123456789012345678901234567890",
      section: "A",
      row: "5",
      seat: "12",
      zone: "General Admission",
      qrCode: qrData,
      nextRefresh,
      timestamp: new Date().toISOString(),
      expiresIn: Math.floor((nextRefresh - Date.now()) / 1000)
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BookByBlock Backend v2.0 running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs: http://localhost:${PORT}/`);
  console.log(`🔒 Security: Enhanced with input validation and rate limiting`);
});
