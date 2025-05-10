import { TransferDirectionProvider } from '@core/ui/state/transferDirection'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { SwapCoinInput } from './SwapCoinInput'

export const ManageFromCoin = () => {
  const [{ coin: fromCoinKey }, setViewState] = useCoreViewState<'swap'>()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  return (
    <TransferDirectionProvider value="from">
      <SwapCoinInput
        value={fromCoin}
        onChange={coin => setViewState(prev => ({ ...prev, coin }))}
      />
    </TransferDirectionProvider>
  )
}
