// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleEventFactory {
    uint256 private _eventIds;
    
    struct Event {
        string name;
        uint256 price;
        uint256 totalTickets;
        uint256 soldTickets;
        address creator;
    }
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(uint256 => address)) public ticketOwners;
    
    event EventCreated(uint256 indexed eventId, string name, uint256 price);
    event TicketPurchased(uint256 indexed eventId, uint256 ticketId, address buyer);
    
    function createEvent(
        string memory name,
        uint256 price,
        uint256 totalTickets
    ) external returns (uint256) {
        _eventIds++;
        uint256 eventId = _eventIds;
        
        events[eventId] = Event({
            name: name,
            price: price,
            totalTickets: totalTickets,
            soldTickets: 0,
            creator: msg.sender
        });
        
        emit EventCreated(eventId, name, price);
        return eventId;
    }
    
    function purchaseTicket(uint256 eventId) external payable returns (uint256) {
        Event storage evt = events[eventId];
        require(evt.creator != address(0), "Event does not exist");
        require(msg.value >= evt.price, "Insufficient payment");
        require(evt.soldTickets < evt.totalTickets, "Event sold out");
        
        evt.soldTickets++;
        uint256 ticketId = evt.soldTickets;
        ticketOwners[eventId][ticketId] = msg.sender;
        
        emit TicketPurchased(eventId, ticketId, msg.sender);
        return ticketId;
    }
    
    function verifyTicket(uint256 eventId, uint256 ticketId) external view returns (bool, address) {
        address owner = ticketOwners[eventId][ticketId];
        return (owner != address(0), owner);
    }
    
    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }
    
    function getTotalEvents() external view returns (uint256) {
        return _eventIds;
    }
}
