import { TransferDirectionProvider } from '@core/ui/state/transferDirection'

import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useSwapFromCoin } from '../state/fromCoin'
import { SwapCoinInput } from './SwapCoinInput'

export const ManageFromCoin = () => {
  const [fromCoinKey, setFromCoinKey] = useSwapFromCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  return (
    <TransferDirectionProvider value="from">
      <SwapCoinInput value={fromCoin} onChange={setFromCoinKey} />
    </TransferDirectionProvider>
  )
}
