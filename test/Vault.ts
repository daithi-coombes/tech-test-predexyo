import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { parseEther } from 'viem'
import { expect } from 'chai'
import hre from 'hardhat'

describe('Vault', () => {

  async function deployVault() {
    const [owner, account] = await hre.viem.getWalletClients()
    const deployment = await hre.viem.deployContract('Vault')
    const vault = await hre.viem.getContractAt('Vault', deployment.address)

    return {
      account,
      owner,
      vault,
    }
  }

  describe('ETH Depost & Withdrawal', () => {
    it('will deposit', async () => {
      const { owner, vault:underTest } = await loadFixture(deployVault)

      await underTest.write.depositEth({value: parseEther('1')})
      const actual = await underTest.read.getBalanceETH([owner.account.address])

      expect(actual).to.equal(BigInt(1e18))
    })

    it('will withdraw', async () => {
      const { owner, vault:underTest } = await loadFixture(deployVault)

      await underTest.write.depositEth({value: parseEther('1')})
      await underTest.write.withdrawETH([parseEther('1')])
      const actual = await underTest.read.getBalanceETH([owner.account.address])

      expect(actual).to.equal(BigInt(0))
    })

    it('will not withdraw if not enough funds', async () => {
      const { vault:underTest } = await loadFixture(deployVault)

      await underTest.write.depositEth({value: parseEther('0.5')})
      await expect(underTest.write.withdrawETH([parseEther('1')]))
      .to.be.rejectedWith('Insufficient ETH balance')
    })
  })

  describe('ERC20 Deposit & Withdrawal', () => {
    it.skip('will deposit', () => {})
    it.skip('will withdraw', () => {})
    it.skip('will not withdraw if not enough funds', () => {})
  })

  describe('Wrap & Unwrap ETH', () => {
    it.skip('will wrap ETH', () => {})
    it.skip('will not wrap if no ETH', () => {})
    it.skip('will unwarp ETH', () => {})
    it.skip('will not unwrap ETH if no WETH', () => {})
  })
})