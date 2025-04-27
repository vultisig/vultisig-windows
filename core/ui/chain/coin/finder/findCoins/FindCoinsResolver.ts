import { AccountCoin } from '@core/chain/coin/AccountCoin'

type FindCoinsResolverInput = {
  address: string
}

export type FindCoinsResolver = (
  input: FindCoinsResolverInput
) => Promise<AccountCoin[]>
