import { areEqualCoins, coinMetadataFields } from '@core/chain/coin/Coin'
import { coins } from '@core/chain/coin/coins'
import { useCreateCoinsMutation } from '@core/ui/storage/coins'
import { useCoinFinderQuery } from '@core/ui/vault/chain/coin/finder/queries/useCoinFinderQuery'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { areEqualRecords } from '@lib/utils/record/areEqualRecords'
import { pick } from '@lib/utils/record/pick'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'
import { useEffect } from 'react'

import { useCoinFinderIgnore } from '../../../../storage/coinFinderIgnore'
import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'

export const CoinFinder = () => {
  const { data } = useCoinFinderQuery()

  const { mutate: saveCoins, isPending, error } = useCreateCoinsMutation()

  const vaultCoins = useCurrentVaultCoins()

  const coinFinderIgnore = useCoinFinderIgnore()

  const vaultId = useAssertCurrentVaultId()

  useEffect(() => {
    if (!data) return

    const newCoins = data
      .filter(coin => !coinFinderIgnore.some(c => areEqualCoins(c, coin)))
      .map(coin => {
        const existingCoinInfo = coins.find(c => areEqualCoins(c, coin))

        if (!existingCoinInfo) {
          return coin
        }

        return {
          ...coin,
          ...pick(existingCoinInfo, coinMetadataFields),
        }
      })
      .filter(
        coin =>
          !vaultCoins.some(c =>
            areEqualRecords(
              withoutUndefinedFields(c),
              withoutUndefinedFields(coin)
            )
          )
      )

    if (!isEmpty(newCoins) && !isPending && !error) {
      console.log('CoinFinder: saving new coins', newCoins)
      saveCoins({
        vaultId,
        coins: newCoins,
      })
    }
  }, [coinFinderIgnore, vaultCoins, data, error, isPending, saveCoins, vaultId])

  return null
}
