# 🔑 BookByBlock API Setup Guide - Step by Step

**Copy this prompt to ChatGPT to get guided through API setup:**

---

**PROMPT FOR CHATGPT:**

```
I need help setting up API keys for my BookByBlock Web3 ticketing platform. Please guide me step-by-step through getting these exact APIs:

1. ALCHEMY API KEY (Blockchain Access)
   - Website: alchemy.com
   - Chain: Polygon PoS
   - Network: Polygon Amoy (testnet)
   - Method: JSON-RPC
   - What I need: The full API URL that looks like https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY

2. METAMASK WALLET SETUP
   - Install MetaMask browser extension
   - Create new wallet
   - Add Polygon Amoy testnet network with these details:
     * Network Name: Polygon Amoy
     * RPC URL: https://rpc-amoy.polygon.technology
     * Chain ID: 80002
     * Currency Symbol: MATIC
     * Block Explorer: https://amoy.polygonscan.com
   - Export private key (starts with 0x...)

3. FREE TEST MATIC TOKENS
   - Get free testnet MATIC from Polygon faucet
   - Faucet URL: faucet.polygon.technology
   - Select Amoy network
   - Need my wallet address to get tokens

Please walk me through each step one by one, wait for my confirmation before moving to the next step. Ask me to share screenshots if needed to verify I'm doing it correctly.

After I get all APIs, help me create the .env file with:
- ALCHEMY_API_URL=
- PRIVATE_KEY=
- SIGNING_SECRET= (random string)
- JWT_SECRET= (random string)

My goal is to deploy BookByBlock smart contracts to Polygon Amoy testnet and run a live demo.
```

---

**COPY THE ABOVE PROMPT TO CHATGPT AND IT WILL GUIDE YOU STEP BY STEP!**

This will give you:
✅ Personalized guidance
✅ Screenshot verification  
✅ Error troubleshooting
✅ Step-by-step confirmation
✅ Complete .env file setup

Once you have all the API keys, come back and we'll deploy the contracts! 🚀
