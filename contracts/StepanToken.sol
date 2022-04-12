pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface Mintable {
    function mint(address account, uint256 amount) external;
}

interface Burnable {
    function burnFrom(address account, uint256 amount) external;
}

contract StepanToken is ERC20, Mintable, Burnable, Ownable {

    /* solhint-disable no-empty-blocks */
    constructor() public ERC20("StepanToken", "ST") {}
    /* solhint-disable no-empty-blocks */

    function mint(address account, uint256 amount) public override onlyOwner {
        _mint(account, amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyOwner {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
}
