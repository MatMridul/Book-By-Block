// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Ticket.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EventFactory
 * @dev Factory contract for creating and managing BookByBlock events
 * Handles event creation, ticket minting, and controlled resales
 */
contract EventFactory is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _eventIds;
    
    struct Event {
        uint256 eventId;
        string name;
        address ticketContract;
        uint256 basePrice;
        uint256 totalSupply;
        uint256 soldCount;
        bool active;
        address creator;
        uint256 createdAt;
    }
    
    // Events storage
    mapping(uint256 => Event) public events;
    mapping(address => uint256[]) public creatorEvents;
    
    // Platform fee (in basis points, 250 = 2.5%)
    uint256 public platformFee = 250;
    address public feeRecipient;
    
    // Events for transparency
    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed ticketContract,
        uint256 basePrice,
        address indexed creator
    );
    
    event TicketMinted(
        uint256 indexed eventId,
        address indexed ticketContract,
        uint256 indexed tokenId,
        address buyer,
        uint256 price
    );
    
    event TicketResold(
        uint256 indexed eventId,
        address indexed ticketContract,
        uint256 indexed tokenId,
        address from,
        address to,
        uint256 price
    );
    
    event TicketUsed(
        uint256 indexed eventId,
        address indexed ticketContract,
        uint256 indexed tokenId,
        address owner
    );
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create new event with ticket contract
     */
    function createEvent(
        string memory name,
        string memory symbol,
        uint256 basePrice,
        uint256 totalSupply
    ) external returns (uint256 eventId, address ticketContract) {
        require(bytes(name).length > 0, "Event name required");
        require(basePrice > 0, "Base price must be > 0");
        require(totalSupply > 0, "Total supply must be > 0");
        
        _eventIds.increment();
        eventId = _eventIds.current();
        
        // Deploy new Ticket contract
        Ticket ticket = new Ticket(name, symbol, basePrice, address(this));
        ticketContract = address(ticket);
        
        // Store event data
        events[eventId] = Event({
            eventId: eventId,
            name: name,
            ticketContract: ticketContract,
            basePrice: basePrice,
            totalSupply: totalSupply,
            soldCount: 0,
            active: true,
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        creatorEvents[msg.sender].push(eventId);
        
        emit EventCreated(eventId, name, ticketContract, basePrice, msg.sender);
        
        return (eventId, ticketContract);
    }
    
    /**
     * @dev Mint ticket for event
     */
    function mintTicket(uint256 eventId, address to) external payable nonReentrant {
        Event storage evt = events[eventId];
        require(evt.active, "Event not active");
        require(evt.soldCount < evt.totalSupply, "Event sold out");
        require(msg.value >= evt.basePrice, "Insufficient payment");
        
        // Calculate platform fee
        uint256 fee = (msg.value * platformFee) / 10000;
        uint256 creatorAmount = msg.value - fee;
        
        // Mint ticket
        Ticket ticket = Ticket(evt.ticketContract);
        uint256 tokenId = ticket.mint(to);
        
        // Update sold count
        evt.soldCount++;
        
        // Transfer payments
        if (fee > 0) {
            payable(feeRecipient).transfer(fee);
        }
        payable(evt.creator).transfer(creatorAmount);
        
        // Refund excess payment
        if (msg.value > evt.basePrice) {
            payable(msg.sender).transfer(msg.value - evt.basePrice);
        }
        
        emit TicketMinted(eventId, evt.ticketContract, tokenId, to, evt.basePrice);
    }
    
    /**
     * @dev Controlled resale through platform
     */
    function resaleTicket(
        uint256 eventId,
        uint256 tokenId,
        address to,
        uint256 salePrice
    ) external payable nonReentrant {
        Event storage evt = events[eventId];
        require(evt.active, "Event not active");
        require(msg.value >= salePrice, "Insufficient payment");
        
        Ticket ticket = Ticket(evt.ticketContract);
        require(ticket.ownerOf(tokenId) == msg.sender, "Not token owner");
        
        // Calculate fees
        uint256 platformFeeAmount = (salePrice * platformFee) / 10000;
        uint256 sellerAmount = salePrice - platformFeeAmount;
        
        // Execute controlled transfer
        ticket.controlledTransferFrom(msg.sender, to, tokenId, salePrice);
        
        // Transfer payments
        if (platformFeeAmount > 0) {
            payable(feeRecipient).transfer(platformFeeAmount);
        }
        payable(msg.sender).transfer(sellerAmount);
        
        // Refund excess
        if (msg.value > salePrice) {
            payable(msg.sender).transfer(msg.value - salePrice);
        }
        
        emit TicketResold(eventId, evt.ticketContract, tokenId, msg.sender, to, salePrice);
    }
    
    /**
     * @dev Burn ticket on entry (for scanner/backend)
     */
    function useTicket(uint256 eventId, uint256 tokenId) external {
        Event storage evt = events[eventId];
        require(evt.active, "Event not active");
        
        Ticket ticket = Ticket(evt.ticketContract);
        address owner = ticket.ownerOf(tokenId);
        
        // Only owner or platform can burn
        require(
            msg.sender == owner || msg.sender == this.owner(),
            "Not authorized to use ticket"
        );
        
        ticket.burnByFactory(tokenId);
        
        emit TicketUsed(eventId, evt.ticketContract, tokenId, owner);
    }
    
    /**
     * @dev Admin functions
     */
    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _platformFee;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
    
    function toggleEventStatus(uint256 eventId) external {
        Event storage evt = events[eventId];
        require(
            msg.sender == evt.creator || msg.sender == owner(),
            "Not authorized"
        );
        evt.active = !evt.active;
    }
    
    /**
     * @dev View functions
     */
    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }
    
    function getCreatorEvents(address creator) external view returns (uint256[] memory) {
        return creatorEvents[creator];
    }
    
    function getTotalEvents() external view returns (uint256) {
        return _eventIds.current();
    }
    
    function getEventStats(uint256 eventId) external view returns (
        uint256 totalSupply,
        uint256 soldCount,
        uint256 availableCount,
        bool soldOut
    ) {
        Event storage evt = events[eventId];
        return (
            evt.totalSupply,
            evt.soldCount,
            evt.totalSupply - evt.soldCount,
            evt.soldCount >= evt.totalSupply
        );
    }
}
