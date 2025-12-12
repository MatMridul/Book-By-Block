import { ethers } from 'ethers';
import { EventFactory__factory, Ticket__factory } from '../types/contracts';

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private factory: ethers.Contract;

  constructor() {
    // Use flexible environment variable names for AWS deployment
    const rpcUrl = process.env.RPC_URL || process.env.ALCHEMY_API_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const factoryAddress = process.env.CONTRACT_ADDRESS || process.env.FACTORY_ADDRESS;

    if (!rpcUrl) {
      throw new Error('RPC_URL or ALCHEMY_API_URL environment variable is required');
    }
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    if (!factoryAddress) {
      throw new Error('CONTRACT_ADDRESS or FACTORY_ADDRESS environment variable is required');
    }

    // Optimize provider for Lambda with connection pooling
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
  }

  async createEvent(name: string, symbol: string, basePrice: string, totalSupply: number) {
    try {
      const tx = await this.factory.createEvent(
        name,
        symbol,
        ethers.utils.parseEther(basePrice),
        totalSupply,
        { gasLimit: 500000 }
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === 'EventCreated');
      
      return {
        eventId: event?.args?.eventId?.toString(),
        ticketContract: event?.args?.ticketContract,
        transactionHash: receipt.transactionHash
      };
    } catch (error: any) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async getAllEvents() {
    try {
      const totalEvents = await this.factory.getTotalEvents();
      const eventCount = totalEvents.toNumber();
      
      if (eventCount === 0) return [];
      
      // Batch requests for better Lambda performance
      const promises = [];
      for (let i = 0; i < eventCount; i++) {
        promises.push(this.factory.getEvent(i));
      }
      
      const results = await Promise.allSettled(promises);
      
      return results
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
          }
          return null;
        })
        .filter(Boolean);
    } catch (error: any) {
      throw new Error(`Failed to get events: ${error.message}`);
    }
  }

  async getEvent(eventId: number) {
    try {
      const event = await this.factory.getEvent(eventId);
      return {
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
    } catch (error: any) {
      throw new Error(`Failed to get event: ${error.message}`);
    }
  }

  async buyTicket(eventId: number, buyerAddress: string) {
    try {
      const event = await this.getEvent(eventId);
      const tx = await this.factory.mintTicket(eventId, buyerAddress, {
        value: ethers.utils.parseEther(event.basePrice),
        gasLimit: 300000
      });
      
      const receipt = await tx.wait();
      const mintEvent = receipt.events?.find((e: any) => e.event === 'TicketMinted');
      
      return {
        tokenId: mintEvent?.args?.tokenId?.toString(),
        ticketContract: event.ticketContract,
        transactionHash: receipt.transactionHash
      };
    } catch (error: any) {
      throw new Error(`Failed to buy ticket: ${error.message}`);
    }
  }

  async getTotalEvents() {
    try {
      const total = await this.factory.getTotalEvents();
      return total.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get total events: ${error.message}`);
    }
  }

  async getTicketInfo(ticketContract: string, tokenId: number) {
    try {
      const ticket = new ethers.Contract(
        ticketContract,
        Ticket__factory.abi,
        this.provider
      );
      
      const [owner, info] = await Promise.all([
        ticket.ownerOf(tokenId),
        ticket.getTicketInfo(tokenId)
      ]);
      
      return {
        owner,
        resales: info.resales.toNumber(),
        lastPrice: ethers.utils.formatEther(info.lastPrice),
        exists: info.exists
      };
    } catch (error: any) {
      throw new Error(`Failed to get ticket info: ${error.message}`);
    }
  }
}
