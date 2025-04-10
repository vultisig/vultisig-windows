import { useSaveCoinsMutation } from '@clients/desktop/src/coin/query/useSaveCoinsMutation'
import { useCurrentVaultCoins } from '@clients/desktop/src/vault/state/currentVaultCoins'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { areEqualRecords } from '@lib/utils/record/areEqualRecords'
import { useEffect } from 'react'

import { useCoinFinderQueries } from './queries/useCoinFinderQueries'

export const CoinFinder = () => {
  const queries = useCoinFinderQueries()

  const { mutate: saveCoins } = useSaveCoinsMutation()

  const coins = useCurrentVaultCoins()

  useEffect(() => {
    const foundCoins = queries.flatMap(query => query.data ?? [])

    const newCoins = foundCoins.filter(
      coin => !coins.some(c => areEqualRecords(c, coin))
    )

    if (!isEmpty(newCoins)) {
      saveCoins(newCoins)
    }
  }, [coins, queries, saveCoins])

  return null
}
