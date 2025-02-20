import { Chain } from '@core/chain/Chain'
import { AccountCoinKey } from '@core/chain/coin/AccountCoin'

export type CoinBalanceResolverInput<T extends Chain = Chain> =
  AccountCoinKey<T>

export type CoinBalanceResolver<T extends Chain = Chain> = (
  input: CoinBalanceResolverInput<T>
) => Promise<bigint>
