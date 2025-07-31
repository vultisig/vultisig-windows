import { without } from '@lib/utils/array/without'
import { pick } from '@lib/utils/record/pick'
import { RequiredFields } from '@lib/utils/types/RequiredFields'

import { Chain } from '../Chain'
import { ChainEntity } from '../ChainEntity'

export type CoinKey<T extends Chain = Chain> = ChainEntity<T> & {
  // The ID should only be present in tokens. Coins that are classified as fee coins in chainFeeCoin should not have an ID.
  id?: string
}

export type Token<T extends CoinKey> = RequiredFields<T, 'id'>

export type CoinMetadata = {
  priceProviderId?: string
  decimals: number
  ticker: string
  logo?: string
}

export type Coin = CoinKey & CoinMetadata

// Coin metadata coming from autodiscovery might miss logo field,
// but all coins defined in the codebase should have logo field.
export type KnownCoinMetadata = RequiredFields<CoinMetadata, 'logo'>
export type KnownCoin = CoinKey & KnownCoinMetadata

export const coinMetadataFields: (keyof Coin)[] = [
  'priceProviderId',
  'decimals',
  'ticker',
  'logo',
]

export type CoinAmount = {
  decimals: number
  amount: bigint
}

export const areEqualCoins = (one: CoinKey, another: CoinKey): boolean =>
  one.chain === another.chain &&
  one.id?.toLowerCase() === another.id?.toLowerCase()

export const coinKeyToString = ({ chain, id }: CoinKey): string =>
  without([chain, id], undefined).join(':')

export const extractCoinKey = <T extends CoinKey>(coin: T): CoinKey =>
  pick(coin, ['chain', 'id'])
