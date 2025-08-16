import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { Resolver } from '@lib/utils/types/Resolver'

export type FindCoinsResolverInput<T extends Chain = Chain> = {
  address: string
  chain: T
}

export type FindCoinsResolver<T extends Chain = Chain> = Resolver<
  FindCoinsResolverInput<T>,
  Promise<AccountCoin[]>
>
