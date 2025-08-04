import { Coin } from '@core/chain/coin/Coin'
import { useEffect } from 'react'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { ChainAction } from '../ChainAction'
import { stakeableAssetsTickers, StakeableAssetTicker } from '../config'
import { useDepositFormHandlers } from '../providers/DepositFormHandlersProvider'

export const useDepositCoinCorrector = (selectedDepositAction: ChainAction) => {
  const [{ watch, setValue }] = useDepositFormHandlers()
  const selectedCoin = watch('selectedCoin') as Coin | null
  console.log('🚀 ~ useDepositCoinCorrector ~ selectedCoin:', selectedCoin)
  const navigate = useCoreNavigate()
  const runeCoin = useCurrentVaultCoins().find(coin => coin?.ticker === 'RUNE')
  const defaultStakeableAssetTicker = stakeableAssetsTickers[0]
  const defaultStakeableAsset = useCurrentVaultCoins().find(
    coin => coin?.ticker === defaultStakeableAssetTicker
  )

  useEffect(() => {
    if (
      selectedDepositAction === 'unstake' &&
      (!selectedCoin?.ticker ||
        !stakeableAssetsTickers.includes(
          selectedCoin.ticker as StakeableAssetTicker
        ))
    ) {
      if (!defaultStakeableAsset) {
        navigate({ id: 'vault' })
        return
      }

      setValue('selectedCoin', defaultStakeableAsset, {
        shouldValidate: true,
      })
    } else if (
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
    defaultStakeableAsset,
    navigate,
    runeCoin,
    selectedCoin?.ticker,
    selectedDepositAction,
    setValue,
  ])
}
