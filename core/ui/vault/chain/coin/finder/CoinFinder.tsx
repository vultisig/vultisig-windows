import { useCreateCoinsMutation } from '@core/ui/storage/coins'
import { useCoinFinderQuery } from '@core/ui/vault/chain/coin/finder/queries/useCoinFinderQuery'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { areEqualRecords } from '@lib/utils/record/areEqualRecords'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'
import { useEffect, useRef } from 'react'

export const CoinFinder = () => {
  const { data } = useCoinFinderQuery()
  const { mutate: saveCoins, isPending, error } = useCreateCoinsMutation()
  const coins = useCurrentVaultCoins()
  const processedCoinsRef = useRef(new Set<string>())

  useEffect(() => {
    if (!data) return

    const newCoins = data.filter(coin => {
      const coinKey = JSON.stringify(withoutUndefinedFields(coin))
      if (processedCoinsRef.current.has(coinKey)) return false

      const exists = coins.some(c =>
        areEqualRecords(withoutUndefinedFields(c), withoutUndefinedFields(coin))
      )

      if (!exists) {
        processedCoinsRef.current.add(coinKey)
      }
      return !exists
    })

    if (!isEmpty(newCoins) && !isPending && !error) {
      console.log('CoinFinder: saving new coins', newCoins)
      saveCoins(newCoins)
    }
  }, [data, saveCoins, isPending, error, coins])

  return null
}
