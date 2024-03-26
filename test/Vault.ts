import hre from 'hardhat'
import { expect } from 'chai'

describe('Vault', () => {

  describe('ETH Depost & Withdrawal', () => {
    it('will deposit', async () => {
      const underTest = await hre.viem.deployContract('Vault')
      const [owner] = await hre.viem.getWalletClients()
      const client = await hre.viem.getPublicClient()

      await owner.sendTransaction({
        to: underTest.address,
        value: BigInt(1e18),
      })

      const actual = await underTest.getBalance(await owner.getAddresses())
      console.log('actual: ', actual)
    })
    it.skip('will withdraw', () => {})
    it.skip('will not withdraw if not enough funds', () => {})
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