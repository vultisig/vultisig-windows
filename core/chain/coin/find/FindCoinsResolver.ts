import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'

export type FindCoinsResolverInput<T extends Chain = Chain> = {
  address: string
  chain: T
}

export type FindCoinsResolver<T extends Chain = Chain> = (
  input: FindCoinsResolverInput<T>
) => Promise<AccountCoin[]>
