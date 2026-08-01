import { TransferDirectionProvider } from '@core/ui/state/transferDirection'
import { areEqualCoins, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { isThorchainRoutable } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'

import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { SwapCoinInput } from '../form/SwapCoinInput'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

/**
 * Sell-side coin picker for the limit form.
 *
 * Restricts the picker to THORChain-routable chains (matching iOS's static
 * picker filter; live halts are handled by the placement gate). Picking the
 * asset already on the buy side swaps the two rather than leaving an impossible
 * same-asset order.
 */
export const LimitManageFromCoin = () => {
  const [fromCoinKey, setFromCoinKey] = useSwapFromCoin()
  const [toCoinKey, setToCoinKey] = useSwapToCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

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
        chainFilter={isThorchainRoutable}
      />
    </TransferDirectionProvider>
  )
}
