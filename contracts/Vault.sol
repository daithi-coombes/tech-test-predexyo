// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract Vault {

    mapping(address => uint) public balancesEth;
    mapping(address => uint) public ERC20Deposits;
    mapping(address => mapping(address => uint)) public balancesERC20;  // @dev: expensive

    function getBalanceETH(address user) public view returns(uint) {
        return balancesEth[user];
    }

    function getBalanceERC20(address user, address token) public view returns(uint) {
        return balancesERC20[user][token];
    }

    function depositEth() payable public {
        balancesEth[msg.sender] += msg.value;
    }

    function depositERC20(address token, uint amount) public {
        require(amount > 0, "Amount must be greater than zero");
        balancesERC20[msg.sender][token] += amount;
    }
}