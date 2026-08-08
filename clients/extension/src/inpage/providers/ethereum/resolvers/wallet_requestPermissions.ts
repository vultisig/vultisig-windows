import { requestEthAccounts } from './eth_requestAccounts'
import {
  getEthAccountsPermission,
  type Web3WalletPermission,
} from './wallet_getPermissions'

type WalletRequestPermissionsInput = Array<
  Partial<Record<Web3WalletPermission['parentCapability'], unknown>>
>

export const requestWalletPermissions = async (
  params?: WalletRequestPermissionsInput
): Promise<Web3WalletPermission[]> => {
  const requestedPermissions = params?.[0]

  if (!requestedPermissions || !('eth_accounts' in requestedPermissions)) {
    return []
  }

  const accounts = await requestEthAccounts(undefined)

  return [getEthAccountsPermission(accounts)]
}
