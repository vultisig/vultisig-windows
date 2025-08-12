import { Chain } from '@core/chain/Chain'
import { AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Resolver } from '@lib/utils/types/Resolver'

export type CoinBalanceResolverInput<T extends Chain = Chain> =
  AccountCoinKey<T>

export type CoinBalanceResolver<T extends Chain = Chain> = Resolver<
  CoinBalanceResolverInput<T>,
  Promise<bigint>
>
