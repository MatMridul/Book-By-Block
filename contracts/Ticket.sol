// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Ticket
 * @dev NFT contract for BookByBlock anti-scalping tickets
 * Features: Controlled transfers, resale tracking, burn-on-entry
 */
contract Ticket is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Anti-scalping configuration
    uint256 public maxResales = 2;
    uint256 public maxMarkupPercent = 110; // 110% = 10% markup
    uint256 public basePrice;
    
    // Factory contract address (privileged)
    address public factory;
    
    // Resale tracking
    mapping(uint256 => uint256) public resaleCount;
    mapping(uint256 => uint256) public lastSalePrice;
    
    // Events for transparency
    event TicketMinted(uint256 indexed tokenId, address indexed to, uint256 price);
    event TicketBurned(uint256 indexed tokenId, address indexed owner);
    event ControlledTransfer(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event ResaleRulesUpdated(uint256 maxResales, uint256 maxMarkupPercent);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call this");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _basePrice,
        address _factory
    ) ERC721(name, symbol) {
        basePrice = _basePrice;
        factory = _factory;
    }
    
    /**
     * @dev Mint new ticket (only factory)
     */
    function mint(address to) external onlyFactory returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _safeMint(to, tokenId);
        lastSalePrice[tokenId] = basePrice;
        
        emit TicketMinted(tokenId, to, basePrice);
        return tokenId;
    }
    
    /**
     * @dev Controlled transfer with anti-scalping rules
     */
    function controlledTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 salePrice
    ) external onlyFactory {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == from, "Not token owner");
        require(resaleCount[tokenId] < maxResales, "Max resales exceeded");
        
        // Check markup limit
        uint256 maxAllowedPrice = (lastSalePrice[tokenId] * maxMarkupPercent) / 100;
        require(salePrice <= maxAllowedPrice, "Price exceeds markup limit");
        
        // Update resale tracking
        resaleCount[tokenId]++;
        lastSalePrice[tokenId] = salePrice;
        
        // Transfer token
        _transfer(from, to, tokenId);
        
        emit ControlledTransfer(tokenId, from, to, salePrice);
    }
    
    /**
     * @dev Burn ticket on entry (only factory)
     */
    function burnByFactory(uint256 tokenId) external onlyFactory {
        require(_exists(tokenId), "Token does not exist");
        address owner = ownerOf(tokenId);
        
        _burn(tokenId);
        
        emit TicketBurned(tokenId, owner);
    }
    
    /**
     * @dev Override transfer to prevent unauthorized transfers
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        revert("Use controlled transfer only");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        revert("Use controlled transfer only");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        revert("Use controlled transfer only");
    }
    
    /**
     * @dev Admin functions
     */
    function setResaleRules(uint256 _maxResales, uint256 _maxMarkupPercent) external onlyOwner {
        maxResales = _maxResales;
        maxMarkupPercent = _maxMarkupPercent;
        emit ResaleRulesUpdated(_maxResales, _maxMarkupPercent);
    }
    
    function setFactory(address _factory) external onlyOwner {
        factory = _factory;
    }
    
    /**
     * @dev Get ticket info
     */
    function getTicketInfo(uint256 tokenId) external view returns (
        address owner,
        uint256 resales,
        uint256 lastPrice,
        bool exists
    ) {
        if (!_exists(tokenId)) {
            return (address(0), 0, 0, false);
        }
        
        return (
            ownerOf(tokenId),
            resaleCount[tokenId],
            lastSalePrice[tokenId],
            true
        );
    }
    
    /**
     * @dev Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Token URI for metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        // Return API endpoint for dynamic metadata
        return string(abi.encodePacked(
            "https://api.bookbyblock.com/metadata/",
            Strings.toString(address(this)),
            "/",
            Strings.toString(tokenId)
        ));
    }
}
