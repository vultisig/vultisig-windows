import { useCurrentVaultCoins } from '@clients/desktop/src/vault/state/currentVaultCoins'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { areEqualRecords } from '@lib/utils/record/areEqualRecords'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'
import { useEffect } from 'react'

import { useCoinFinderQuery } from './queries/useCoinFinderQuery'
import { useSaveCoinsMutation } from '../../../../coin/query/useSaveCoinsMutation'

export const CoinFinder = () => {
  const { data } = useCoinFinderQuery()

  const { mutate: saveCoins, isPending } = useSaveCoinsMutation()

  const coins = useCurrentVaultCoins()

  useEffect(() => {
    if (!data) return
    const newCoins = data.filter(
      coin =>
        !coins.some(c =>
          areEqualRecords(
            withoutUndefinedFields(c),
            withoutUndefinedFields(coin)
          )
        )
    )

    if (!isEmpty(newCoins) && !isPending) {
      saveCoins(newCoins)
    }
  }, [coins, data, saveCoins, isPending])

  return null
}
