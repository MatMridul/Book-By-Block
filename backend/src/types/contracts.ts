// Contract ABI exports for TypeScript
export const EventFactory__factory = {
  abi: [
    "function createEvent(string name, string symbol, uint256 basePrice, uint256 totalSupply) returns (uint256 eventId, address ticketContract)",
    "function mintTicket(uint256 eventId, address to) payable",
    "function useTicket(uint256 eventId, uint256 tokenId)",
    "function getEvent(uint256 eventId) view returns (tuple(uint256 eventId, string name, address ticketContract, uint256 basePrice, uint256 totalSupply, uint256 soldCount, bool active, address creator, uint256 createdAt))",
    "function getEventStats(uint256 eventId) view returns (uint256 totalSupply, uint256 soldCount, uint256 availableCount, bool soldOut)",
    "function getTotalEvents() view returns (uint256)",
    "event EventCreated(uint256 indexed eventId, string name, address indexed ticketContract, uint256 basePrice, address indexed creator)",
    "event TicketMinted(uint256 indexed eventId, address indexed ticketContract, uint256 indexed tokenId, address buyer, uint256 price)",
    "event TicketUsed(uint256 indexed eventId, address indexed ticketContract, uint256 indexed tokenId, address owner)"
  ]
};

export const Ticket__factory = {
  abi: [
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function getTicketInfo(uint256 tokenId) view returns (address owner, uint256 resales, uint256 lastPrice, bool exists)",
    "function totalSupply() view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "event TicketBurned(uint256 indexed tokenId, address indexed owner)"
  ]
};
