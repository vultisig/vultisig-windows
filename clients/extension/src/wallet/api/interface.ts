import { Chain } from '@core/chain/Chain'

type WalletApiMethod<Input, Output> = {
  input: Input
  output: Output
}

type GetAccountsApiMethod = WalletApiMethod<
  {
    chain: Chain
  },
  string[]
>

export type WalletApiInterface = {
  eth_accounts: GetAccountsApiMethod
  get_accounts: GetAccountsApiMethod
}

export type WalletApiMethodName = keyof WalletApiInterface
