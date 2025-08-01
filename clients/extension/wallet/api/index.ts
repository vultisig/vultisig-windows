import { WalletApiInterface } from './interface'
import { authorized } from './middleware/authorized'
import { WalletApiResolver } from './resolver'
import { getAccounts } from './resolvers/getAccounts'

export type WalletApiImplementation = {
  [K in keyof WalletApiInterface]: WalletApiResolver<K>
}

export const walletApi: WalletApiImplementation = {
  get_accounts: authorized(getAccounts),
  eth_accounts: authorized(getAccounts),
}
