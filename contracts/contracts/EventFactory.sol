// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EventFactory
 * @dev Factory contract for creating and managing NFT ticket events
 * @notice This contract creates and manages ticketing events with NFT-based tickets
 * @custom:security-contact security@bookbyblock.com
 */
contract EventFactory is Ownable, ReentrancyGuard, Pausable {
    uint256 private _eventIds;
    uint256 public constant MAX_EVENTS_PER_CREATOR = 100;
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 250; // 2.5%
    uint256 public constant MAX_TICKET_SUPPLY = 100000;
    
    constructor() Ownable(msg.sender) {}

    enum EventType { 
        CONCERT, 
        SPORTS, 
        CONFERENCE, 
        THEATER, 
        FESTIVAL, 
        OTHER 
    }

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
        EventType eventType;
        string venue;
        string description;
        uint256 eventDate;
    }

    struct SeatInfo {
        string section;
        string row;
        string seat;
        string zone;
    }

    mapping(uint256 => Event) public events;
    mapping(address => uint256[]) public creatorEvents;
    mapping(address => uint256) public creatorEventCount;
    
    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed creator,
        address ticketContract,
        uint256 basePrice,
        uint256 totalSupply
    );
    
    event TicketPurchased(
        uint256 indexed eventId,
        address indexed buyer,
        uint256 tokenId,
        uint256 price
    );

    event EventStatusChanged(
        uint256 indexed eventId,
        bool active
    );

    modifier validEventId(uint256 eventId) {
        require(eventId > 0 && eventId <= _eventIds, "Invalid event ID");
        _;
    }

    modifier onlyEventCreatorOrOwner(uint256 eventId) {
        require(
            msg.sender == events[eventId].creator || msg.sender == owner(),
            "Only creator or owner"
        );
        _;
    }

    /**
     * @dev Creates a new ticketing event with comprehensive validation
     */
    function createEvent(
        string memory name,
        uint256 basePrice,
        uint256 totalSupply,
        EventType eventType,
        string memory venue,
        string memory description,
        uint256 eventDate
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(bytes(name).length > 0 && bytes(name).length <= 100, "Invalid name length");
        require(basePrice > 0, "Price must be > 0");
        require(totalSupply > 0 && totalSupply <= MAX_TICKET_SUPPLY, "Invalid supply");
        require(eventDate > block.timestamp, "Event date must be future");
        require(creatorEventCount[msg.sender] < MAX_EVENTS_PER_CREATOR, "Too many events");
        require(bytes(venue).length > 0 && bytes(venue).length <= 200, "Invalid venue");
        
        _eventIds++;
        uint256 eventId = _eventIds;
        
        // Deploy new TicketNFT contract
        TicketNFT ticketContract = new TicketNFT(
            string(abi.encodePacked("Ticket-", name)),
            "TKT",
            eventId,
            totalSupply,
            address(this)
        );
        
        events[eventId] = Event({
            eventId: eventId,
            name: name,
            ticketContract: address(ticketContract),
            basePrice: basePrice,
            totalSupply: totalSupply,
            soldCount: 0,
            active: true,
            creator: msg.sender,
            createdAt: block.timestamp,
            eventType: eventType,
            venue: venue,
            description: description,
            eventDate: eventDate
        });
        
        creatorEvents[msg.sender].push(eventId);
        creatorEventCount[msg.sender]++;
        
        emit EventCreated(eventId, name, msg.sender, address(ticketContract), basePrice, totalSupply);
        
        return eventId;
    }

    /**
     * @dev Purchase a ticket with enhanced security checks
     */
    function buyTicket(
        uint256 eventId, 
        SeatInfo memory seatInfo
    ) external payable nonReentrant whenNotPaused validEventId(eventId) {
        Event storage eventData = events[eventId];
        require(eventData.active, "Event not active");
        require(eventData.soldCount < eventData.totalSupply, "Sold out");
        require(msg.value >= eventData.basePrice, "Insufficient payment");
        require(eventData.eventDate > block.timestamp, "Event occurred");
        require(msg.sender != eventData.creator, "Creator cannot buy own tickets");
        
        TicketNFT ticketContract = TicketNFT(eventData.ticketContract);
        uint256 tokenId = ticketContract.mintTicket(msg.sender, seatInfo);
        
        eventData.soldCount++;
        
        // Calculate fees
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENTAGE) / 10000;
        uint256 creatorAmount = msg.value - platformFee;
        
        // Transfer payments
        (bool success1, ) = payable(eventData.creator).call{value: creatorAmount}("");
        require(success1, "Creator payment failed");
        
        (bool success2, ) = payable(owner()).call{value: platformFee}("");
        require(success2, "Platform fee failed");
        
        emit TicketPurchased(eventId, msg.sender, tokenId, msg.value);
    }

    /**
     * @dev Get event details with validation
     */
    function getEvent(uint256 eventId) external view validEventId(eventId) returns (Event memory) {
        return events[eventId];
    }

    /**
     * @dev Get events by creator
     */
    function getEventsByCreator(address creator) external view returns (uint256[] memory) {
        return creatorEvents[creator];
    }

    /**
     * @dev Toggle event status with proper authorization
     */
    function toggleEventStatus(uint256 eventId) external validEventId(eventId) onlyEventCreatorOrOwner(eventId) {
        events[eventId].active = !events[eventId].active;
        emit EventStatusChanged(eventId, events[eventId].active);
    }

    /**
     * @dev Emergency functions
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get total events count
     */
    function getTotalEvents() external view returns (uint256) {
        return _eventIds;
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}

/**
 * @title TicketNFT
 * @dev NFT contract for individual event tickets with enhanced security
 */
contract TicketNFT is ERC721, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    uint256 public immutable eventId;
    uint256 public immutable maxSupply;
    address public immutable factory;
    
    struct TicketInfo {
        uint256 tokenId;
        uint256 eventId;
        address owner;
        string section;
        string row;
        string seat;
        string zone;
        uint256 mintedAt;
        bool used;
    }
    
    mapping(uint256 => TicketInfo) public ticketInfo;
    mapping(uint256 => bool) public usedTickets;
    mapping(string => bool) private seatTaken; // section-row-seat => taken
    
    event TicketMinted(uint256 indexed tokenId, address indexed owner, uint256 eventId);
    event TicketUsed(uint256 indexed tokenId, address indexed verifier);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 _eventId,
        uint256 _maxSupply,
        address _factory
    ) ERC721(name, symbol) Ownable(msg.sender) {
        eventId = _eventId;
        maxSupply = _maxSupply;
        factory = _factory;
    }

    /**
     * @dev Mint ticket with seat validation
     */
    function mintTicket(
        address to, 
        EventFactory.SeatInfo memory seatInfo
    ) external onlyFactory nonReentrant returns (uint256) {
        require(_tokenIds < maxSupply, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        
        // Check seat availability for specific events
        string memory seatKey = string(abi.encodePacked(
            seatInfo.section, "-", seatInfo.row, "-", seatInfo.seat
        ));
        
        if (bytes(seatInfo.seat).length > 0) {
            require(!seatTaken[seatKey], "Seat taken");
            seatTaken[seatKey] = true;
        }
        
        _tokenIds++;
        uint256 tokenId = _tokenIds;
        
        _safeMint(to, tokenId);
        
        ticketInfo[tokenId] = TicketInfo({
            tokenId: tokenId,
            eventId: eventId,
            owner: to,
            section: seatInfo.section,
            row: seatInfo.row,
            seat: seatInfo.seat,
            zone: seatInfo.zone,
            mintedAt: block.timestamp,
            used: false
        });
        
        emit TicketMinted(tokenId, to, eventId);
        
        return tokenId;
    }

    /**
     * @dev Use ticket with proper authorization
     */
    function useTicket(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Token not exists");
        require(
            ownerOf(tokenId) == msg.sender || 
            getApproved(tokenId) == msg.sender || 
            isApprovedForAll(ownerOf(tokenId), msg.sender),
            "Not authorized"
        );
        require(!usedTickets[tokenId], "Already used");
        
        usedTickets[tokenId] = true;
        ticketInfo[tokenId].used = true;
        
        emit TicketUsed(tokenId, msg.sender);
    }

    /**
     * @dev Get ticket information
     */
    function getTicketInfo(uint256 tokenId) external view returns (TicketInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Token not exists");
        return ticketInfo[tokenId];
    }

    /**
     * @dev Check ticket validity
     */
    function isTicketValid(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0) && !usedTickets[tokenId];
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Prevent transfer of used tickets
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        if (tokenId != 0 && usedTickets[tokenId]) {
            revert("Cannot transfer used ticket");
        }
        return super._update(to, tokenId, auth);
    }
}
