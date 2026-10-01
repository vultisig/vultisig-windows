import { rescaleChainAmount } from '@core/ui/chain/utils/rescaleChainAmount'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

import { useSwapFromCoin } from './fromCoin'

/**
 * The From amount in base units, together with the decimals it was entered
 * in. Keeping the decimals lets the amount be read in whatever From coin is
 * current, so a reverse or a coin pick never pairs the new coin with an
 * amount in the old coin's units, not even for one render.
 */
type FromAmountState = {
  amount: bigint | null
  decimals: number
}

export const [FromAmountProvider, useFromAmountState] =
  setupStateProvider<FromAmountState>('FromAmount')

/**
 * The swap's From amount in the current From coin's base units, and a setter
 * that takes an amount in those same units.
 */
export const useFromAmount = () => {
  const [state, setState] = useFromAmountState()
  const [fromCoinKey] = useSwapFromCoin()
  const { decimals } = useCurrentVaultCoin(fromCoinKey)

  const amount =
    state.amount === null
      ? null
      : rescaleChainAmount({
          amount: state.amount,
          fromDecimals: state.decimals,
          toDecimals: decimals,
        })

  const setAmount = (amount: bigint | null) => setState({ amount, decimals })

  return [amount, setAmount] as const
}
