pragma solidity ^0.8.0;

import "./ERC20MintableBurnable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ERC20Bridge {

    /**
     * @dev The address of the account which is responsible for signing messages
     */
    address public signer;

    /**
     * @dev The ERC20 token address
     */
    address public tokenAddress;

    /**
     * @dev The id of the network where the contract was deployed
     */
    uint256 public networkId;

    ERC20MintableBurnable private token;
    mapping(bytes32 => bool) private handledHashes;

    /**
     * @dev Emitted when the swap operation was triggered
     */
    event SwapInitialized(address indexed from, address indexed to, uint256 amount, uint256 networkId);

    constructor(address _signer, address _tokenAddress, uint256 _networkId) public {
        signer = _signer;
        tokenAddress = _tokenAddress;
        token = ERC20MintableBurnable(_tokenAddress);
        networkId = _networkId;
    }

    /**
     * @notice Burns the `amount` of tokens from the `msg.sender' address and emits SwapInitialized event
     */
    function swap(address to, uint256 amount, uint256 targetNetworkId) public {
        require(networkId != targetNetworkId, "Invalid target network id");
        require(token.balanceOf(msg.sender) >= amount, "Sender has not enough balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Bridge has not enough allowance");

        token.burnFrom(msg.sender, amount);

        emit SwapInitialized(msg.sender, to, amount, targetNetworkId);
    }

    /**
     * @notice Verifies the signature and mints the `amount` of tokens to the `msg.sender` address
     */
    function redeem(address from, uint256 amount, uint256 nonce, bytes memory signature) public {
        address to = msg.sender;

        bytes32 hash = _hash(from, to, amount, nonce);
        require(!handledHashes[hash], "Transaction already handled");

        address recoveredAddress = ECDSA.recover(hash, signature);
        require(recoveredAddress == signer, "Failed signature verification");

        handledHashes[hash] = true;
        token.mint(to, amount);
    }

    function _hash(address from, address to, uint256 amount, uint256 nonce) internal returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, keccak256(abi.encodePacked(from, to, amount, networkId, nonce))));
    }
}
