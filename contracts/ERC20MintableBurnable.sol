pragma solidity ^0.8.0;

import "./Burnable.sol";
import "./Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ERC20MintableBurnable is IERC20, Mintable, Burnable {

}
