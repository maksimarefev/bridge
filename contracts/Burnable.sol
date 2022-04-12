pragma solidity ^0.8.0;

interface Burnable {
    function burnFrom(address account, uint256 amount) external;
}
