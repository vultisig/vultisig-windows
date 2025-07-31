import { Chain } from '@core/chain/Chain'
import {
  yRUNEReceiptDenom,
  yTCYReceiptDenom,
} from '@core/chain/chains/cosmos/thor/ytcy-and-yrune/config'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { useEffect, useMemo } from 'react'

import { useCurrentVaultCoins } from '../../../../state/currentVaultCoins'
import { ChainAction } from '../../../ChainAction'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'

/** @tony: Required by product to build a Coin object from `knownCosmosTokens` on demand */
const makeCoin = (denom: string): Coin => ({
  chain: Chain.THORChain,
  id: denom,
  ...knownCosmosTokens['THORChain'][denom],
})

export const useSelectedCoinCorrector = (action: ChainAction) => {
  const [{ watch, setValue }] = useDepositFormHandlers()
  const selectedCoin = watch('selectedCoin') as Coin | null
  const vaultCoins = useCurrentVaultCoins()

  const { runeInVault, tcyInVault, yRuneInVault, yTcyInVault } = useMemo(() => {
    const finder = (ticker: string) =>
      vaultCoins.find(c => c.chain === Chain.THORChain && c.ticker === ticker)

    return {
      runeInVault: finder('RUNE'),
      tcyInVault: finder('TCY'),
      yRuneInVault: vaultCoins.find(c => c.id === yRUNEReceiptDenom),
      yTcyInVault: vaultCoins.find(c => c.id === yTCYReceiptDenom),
    }
  }, [vaultCoins])

  useEffect(() => {
    if (action === 'deposit_yRune') {
      const target = runeInVault ?? chainFeeCoin.THORChain
      if (selectedCoin?.id !== target.id) {
        setValue('selectedCoin', target, { shouldValidate: true })
      }
      return
    }

    if (action === 'deposit_yTcy') {
      const target = tcyInVault ?? makeCoin('tcy')
      if (selectedCoin?.id !== target.id) {
        setValue('selectedCoin', target, { shouldValidate: true })
      }
      return
    }

    if (action === 'withdraw_yRune') {
      const target = yRuneInVault ?? makeCoin(yRUNEReceiptDenom)
      if (selectedCoin?.id !== target.id) {
        setValue('selectedCoin', target, { shouldValidate: true })
      }
      return
    }

    if (action === 'withdraw_yTcy') {
      const target = yTcyInVault ?? makeCoin(yTCYReceiptDenom)
      if (selectedCoin?.id !== target.id) {
        setValue('selectedCoin', target, { shouldValidate: true })
      }
    }
  }, [
    action,
    selectedCoin,
    runeInVault,
    tcyInVault,
    yRuneInVault,
    yTcyInVault,
    setValue,
  ])
}
