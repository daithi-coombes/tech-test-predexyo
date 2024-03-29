import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { parseEther } from 'viem'
import { expect } from 'chai'
import hre from 'hardhat'

describe('Vault', () => {

  async function deployVault() {
    const [owner, account] = await hre.viem.getWalletClients()
    const deployment = await hre.viem.deployContract('Vault', [owner.account.address])
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

      await underTest.write.depositETH({value: parseEther('1')})
      const actual = await underTest.read.getBalanceETH([owner.account.address])

      expect(actual).to.equal(BigInt(1e18))
    })

    it('will withdraw', async () => {
      const { owner, vault:underTest } = await loadFixture(deployVault)

      await underTest.write.depositETH({value: parseEther('1')})
      await underTest.write.withdrawETH([parseEther('1')])
      const actual = await underTest.read.getBalanceETH([owner.account.address])

      expect(actual).to.equal(BigInt(0))
    })

    it('will not withdraw if not enough funds', async () => {
      const { vault:underTest } = await loadFixture(deployVault)

      await underTest.write.depositETH({value: parseEther('0.5')})
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

    it('will wrap ETH held in Vault', async() => {
      const { owner, vault: underTest } = await loadFixture(deployVault)

      const initalSupply =  await underTest.read.totalSupply()
      await underTest.write.depositETH({value: parseEther('1')})
      await underTest.write.wrapETH([parseEther('0.5')])

      const actualwETH = await underTest.read.balanceOf([owner.account.address])
      expect(actualwETH).to.equal(parseEther('0.5'))

      const actualETH = await underTest.read.getBalanceETH([owner.account.address])
      expect(actualETH).to.equal(parseEther('0.5'))

      expect(initalSupply).to.be.equal(parseEther('0'))
      const actualTotalSupply = await underTest.read.totalSupply()
      expect(actualTotalSupply).to.equal(parseEther('0.5'))
    })

    it('will not wrap if not enough ETH held in Vault', async () => {
      const { owner, vault: underTest } = await loadFixture(deployVault)

      await underTest.write.depositETH({value: parseEther('0.5')})
      await expect(underTest.write.wrapETH([parseEther('1')]))
      .to.be.rejectedWith('Not enough ETH to wrap')
    })

    it('will unwarp ETH', async () => {
      const { owner, vault: underTest } = await loadFixture(deployVault)

      const initalSupply =  await underTest.read.totalSupply()
      await underTest.write.depositETH({value: parseEther('1')})
      await underTest.write.wrapETH([parseEther('0.5')])

      await underTest.write.unwrapwETH([parseEther('0.5')])
      const actualwETH = await underTest.read.balanceOf([owner.account.address])
      const actualTotalSupply = await underTest.read.totalSupply()

      expect(initalSupply).to.be.equal(parseEther('0'))
      expect(actualwETH).to.be.equal(parseEther('0'))
      expect(actualTotalSupply).to.equal(parseEther('0'))
    })

    it('will not unwrap ETH if no wETH', async () => {
      const { vault: underTest } = await loadFixture(deployVault)

      await expect(underTest.write.unwrapwETH([parseEther('1')]))
      .to.be.rejectedWith('Insufficient wETH balance');
    })
  })
})