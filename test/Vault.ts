import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { parseEther } from 'viem'
import { expect } from 'chai'
import hre from 'hardhat'

describe('Vault', () => {

  async function deployVault() {
    const [owner, account] = await hre.viem.getWalletClients()

    const deployment = await hre.viem.deployContract('Vault', [owner.account.address])
    const vault = await hre.viem.getContractAt('Vault', deployment.address)

    const deploymentMockERC20 = await hre.viem.deployContract('MockERC20', [owner.account.address])
    const mockERC20 = await hre.viem.getContractAt('MockERC20', deploymentMockERC20.address)
    await mockERC20.write.mint([account.account.address, parseEther('1')])

    return {
      account,
      mockERC20,
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

  describe.only('ERC20 Deposit & Withdrawal', () => {
    it('will deposit', async () => {
      const { account, mockERC20, vault:underTest} = await loadFixture(deployVault)

      await mockERC20.write.approve([underTest.address, parseEther('1')], {account: account.account.address})
      const approvalAmount = await mockERC20.read.allowance([account.account.address, underTest.address])

      await underTest.write.depositERC20([mockERC20.address, parseEther('1')], {account: account.account.address})

      const balanceVault = await underTest.read.getBalanceERC20([account.account.address, mockERC20.address])
      const balanceERC20 = await mockERC20.read.balanceOf([underTest.address])

      expect(balanceERC20).to.be.equal(parseEther('1'))
      expect(balanceVault).to.be.equal(parseEther('1'))
      expect(approvalAmount).to.be.equal(parseEther('1'))
    })

    it('will withdraw', async () => {
      // approve transfer from vault to msg.sender
      const { account, mockERC20, vault:underTest} = await loadFixture(deployVault)

      await mockERC20.write.approve([underTest.address, parseEther('1')], {account: account.account.address})
      await underTest.write.depositERC20([mockERC20.address, parseEther('1')], {account: account.account.address})
      const balanceVault = await underTest.read.getBalanceERC20([account.account.address, mockERC20.address])
      console.log('user vault balance: ', balanceVault)
      const balanceVaultERC20 = await mockERC20.read.balanceOf([underTest.address])
      console.log('balanceVaultERC20: ', balanceVaultERC20)

      await underTest.write.withdrawERC20([mockERC20.address, parseEther('1')], {account: account.account.address})

      // const balanceVault = await underTest.read.getBalanceERC20([account.account.address, mockERC20.address])
      const balanceERC20 = await mockERC20.read.balanceOf([underTest.address])

      expect(balanceERC20).to.be.equal(parseEther('0'))
      expect(balanceVault).to.be.equal(parseEther('0'))

      // update local state (balances20)
      // transfer to msg.sender
    })
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
      const { vault: underTest } = await loadFixture(deployVault)

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