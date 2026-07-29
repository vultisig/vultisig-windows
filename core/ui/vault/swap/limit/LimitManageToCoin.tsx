import { TransferDirectionProvider } from '@core/ui/state/transferDirection'
import { areEqualCoins, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { isThorchainRoutable } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'

import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { SwapCoinInput } from '../form/SwapCoinInput'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

/**
 * Buy-side coin picker for the limit form.
 *
 * Restricts the picker to THORChain-routable chains (matching iOS's static
 * picker filter; live halts are handled by the placement gate). Picking the
 * asset already on the sell side swaps the two rather than leaving an impossible
 * same-asset order.
 */
export const LimitManageToCoin = () => {
  const [fromCoinKey, setFromCoinKey] = useSwapFromCoin()
  const [toCoinKey, setToCoinKey] = useSwapToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const handleChange = (next: CoinKey) => {
    if (areEqualCoins(next, fromCoinKey)) {
      setFromCoinKey(toCoinKey)
    }
    setToCoinKey(next)
  }

  return (
    <TransferDirectionProvider value="to">
      <SwapCoinInput
        value={toCoin}
        onChange={handleChange}
        chainFilter={isThorchainRoutable}
      />
    </TransferDirectionProvider>
  )
}
