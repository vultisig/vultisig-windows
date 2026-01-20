import { areEqualCoins } from '@core/chain/coin/Coin'
import { CoinsRecord } from '@core/ui/storage/coins'
import { recordMap } from '@lib/utils/record/recordMap'

import { coinsStorage, updateCoins } from '../../coins'

export const removeDuplicateCoins = async (): Promise<void> => {
  const coinsRecord = await coinsStorage.getCoins()

  const newCoins: CoinsRecord = recordMap(coinsRecord, vaultCoins => {
    const deduplicated: typeof vaultCoins = []

    for (const coin of vaultCoins) {
      const existingIndex = deduplicated.findIndex(d => areEqualCoins(d, coin))

      if (existingIndex === -1) {
        deduplicated.push(coin)
      } else {
        const existing = deduplicated[existingIndex]

        if (
          coin.id &&
          coin.id === coin.id.toLowerCase() &&
          existing.id &&
          existing.id !== existing.id.toLowerCase()
        ) {
          deduplicated[existingIndex] = coin
        }
      }
    }

    return deduplicated
  })

  await updateCoins(newCoins)
}
