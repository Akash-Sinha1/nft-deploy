// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Standard interface of ERC721.
 */
interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/**
 * @dev Interface for ERC721 metadata extension.
 */
interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

/**
 * @dev Context helper.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

/**
 * @dev Simple Ownable contract.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        require(initialOwner != address(0), "Ownable: initial owner is zero address");
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

/**
 * @dev Lightweight custom ERC721 implementation to avoid external OpenZeppelin complex imports in solc-js.
 */
contract BaseNFTCollection is Ownable {
    string private _name;
    string private _symbol;

    // Token mappings
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    // Collection states
    uint256 public nextTokenId = 1;
    uint256 public mintPrice;
    uint256 public maxSupply;
    bool public paused;
    string public baseTokenURI;
    string public contractURI;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event MintPriceUpdated(uint256 newPrice);
    event PausedStateUpdated(bool isPaused);
    event BaseURIUpdated(string newBaseURI);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory contractURI_,
        string memory baseTokenURI_,
        uint256 mintPrice_,
        uint256 maxSupply_,
        address initialOwner
    ) Ownable(initialOwner) {
        _name = name_;
        _symbol = symbol_;
        contractURI = contractURI_;
        baseTokenURI = baseTokenURI_;
        mintPrice = mintPrice_;
        maxSupply = maxSupply_;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function balanceOf(address owner_) public view returns (uint256) {
        require(owner_ != address(0), "ERC721: address zero is not a valid owner");
        return _balances[owner_];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner_ = _owners[tokenId];
        require(owner_ != address(0), "ERC721: invalid token ID");
        return owner_;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "ERC721: URI query for nonexistent token");
        
        // Return baseTokenURI concatenated with the token ID as a simple string or raw baseTokenURI
        return bytes(baseTokenURI).length > 0 ? string(abi.encodePacked(baseTokenURI, _toString(tokenId))) : "";
    }

    function mint(uint256 quantity) public payable {
        require(!paused, "Minting is paused");
        require(nextTokenId - 1 + quantity <= maxSupply, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = nextTokenId;
            _balances[msg.sender] += 1;
            _owners[tokenId] = msg.sender;
            
            emit Transfer(address(0), msg.sender, tokenId);
            nextTokenId++;
        }
    }

    function setMintPrice(uint256 mintPrice_) public onlyOwner {
        mintPrice = mintPrice_;
        emit MintPriceUpdated(mintPrice_);
    }

    function setPaused(bool paused_) public onlyOwner {
        paused = paused_;
        emit PausedStateUpdated(paused_);
    }

    function setBaseURI(string memory baseTokenURI_) public onlyOwner {
        baseTokenURI = baseTokenURI_;
        emit BaseURIUpdated(baseTokenURI_);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }

    // Helper to convert uint256 to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
