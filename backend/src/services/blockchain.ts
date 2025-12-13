import { ethers } from 'ethers';
import { EventFactory__factory, Ticket__factory } from '../types/contracts';

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private factory: ethers.Contract;

  constructor() {
    // Use flexible environment variable names
    const rpcUrl = process.env.RPC_URL || process.env.ALCHEMY_API_URL || 'https://polygon-rpc.com';
    const privateKey = process.env.PRIVATE_KEY;
    const factoryAddress = process.env.CONTRACT_ADDRESS || process.env.FACTORY_ADDRESS;

    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    if (!factoryAddress) {
      throw new Error('CONTRACT_ADDRESS or FACTORY_ADDRESS environment variable is required');
    }

    // Initialize provider with connection pooling
    this.provider = new ethers.providers.JsonRpcProvider({
      url: rpcUrl,
      timeout: 15000
    });
    
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
    this.factory = new ethers.Contract(
      factoryAddress,
      EventFactory__factory.abi,
      this.signer
    );

    console.log(`🔗 Blockchain service initialized`);
    console.log(`📡 RPC: ${rpcUrl}`);
    console.log(`🏭 Factory: ${factoryAddress}`);
    console.log(`👤 Signer: ${this.signer.address}`);
  }

  async createEvent(name: string, symbol: string, basePrice: string, totalSupply: number) {
    try {
      console.log(`Creating event: ${name} (${symbol}) - ${basePrice} MATIC x ${totalSupply}`);
      
      const tx = await this.factory.createEvent(
        name,
        symbol,
        ethers.utils.parseEther(basePrice),
        totalSupply,
        { gasLimit: 500000 }
      );
      
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      
      const event = receipt.events?.find((e: any) => e.event === 'EventCreated');
      
      if (!event) {
        throw new Error('EventCreated event not found in transaction receipt');
      }
      
      const result = {
        eventId: event.args?.eventId?.toString(),
        ticketContract: event.args?.ticketContract,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
      
      console.log(`Event created successfully:`, result);
      return result;
    } catch (error: any) {
      console.error('Create event error:', error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async getAllEvents() {
    try {
      const totalEvents = await this.factory.getTotalEvents();
      const eventCount = totalEvents.toNumber();
      
      console.log(`Fetching ${eventCount} events`);
      
      if (eventCount === 0) return [];
      
      // Batch requests for better performance
      const promises = [];
      for (let i = 0; i < eventCount; i++) {
        promises.push(this.factory.getEvent(i));
      }
      
      const results = await Promise.allSettled(promises);
      
      const events = results
        .map((result, index) => {
          if (result.status === 'fulfilled') {
            const event = result.value;
            return {
              eventId: index,
              name: event.name,
              ticketContract: event.ticketContract,
              basePrice: ethers.utils.formatEther(event.basePrice),
              totalSupply: event.totalSupply.toNumber(),
              soldCount: event.soldCount.toNumber(),
              active: event.active,
              creator: event.creator,
              createdAt: new Date(event.createdAt.toNumber() * 1000).toISOString()
            };
          } else {
            console.error(`Failed to fetch event ${index}:`, result.reason);
            return null;
          }
        })
        .filter(Boolean);
      
      console.log(`Successfully fetched ${events.length} events`);
      return events;
    } catch (error: any) {
      console.error('Get all events error:', error);
      throw new Error(`Failed to get events: ${error.message}`);
    }
  }

  async getEvent(eventId: number) {
    try {
      console.log(`Fetching event ${eventId}`);
      
      const event = await this.factory.getEvent(eventId);
      
      const result = {
        eventId,
        name: event.name,
        ticketContract: event.ticketContract,
        basePrice: ethers.utils.formatEther(event.basePrice),
        totalSupply: event.totalSupply.toNumber(),
        soldCount: event.soldCount.toNumber(),
        active: event.active,
        creator: event.creator,
        createdAt: new Date(event.createdAt.toNumber() * 1000).toISOString()
      };
      
      console.log(`Event ${eventId} fetched:`, result);
      return result;
    } catch (error: any) {
      console.error(`Get event ${eventId} error:`, error);
      throw new Error(`Failed to get event: ${error.message}`);
    }
  }

  async buyTicket(eventId: number, buyerAddress: string) {
    try {
      console.log(`Buying ticket for event ${eventId}, buyer: ${buyerAddress}`);
      
      const event = await this.getEvent(eventId);
      
      const tx = await this.factory.mintTicket(eventId, buyerAddress, {
        value: ethers.utils.parseEther(event.basePrice),
        gasLimit: 300000
      });
      
      console.log(`Mint transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Mint transaction confirmed in block: ${receipt.blockNumber}`);
      
      const mintEvent = receipt.events?.find((e: any) => e.event === 'TicketMinted');
      
      if (!mintEvent) {
        throw new Error('TicketMinted event not found in transaction receipt');
      }
      
      const result = {
        tokenId: mintEvent.args?.tokenId?.toString(),
        ticketContract: event.ticketContract,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        buyer: buyerAddress,
        price: event.basePrice
      };
      
      console.log(`Ticket purchased successfully:`, result);
      return result;
    } catch (error: any) {
      console.error(`Buy ticket error:`, error);
      throw new Error(`Failed to buy ticket: ${error.message}`);
    }
  }

  async getTotalEvents() {
    try {
      const total = await this.factory.getTotalEvents();
      const count = total.toNumber();
      console.log(`Total events: ${count}`);
      return count;
    } catch (error: any) {
      console.error('Get total events error:', error);
      throw new Error(`Failed to get total events: ${error.message}`);
    }
  }

  async getTicketInfo(ticketContract: string, tokenId: number) {
    try {
      console.log(`Getting ticket info: ${ticketContract}#${tokenId}`);
      
      const ticket = new ethers.Contract(
        ticketContract,
        Ticket__factory.abi,
        this.provider
      );
      
      const [owner, info] = await Promise.all([
        ticket.ownerOf(tokenId),
        ticket.getTicketInfo(tokenId)
      ]);
      
      const result = {
        owner,
        resales: info.resales.toNumber(),
        lastPrice: ethers.utils.formatEther(info.lastPrice),
        exists: info.exists
      };
      
      console.log(`Ticket info:`, result);
      return result;
    } catch (error: any) {
      console.error(`Get ticket info error:`, error);
      
      // If token doesn't exist, return default values
      if (error.message.includes('ERC721: invalid token ID') || error.message.includes('nonexistent token')) {
        return {
          owner: ethers.constants.AddressZero,
          resales: 0,
          lastPrice: '0',
          exists: false
        };
      }
      
      throw new Error(`Failed to get ticket info: ${error.message}`);
    }
  }

  async burnTicket(eventId: number, tokenId: number) {
    try {
      console.log(`Burning ticket: event ${eventId}, token ${tokenId}`);
      
      const tx = await this.factory.useTicket(eventId, tokenId, {
        gasLimit: 200000
      });
      
      console.log(`Burn transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Burn transaction confirmed in block: ${receipt.blockNumber}`);
      
      const result = {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
      
      console.log(`Ticket burned successfully:`, result);
      return result;
    } catch (error: any) {
      console.error(`Burn ticket error:`, error);
      throw new Error(`Failed to burn ticket: ${error.message}`);
    }
  }
}
