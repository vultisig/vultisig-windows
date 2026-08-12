import { TransferDirectionProvider } from '@core/ui/state/transferDirection'
import { areEqualCoins, CoinKey } from '@vultisig/core-chain/coin/Coin'

import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { SwapCoinInput } from '../form/SwapCoinInput'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { useLimitChainFilter } from './useLimitChainFilter'

/**
 * Sell-side coin picker for the limit form.
 *
 * Restricts the picker to chains THORChain can currently take a limit order
 * from, so a halted chain is not offered at all. Picking the asset already on
 * the buy side swaps the two rather than leaving an impossible same-asset order.
 */
export const LimitManageFromCoin = () => {
  const [fromCoinKey, setFromCoinKey] = useSwapFromCoin()
  const [toCoinKey, setToCoinKey] = useSwapToCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const chainFilter = useLimitChainFilter()

  const handleChange = (next: CoinKey) => {
    if (areEqualCoins(next, toCoinKey)) {
      setToCoinKey(fromCoinKey)
    }
    setFromCoinKey(next)
  }

  return (
    <TransferDirectionProvider value="from">
      <SwapCoinInput
        value={fromCoin}
        onChange={handleChange}
        chainFilter={chainFilter}
      />
    </TransferDirectionProvider>
  )
}
