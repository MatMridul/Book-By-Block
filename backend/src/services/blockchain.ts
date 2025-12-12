import { ethers } from 'ethers';
import { EventFactory__factory, Ticket__factory } from '../types/contracts';

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private factory: ethers.Contract;

  constructor() {
    if (!process.env.ALCHEMY_API_URL) {
      throw new Error('ALCHEMY_API_URL environment variable is required');
    }
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    if (!process.env.FACTORY_ADDRESS) {
      throw new Error('FACTORY_ADDRESS environment variable is required');
    }

    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.ALCHEMY_API_URL
    );
    
    this.signer = new ethers.Wallet(
      process.env.PRIVATE_KEY!,
      this.provider
    );
    
    this.factory = new ethers.Contract(
      process.env.FACTORY_ADDRESS!,
      EventFactory__factory.abi,
      this.signer
    );
  }

  async createEvent(
    name: string,
    symbol: string,
    basePrice: string,
    totalSupply: number
  ) {
    const tx = await this.factory.createEvent(
      name,
      symbol,
      ethers.utils.parseEther(basePrice),
      totalSupply
    );
    
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'EventCreated');
    
    return {
      eventId: event.args.eventId.toString(),
      ticketContract: event.args.ticketContract,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  }

  async mintTicket(eventId: string, buyerAddress: string, basePrice: string) {
    const tx = await this.factory.mintTicket(eventId, buyerAddress, {
      value: ethers.utils.parseEther(basePrice)
    });
    
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'TicketMinted');
    
    return {
      tokenId: event.args.tokenId.toString(),
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  async getTicketInfo(ticketContract: string, tokenId: string) {
    const ticket = new ethers.Contract(
      ticketContract,
      Ticket__factory.abi,
      this.provider
    );
    
    try {
      const [owner, resales, lastPrice, exists] = await ticket.getTicketInfo(tokenId);
      
      return {
        owner,
        resales: resales.toString(),
        lastPrice: ethers.utils.formatEther(lastPrice),
        exists,
        burned: !exists
      };
    } catch (error) {
      return { exists: false, burned: true };
    }
  }

  async burnTicket(eventId: string, tokenId: string) {
    const tx = await this.factory.useTicket(eventId, tokenId);
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  }

  async getEventStats(eventId: string) {
    const [totalSupply, soldCount, availableCount, soldOut] = 
      await this.factory.getEventStats(eventId);
    
    return {
      totalSupply: totalSupply.toString(),
      soldCount: soldCount.toString(),
      availableCount: availableCount.toString(),
      soldOut
    };
  }

  async getEvent(eventId: string) {
    const event = await this.factory.getEvent(eventId);
    
    return {
      eventId: event.eventId.toString(),
      name: event.name,
      ticketContract: event.ticketContract,
      basePrice: ethers.utils.formatEther(event.basePrice),
      totalSupply: event.totalSupply.toString(),
      soldCount: event.soldCount.toString(),
      active: event.active,
      creator: event.creator,
      createdAt: new Date(event.createdAt.toNumber() * 1000).toISOString()
    };
  }

  async getAllEvents() {
    const totalEvents = await this.factory.getTotalEvents();
    const events = [];
    
    for (let i = 1; i <= totalEvents.toNumber(); i++) {
      try {
        const event = await this.getEvent(i.toString());
        events.push(event);
      } catch (error) {
        console.error(`Failed to load event ${i}:`, error);
      }
    }
    
    return events;
  }

  async getTotalEvents() {
    return await this.factory.getTotalEvents();
  }
}
