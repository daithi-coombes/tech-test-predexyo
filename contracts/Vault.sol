// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "hardhat/console.sol";

contract Vault is ERC20, ERC20Burnable, Ownable, ERC20Permit {

    mapping(address => uint) public balancesETH;
    mapping(address => uint) public ERC20Deposits;
    mapping(address => mapping(address => uint)) public balancesERC20;  // @dev: expensive

    constructor(address Owner)
        ERC20("WrappedETH", "wETH") Ownable(Owner) ERC20Permit("WrappedETH")
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function getBalanceETH(address user) public view returns(uint) {
        return balancesETH[user];
    }

    function getBalanceERC20(address user, address token) public view returns(uint) {
        return balancesERC20[user][token];
    }

    function depositETH() payable public {
        balancesETH[msg.sender] += msg.value;
    }

    function depositERC20(IERC20 token, uint amount) public {
        require(amount > 0, "Transfer amount must be greater than zero");
        uint256 _allowance = token.allowance(msg.sender, address(this));
        require(_allowance >= amount, "Not enough allowance");

        token.transferFrom(msg.sender, address(this), amount);

        balancesERC20[msg.sender][address(token)] += amount;
    }

    function withdrawERC20(IERC20 token, uint amount) public {
        require(amount > 0, "Transfer amount must be greater than zero");
        require(balancesERC20[msg.sender][address(token)] >= amount, "Not enough ERC20 in vault");

        token.approve(msg.sender, amount);
        token.transferFrom(address(this), msg.sender, amount);

        balancesERC20[msg.sender][address(token)] -= amount;
    }

    function withdrawETH(uint amount) public {
        uint _balance = balancesETH[msg.sender];
        require(_balance >= amount, "Insufficient ETH balance");

        balancesETH[msg.sender] = 0;
        (bool success,) = payable(msg.sender).call{value: _balance}("");
        require(success, "ETH withdraw failed");

        if (!success) {
            balancesETH[msg.sender] = _balance;
        }
    }

    function wrapETH(uint amount) public {
        uint _ethBalance = balancesETH[msg.sender];
        require(_ethBalance > amount, "Not enough ETH to wrap");

        _mint(msg.sender, amount);
        balancesETH[msg.sender] -= amount;
    }

    function unwrapwETH(uint amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient wETH balance");

        _burn(msg.sender, amount);
        balancesETH[msg.sender] += amount;
    }
}