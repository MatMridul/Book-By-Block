// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EventFactory is Ownable {
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
        EventType eventType; // NEW: Movie, Concert, Sports, etc.
        string venue; // NEW: Venue information
    }

    struct SeatInfo {
        string section; // "VIP", "General", "Section A"
        string row;     // "Row 1", "Row A", etc.
        string seat;    // "Seat 15", "Standing", etc.
        string zone;    // "Zone 1", "Floor", "Balcony"
    }

    enum EventType { Concert, Movie, Sports, Conference }

    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(uint256 => SeatInfo)) public ticketSeats; // eventId => tokenId => SeatInfo
    mapping(uint256 => mapping(string => mapping(string => mapping(string => bool)))) public seatTaken; // eventId => section => row => seat => taken

    event EventCreated(uint256 indexed eventId, string name, address indexed ticketContract, uint256 basePrice, address indexed creator);
    event TicketMinted(uint256 indexed eventId, address indexed ticketContract, uint256 indexed tokenId, address buyer, uint256 price, string seatInfo);
    event TicketUsed(uint256 indexed eventId, address indexed ticketContract, uint256 indexed tokenId, address owner);

    function createEvent(
        string memory name,
        string memory symbol,
        uint256 basePrice,
        uint256 totalSupply,
        EventType eventType,
        string memory venue
    ) external returns (uint256 eventId, address ticketContract) {
        _eventIds.increment();
        eventId = _eventIds.current();

        // Deploy new ticket contract for this event
        TicketNFT newTicketContract = new TicketNFT(name, symbol, address(this));
        ticketContract = address(newTicketContract);

        events[eventId] = Event({
            eventId: eventId,
            name: name,
            ticketContract: ticketContract,
            basePrice: basePrice,
            totalSupply: totalSupply,
            soldCount: 0,
            active: true,
            creator: msg.sender,
            createdAt: block.timestamp,
            eventType: eventType,
            venue: venue
        });

        emit EventCreated(eventId, name, ticketContract, basePrice, msg.sender);
    }

    function mintTicketWithSeat(
        uint256 eventId,
        address to,
        string memory section,
        string memory row,
        string memory seat,
        string memory zone
    ) external payable returns (uint256 tokenId) {
        Event storage eventInfo = events[eventId];
        require(eventInfo.active, "Event not active");
        require(eventInfo.soldCount < eventInfo.totalSupply, "Event sold out");
        require(msg.value >= eventInfo.basePrice, "Insufficient payment");

        // For movies/sports with specific seats, check if seat is available
        if (eventInfo.eventType == EventType.Movie || eventInfo.eventType == EventType.Sports) {
            require(!seatTaken[eventId][section][row][seat], "Seat already taken");
            seatTaken[eventId][section][row][seat] = true;
        }

        // Mint NFT ticket
        TicketNFT ticketContract = TicketNFT(eventInfo.ticketContract);
        tokenId = ticketContract.mintTicket(to);

        // Store seat information
        ticketSeats[eventId][tokenId] = SeatInfo({
            section: section,
            row: row,
            seat: seat,
            zone: zone
        });

        eventInfo.soldCount++;

        string memory seatInfo = string(abi.encodePacked(section, "-", row, "-", seat));
        emit TicketMinted(eventId, eventInfo.ticketContract, tokenId, to, msg.value, seatInfo);
    }

    function getTicketSeatInfo(uint256 eventId, uint256 tokenId) 
        external view returns (string memory section, string memory row, string memory seat, string memory zone) {
        SeatInfo memory seatInfo = ticketSeats[eventId][tokenId];
        return (seatInfo.section, seatInfo.row, seatInfo.seat, seatInfo.zone);
    }

    function getTotalEvents() external view returns (uint256) {
        return _eventIds.current();
    }

    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }
}

contract TicketNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    address public eventFactory;
    mapping(uint256 => bool) public ticketUsed;
    mapping(uint256 => uint256) public resaleCount;
    
    constructor(string memory name, string memory symbol, address _eventFactory) 
        ERC721(name, symbol) {
        eventFactory = _eventFactory;
    }
    
    function mintTicket(address to) external returns (uint256) {
        require(msg.sender == eventFactory, "Only factory can mint");
        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _mint(to, tokenId);
        return tokenId;
    }
    
    function useTicket(uint256 tokenId) external {
        require(msg.sender == eventFactory, "Only factory can use ticket");
        require(!ticketUsed[tokenId], "Ticket already used");
        
        ticketUsed[tokenId] = true;
    }
    
    function getTicketInfo(uint256 tokenId) external view returns (
        address owner,
        uint256 resales,
        bool exists,
        bool used
    ) {
        if (!_exists(tokenId)) {
            return (address(0), 0, false, false);
        }
        
        return (
            ownerOf(tokenId),
            resaleCount[tokenId],
            true,
            ticketUsed[tokenId]
        );
    }
}
