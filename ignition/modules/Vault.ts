import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('VaultModule', (m) => {
  const vault = m.contract('Vault')
  const mockERC20 = m.contract('MockERC20')

  return {
    mockERC20,
    vault,
  }
})