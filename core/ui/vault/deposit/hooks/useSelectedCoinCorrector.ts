import { Coin } from '@core/chain/coin/Coin'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useEffect, useMemo } from 'react'

import { ChainAction } from '../ChainAction'
import { isStakeableCoin } from '../config'
import { useDepositFormHandlers } from '../providers/DepositFormHandlersProvider'

export const useSelectedCoinCorrector = (action: ChainAction) => {
  const [{ watch, setValue }] = useDepositFormHandlers()
  const selectedCoin = watch('selectedCoin') as Coin | null
  const selectedTicker = selectedCoin?.ticker

  const coins = useCurrentVaultCoins()

  const { ruji, rune } = useMemo(() => {
    let ruji: Coin | null = null
    let rune: Coin | null = null
    for (const c of coins) {
      if (!c?.ticker) continue
      if (!ruji && c.ticker === 'RUJI') ruji = c
      if (!rune && c.ticker === 'RUNE') rune = c
      if (ruji && rune) break
    }
    return { ruji, rune }
  }, [coins])

  useEffect(() => {
    const resetSelectedCoin = () => {
      if (selectedCoin) {
        setValue('selectedCoin', null, { shouldValidate: true })
      }
    }
    const adjustSelectedCoin = (coin: Coin | null | undefined) => {
      if (!coin) return
      if (selectedCoin?.ticker !== coin.ticker) {
        setValue('selectedCoin', coin, { shouldValidate: true })
      }
    }

    if (
      action === 'stake_ruji' ||
      action === 'unstake_ruji' ||
      action === 'withdraw_ruji_rewards'
    ) {
      if (ruji) adjustSelectedCoin(ruji)
      else resetSelectedCoin()
      return
    }

    if (action === 'bond') {
      if (rune) adjustSelectedCoin(rune)
      else resetSelectedCoin()
      return
    }

    if (action === 'stake' || action === 'unstake') {
      if (selectedTicker && !isStakeableCoin(selectedTicker)) {
        resetSelectedCoin()
      }
      return
    }

    if (
      action === 'merge' ||
      action === 'unmerge' ||
      action === 'ibc_transfer' ||
      action === 'switch' ||
      action === 'redeem'
    ) {
      if (selectedTicker === 'RUNE') resetSelectedCoin()
      return
    }
  }, [action, ruji, rune, selectedTicker, selectedCoin, setValue])
}
