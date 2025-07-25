import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { CoinsRecord } from '@core/ui/storage/coins'
import { haveEqualFields } from '@lib/utils/record/haveEqualFields'
import { omit } from '@lib/utils/record/omit'
import { recordMap } from '@lib/utils/record/recordMap'

import { coinsStorage, updateCoins } from '../../coins'

const oldFeeCoinKeys = [
  ...Object.values(chainFeeCoin).map(coin => ({
    id: coin.ticker,
    chain: coin.chain,
  })),
  {
    chain: Chain.Polygon,
    id: 'MATIC',
  },
]

type OldCoin = AccountCoin & { id: string }

export const changeFeeCoinKey = async (): Promise<void> => {
  const oldCoinsRecord = (await coinsStorage.getCoins()) as unknown as Record<
    string,
    OldCoin[]
  >

  const newCoins: CoinsRecord = recordMap(oldCoinsRecord, coins =>
    coins.map(coin => {
      const isFeeCoin = oldFeeCoinKeys.some(feeCoinKey =>
        haveEqualFields(['id', 'chain'], feeCoinKey, coin)
      )

      if (isFeeCoin) {
        return omit(coin, 'id')
      }

      return coin
    })
  )

  await updateCoins(newCoins)
}
