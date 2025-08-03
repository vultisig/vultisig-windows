import { Coin } from '@core/chain/coin/Coin'
import { useEffect } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { ChainAction } from '../ChainAction'
import { useDepositFormHandlers } from '../providers/DepositFormHandlersProvider'

export const useSelectedCoinCorrector = (
  selectedDepositAction: ChainAction
) => {
  const [{ watch, setValue }] = useDepositFormHandlers()
  const selectedCoin = watch('selectedCoin') as Coin | null

  const rujiCoin = useCurrentVaultCoins().find(
    coin => coin?.ticker === 'x/ruji'
  )

  useEffect(() => {
    if (
      selectedCoin?.ticker !== rujiCoin?.ticker &&
      (selectedDepositAction === 'stake_ruji' ||
        selectedDepositAction === 'unstake_ruji' ||
        selectedDepositAction === 'withdraw_ruji_rewards')
    ) {
      setValue('selectedCoin', rujiCoin, {
        shouldValidate: true,
      })
    }
  }, [rujiCoin, selectedCoin?.ticker, selectedDepositAction, setValue])
}
