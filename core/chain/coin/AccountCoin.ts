import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { pick } from '@lib/utils/record/pick'

import { Chain } from '../Chain'

export type AccountCoinKey<T extends Chain = Chain> = CoinKey<T> & {
  address: string
}

export type AccountCoin<T extends Chain = Chain> = Coin & AccountCoinKey<T>

export const extractAccountCoinKey = <T extends AccountCoinKey>(
  coin: T
): AccountCoinKey => pick(coin, ['chain', 'id', 'address'])

export const accountCoinKeyToString = ({
  chain,
  id,
  address,
}: AccountCoinKey): string => [chain, id, address].join(':')
