import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { useEffect, useMemo } from 'react'

import { useCurrentVaultCoins } from '../../../../state/currentVaultCoins'
import { ChainAction } from '../../../ChainAction'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'

// Need to add these coins on the fly
const makeCoinFromKnown = (denom: string): Coin => ({
  chain: Chain.THORChain,
  id: denom,
  ...knownCosmosTokens['THORChain'][denom],
})

export const useSelectedCoinCorrector = (action: ChainAction) => {
  const [{ watch, setValue }] = useDepositFormHandlers()
  const selectedCoin = watch('selectedCoin') as Coin | null

  const vaultCoins = useCurrentVaultCoins()

  const { runeInVault, tcyInVault } = useMemo(() => {
    const rune = vaultCoins.find(
      c => c.chain === Chain.THORChain && c.ticker === 'RUNE'
    )
    const tcy = vaultCoins.find(
      c => c.chain === Chain.THORChain && c.ticker === 'TCY'
    )
    return { runeInVault: rune, tcyInVault: tcy }
  }, [vaultCoins])

  useEffect(() => {
    if (action === 'deposit_yRune') {
      const target = runeInVault ?? chainFeeCoin.THORChain
      if (selectedCoin?.ticker !== target.ticker) {
        setValue('selectedCoin', target, { shouldValidate: true })
      }
      return
    }

    if (action === 'deposit_yTcy') {
      const target = tcyInVault ?? makeCoinFromKnown('tcy')

      if (selectedCoin?.ticker !== target.ticker) {
        setValue('selectedCoin', target, { shouldValidate: true })
      }
    }
  }, [action, selectedCoin, runeInVault, tcyInVault, setValue])
}
