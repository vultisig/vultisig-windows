import { Coin } from '@core/chain/coin/Coin'
import { useEffect } from 'react'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { ChainAction } from '../ChainAction'
import { useDepositFormHandlers } from '../providers/DepositFormHandlersProvider'

export const useDepositCoinCorrector = (selectedDepositAction: ChainAction) => {
  const [{ watch, setValue }] = useDepositFormHandlers()
  const selectedCoin = watch('selectedCoin') as Coin | null
  const navigate = useCoreNavigate()

  const runeCoin = useCurrentVaultCoins().find(coin => coin?.ticker === 'RUNE')

  useEffect(() => {
    if (
      selectedDepositAction === 'bond' &&
      selectedCoin?.ticker !== runeCoin?.ticker
    ) {
      if (!runeCoin) {
        navigate({ id: 'vault' })
        return
      }

      setValue('selectedCoin', runeCoin, {
        shouldValidate: true,
      })
    }
  }, [
    navigate,
    runeCoin,
    selectedCoin?.ticker,
    selectedDepositAction,
    setValue,
  ])
}
