pragma solidity ^0.8.0;

import "./StepanToken.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

//todo arefev: add documentation
contract ERC20Bridge {

    address public signer;
    StepanToken private token;
    mapping(bytes32 => bool) private handledHashes; //todo arefev: why use nonce?

    event Swap(address indexed from, address indexed to, uint256 amount);

    constructor(address _signer, address tokenAddress) {
        signer = _signer;
        token = StepanToken(tokenAddress);
    }

    function swap(address to, uint256 amount) public {
        require(token.balanceOf(msg.sender) >= amount, "Sender has not enough balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Bridge is not allowed to burn that amount of tokens");

        token.burnFrom(to, amount);

        emit Swap(msg.sender, to, amount);
    }

    function redeem(address from, uint256 amount, uint256 nonce, bytes memory signature) public {
        address to = msg.sender;

        ECDSA.recover(_hash(from, to, amount, nonce), v, r, s);

        address recoveredAddress = ECDSA.recover(_hash(from, to, amount, nonce), signature);
        require(recoveredAddress == signer, "Failed signature verification");

        token.mint(to, amount);
    }

    /*todo arefev: When a message is signed in Ethereum (e.g. using eth_signMessage ), it is first prefixed with the header
         \x19Ethereum Signed Message:\n followed by the length of the message and then finally the message itself.
    */
    function _hash(address from, address to, uint256 amount, uint256 nonce) internal returns (bytes32 memory) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32"; //todo arefev: what is the length actually?
        return keccak256(
            abi.encodePacked(
                prefix,
                keccak256(abi.encodePacked(from, to, amount))
            )
        );
    }
}
