import { getEthAccounts } from './eth_accounts'

export type Web3WalletPermission = {
  parentCapability: 'eth_accounts'
  caveats: [
    {
      type: 'restrictReturnedAccounts'
      value: string[]
    },
  ]
}

export const getEthAccountsPermission = (
  accounts: string[]
): Web3WalletPermission => ({
  parentCapability: 'eth_accounts',
  caveats: [
    {
      type: 'restrictReturnedAccounts',
      value: accounts,
    },
  ],
})

export const getWalletPermissions = async (): Promise<
  Web3WalletPermission[]
> => {
  const accounts = await getEthAccounts()

  return accounts.length > 0 ? [getEthAccountsPermission(accounts)] : []
}
