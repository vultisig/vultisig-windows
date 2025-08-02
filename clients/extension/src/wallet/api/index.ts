import { WalletApiInterface } from './interface'
import { WalletApiResolver } from './resolver'
import { eth_accounts } from './resolvers/eth_accounts'
import { get_accounts } from './resolvers/get_accounts'

type WalletApiImplementation = {
  [K in keyof WalletApiInterface]: WalletApiResolver<K>
}

export const walletApi: WalletApiImplementation = {
  get_accounts,
  eth_accounts,
}
