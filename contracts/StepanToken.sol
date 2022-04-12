pragma solidity ^0.8.0;

import "./ERC20MintableBurnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StepanToken is ERC20, ERC20MintableBurnable, Ownable {

    constructor() public ERC20("StepanToken", "ST") {
        _mint(msg.sender, 10 * (10 ** decimals()));
    }

    function mint(address account, uint256 amount) public override onlyOwner {
        _mint(account, amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyOwner {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
}
