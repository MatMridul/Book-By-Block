const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BookByBlock Platform", function () {
  let factory, ticket;
  let owner, creator, buyer1, buyer2, scanner;
  let eventId, ticketContract;
  
  const basePrice = ethers.utils.parseEther("0.01");
  const totalSupply = 100;
  
  beforeEach(async function () {
    [owner, creator, buyer1, buyer2, scanner] = await ethers.getSigners();
    
    // Deploy EventFactory
    const EventFactory = await ethers.getContractFactory("EventFactory");
    factory = await EventFactory.deploy(owner.address);
    await factory.deployed();
    
    // Create test event
    const tx = await factory.connect(creator).createEvent(
      "Test Concert",
      "CONCERT",
      basePrice,
      totalSupply
    );
    
    const receipt = await tx.wait();
    const eventCreatedEvent = receipt.events?.find(e => e.event === "EventCreated");
    eventId = eventCreatedEvent.args.eventId;
    ticketContract = eventCreatedEvent.args.ticketContract;
    
    // Get Ticket contract instance
    const Ticket = await ethers.getContractFactory("Ticket");
    ticket = Ticket.attach(ticketContract);
  });
  
  describe("Event Creation", function () {
    it("Should create event with correct parameters", async function () {
      const event = await factory.getEvent(eventId);
      
      expect(event.name).to.equal("Test Concert");
      expect(event.basePrice).to.equal(basePrice);
      expect(event.totalSupply).to.equal(totalSupply);
      expect(event.creator).to.equal(creator.address);
      expect(event.active).to.be.true;
    });
    
    it("Should track creator events", async function () {
      const creatorEvents = await factory.getCreatorEvents(creator.address);
      expect(creatorEvents).to.include(eventId);
    });
  });
  
  describe("Ticket Minting", function () {
    it("Should mint ticket with correct payment", async function () {
      await expect(
        factory.connect(buyer1).mintTicket(eventId, buyer1.address, {
          value: basePrice
        })
      ).to.emit(factory, "TicketMinted");
      
      expect(await ticket.ownerOf(1)).to.equal(buyer1.address);
      expect(await ticket.totalSupply()).to.equal(1);
    });
    
    it("Should reject insufficient payment", async function () {
      await expect(
        factory.connect(buyer1).mintTicket(eventId, buyer1.address, {
          value: basePrice.div(2)
        })
      ).to.be.revertedWith("Insufficient payment");
    });
    
    it("Should update sold count", async function () {
      await factory.connect(buyer1).mintTicket(eventId, buyer1.address, {
        value: basePrice
      });
      
      const stats = await factory.getEventStats(eventId);
      expect(stats.soldCount).to.equal(1);
      expect(stats.availableCount).to.equal(99);
    });
  });
  
  describe("Anti-Scalping Features", function () {
    beforeEach(async function () {
      // Mint ticket to buyer1
      await factory.connect(buyer1).mintTicket(eventId, buyer1.address, {
        value: basePrice
      });
    });
    
    it("Should allow controlled resale within markup limit", async function () {
      const resalePrice = basePrice.mul(110).div(100); // 10% markup
      
      await expect(
        factory.connect(buyer1).resaleTicket(eventId, 1, buyer2.address, {
          value: resalePrice
        })
      ).to.emit(factory, "TicketResold");
      
      expect(await ticket.ownerOf(1)).to.equal(buyer2.address);
    });
    
    it("Should reject excessive markup", async function () {
      const excessivePrice = basePrice.mul(150).div(100); // 50% markup
      
      await expect(
        factory.connect(buyer1).resaleTicket(eventId, 1, buyer2.address, {
          value: excessivePrice
        })
      ).to.be.revertedWith("Price exceeds markup limit");
    });
    
    it("Should track resale count", async function () {
      const resalePrice = basePrice.mul(110).div(100);
      
      // First resale
      await factory.connect(buyer1).resaleTicket(eventId, 1, buyer2.address, {
        value: resalePrice
      });
      
      let ticketInfo = await ticket.getTicketInfo(1);
      expect(ticketInfo.resales).to.equal(1);
      
      // Second resale
      await factory.connect(buyer2).resaleTicket(eventId, 1, buyer1.address, {
        value: resalePrice
      });
      
      ticketInfo = await ticket.getTicketInfo(1);
      expect(ticketInfo.resales).to.equal(2);
    });
    
    it("Should prevent direct transfers", async function () {
      await expect(
        ticket.connect(buyer1).transferFrom(buyer1.address, buyer2.address, 1)
      ).to.be.revertedWith("Use controlled transfer only");
    });
  });
  
  describe("Ticket Usage", function () {
    beforeEach(async function () {
      await factory.connect(buyer1).mintTicket(eventId, buyer1.address, {
        value: basePrice
      });
    });
    
    it("Should allow owner to use ticket", async function () {
      await expect(
        factory.connect(buyer1).useTicket(eventId, 1)
      ).to.emit(factory, "TicketUsed");
      
      // Ticket should be burned
      await expect(ticket.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
    });
    
    it("Should allow platform owner to burn ticket", async function () {
      await expect(
        factory.connect(owner).useTicket(eventId, 1)
      ).to.emit(factory, "TicketUsed");
    });
    
    it("Should reject unauthorized burn", async function () {
      await expect(
        factory.connect(buyer2).useTicket(eventId, 1)
      ).to.be.revertedWith("Not authorized to use ticket");
    });
  });
  
  describe("Platform Fees", function () {
    it("Should collect platform fees on minting", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await factory.connect(buyer1).mintTicket(eventId, buyer1.address, {
        value: basePrice
      });
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      const expectedFee = basePrice.mul(250).div(10000); // 2.5% fee
      
      expect(finalBalance.sub(initialBalance)).to.equal(expectedFee);
    });
  });
  
  describe("Gas Optimization", function () {
    it("Should have reasonable gas costs", async function () {
      const tx = await factory.connect(buyer1).mintTicket(eventId, buyer1.address, {
        value: basePrice
      });
      
      const receipt = await tx.wait();
      console.log("Mint gas used:", receipt.gasUsed.toString());
      
      // Should be under 200k gas
      expect(receipt.gasUsed.lt(200000)).to.be.true;
    });
  });
});
