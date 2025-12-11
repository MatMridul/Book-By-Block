# 🚀 BookByBlock Deployment Guide

## 🏃‍♂️ **Quick Start (5 minutes)**

### **1. Environment Setup**
```bash
# Clone and setup
git clone https://github.com/your-username/bookbyblock.git
cd bookbyblock
./setup.sh

# Copy environment file
cp .env.example .env
```

### **2. Get API Keys (Free)**
```bash
# Alchemy (Polygon RPC)
# 1. Go to https://alchemy.com
# 2. Create account → Create App → Polygon Mumbai
# 3. Copy API URL to .env

# Wallet Setup
# 1. Install MetaMask
# 2. Create wallet → Export private key
# 3. Add to .env (NEVER commit this!)

# Get testnet MATIC (Free)
# 1. Go to https://faucet.polygon.technology
# 2. Enter your wallet address
# 3. Get free test MATIC
```

### **3. Start Development**
```bash
# Option 1: Docker (Recommended)
docker-compose up -d

# Option 2: Manual
npm run dev:all

# Deploy contracts
npm run deploy:testnet
```

### **4. Access Applications**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Scanner**: http://localhost:3002
- **API Docs**: http://localhost:3001/docs

---

## 🌐 **Production Deployment**

### **Frontend (Vercel - Free)**
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Deploy automatically

# 3. Set environment variables in Vercel:
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_BLOCKCHAIN_RPC=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
```

### **Backend (Railway/Render - Free)**
```bash
# Railway deployment
# 1. Connect GitHub repo to Railway
# 2. Set environment variables
# 3. Deploy automatically

# Environment variables needed:
ALCHEMY_API_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
FACTORY_ADDRESS=0xDEPLOYED_CONTRACT_ADDRESS
SIGNING_SECRET=your-secret-key
```

### **Scanner (Netlify - Free)**
```bash
# 1. Build scanner
cd scanner && npm run build

# 2. Deploy to Netlify
# - Drag build folder to netlify.com
# - Or connect GitHub repo

# 3. Set environment:
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

---

## 🔧 **Environment Variables**

### **Required (.env)**
```bash
# Blockchain
ALCHEMY_API_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=0x_your_wallet_private_key
FACTORY_ADDRESS=0x_deployed_factory_address

# Security
SIGNING_SECRET=your-super-secret-signing-key-here
JWT_SECRET=your-jwt-secret

# API
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend.vercel.app
```

### **Optional (Advanced)**
```bash
# Database (for production scaling)
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
MIXPANEL_TOKEN=your-mixpanel-token

# Notifications
SENDGRID_API_KEY=your-sendgrid-key
SLACK_WEBHOOK=your-slack-webhook
```

---

## 📱 **Mobile PWA Setup**

### **Frontend PWA**
```bash
# Add to public/manifest.json
{
  "name": "BookByBlock",
  "short_name": "BookByBlock",
  "description": "Web3 Anti-Scalping Ticketing",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0D0D0D",
  "theme_color": "#7C3AED",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### **Scanner PWA**
```bash
# Optimized for mobile scanning
# - Camera permissions
# - Fullscreen mode
# - Offline capability
# - Install prompt
```

---

## 🔐 **Security Checklist**

### **Smart Contracts**
- ✅ OpenZeppelin audited contracts
- ✅ Reentrancy protection
- ✅ Access control modifiers
- ✅ Gas optimization
- ✅ Event logging

### **Backend API**
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ Secure headers

### **Frontend**
- ✅ Environment variables
- ✅ XSS protection
- ✅ HTTPS enforcement
- ✅ Content Security Policy

### **Keys & Secrets**
- ✅ Never commit private keys
- ✅ Use environment variables
- ✅ Rotate signing secrets
- ✅ Separate dev/prod keys

---

## 📊 **Monitoring & Analytics**

### **Blockchain Monitoring**
```bash
# Contract events
- EventCreated
- TicketMinted
- TicketBurned
- TicketTransferred

# Metrics to track
- Gas usage per transaction
- Transaction success rate
- Average confirmation time
```

### **API Monitoring**
```bash
# Health checks
GET /health

# Key metrics
- Response times
- Error rates
- QR generation speed
- Verification success rate
```

### **User Analytics**
```bash
# Frontend metrics
- Page views
- Conversion rates
- Mobile vs desktop
- QR scan success rate
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

**"Transaction failed"**
```bash
# Check wallet has testnet MATIC
# Verify contract address is correct
# Check gas price settings
```

**"QR scanner not working"**
```bash
# Enable camera permissions
# Use HTTPS (required for camera)
# Try manual input fallback
```

**"API connection failed"**
```bash
# Check CORS settings
# Verify API URL in frontend
# Check backend health endpoint
```

**"Contract not found"**
```bash
# Redeploy contracts
# Update FACTORY_ADDRESS in .env
# Verify network (localhost vs testnet)
```

---

## 🚀 **Performance Optimization**

### **Frontend**
- Image optimization
- Code splitting
- Lazy loading
- Service worker caching

### **Backend**
- Response caching
- Database indexing
- Connection pooling
- Rate limiting

### **Blockchain**
- Gas optimization
- Batch transactions
- Event filtering
- RPC caching

---

## 📈 **Scaling Considerations**

### **Traffic Growth**
- CDN for static assets
- Load balancing
- Database sharding
- Microservices architecture

### **Blockchain Scaling**
- Layer 2 solutions (Polygon)
- State channels
- Sidechains
- Cross-chain bridges

---

## 🎯 **Production Checklist**

### **Pre-Launch**
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Monitoring setup
- [ ] Backup procedures
- [ ] Documentation complete

### **Launch Day**
- [ ] DNS configured
- [ ] SSL certificates
- [ ] Environment variables set
- [ ] Database migrations
- [ ] Contract verification
- [ ] Team notifications

### **Post-Launch**
- [ ] Monitor error rates
- [ ] Track user metrics
- [ ] Collect feedback
- [ ] Plan iterations
- [ ] Scale infrastructure

---

**Ready for production! 🌟**
