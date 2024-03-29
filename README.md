# Predexyo Tech Test

## Take-home Exercise
Thank you for your interest in the role. To help us evaluate your suitability, please complete this exercise and send us a repo containing your implementation. This exercise is not intended to take longer than 1-2 hours.

The task is to create a Vault smart-contract, written in Solidity and suitable for deployment on Ethereum. The Vault should provide the following functionality:

 - Users may deposit and later withdraw ETH. They may not withdraw more than they have individually deposited (no negative balances).
 - Users may deposit and withdraw ERC20 tokens of their choosing. Again, they may not withdraw more than they have deposited of a given token.
 - After depositing ETH, users may wrap their ETH into WETH within the vault (i.e. without first withdrawing). Similarly, users may unwrap their WETH into ETH within the vault.

You should take into consideration relevant best practices for security and gas efficiency in your implementation. You may use whichever framework/tooling (e.g. hardhat, truffle etc.) that you prefer. Please send us a link to your code on github/gitlab etc. or as a .zip file.

# Notes

Always use industry standards with smart contracts, namely due to their immutability. Things missing from this project that would be in production ready code:
 - Upgradable Proxies
 - Openzeppelin
 - linting
 - environments (dev, test & prod as needed)

Project is vanilla solidity for the tech test only. DO NOT USE IN PRODUCTION

# Instructions

### Installation
```
npm install
```

### Testing
```
npx hardhat test
```

### Static Analysis
```
docker run -v $(pwd):/tmp mythril/myth analyze /tmp/contracts/Vault.sol --solc-json /tmp/mythril.json
```