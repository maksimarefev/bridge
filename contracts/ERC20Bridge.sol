pragma solidity ^0.8.0;

import "./StepanToken.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

//todo arefev: add documentation
contract ERC20Bridge {

    address public signer;
    address public tokenAddress;

    StepanToken private token;
    mapping(bytes32 => bool) private handledHashes;

    event Swap(address indexed from, address indexed to, uint256 amount);

    constructor(address _signer, address _tokenAddress) {
        signer = _signer;
        tokenAddress = _tokenAddress;
        token = StepanToken(_tokenAddress);
    }

    function swap(address to, uint256 amount) public {
        require(token.balanceOf(msg.sender) >= amount, "Sender has not enough balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Bridge is not allowed to burn that amount of tokens");

        token.burnFrom(to, amount);

        emit Swap(msg.sender, to, amount);
    }

    function redeem(address from, uint256 amount, uint256 nonce, bytes memory signature) public {
        address to = msg.sender;

        bytes32 hash = _hash(from, to, amount, nonce);
        require(!handledHashes[hash], "Transaction already handled");

        address recoveredAddress = ECDSA.recover(_hash(from, to, amount, nonce), signature);
        require(recoveredAddress == signer, "Failed signature verification");

        handledHashes[hash] = true;
        token.mint(to, amount);
    }

    function _hash(address from, address to, uint256 amount, uint256 nonce) internal returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, keccak256(abi.encodePacked(from, to, amount, nonce))));
    }
}
