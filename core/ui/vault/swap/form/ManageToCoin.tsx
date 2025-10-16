import { TransferDirectionProvider } from '@core/ui/state/transferDirection'

import { useSwapToCoin } from '../state/toCoin'
import { SwapCoinInput } from './SwapCoinInput'

export const ManageToCoin = () => {
  const [value, setValue] = useSwapToCoin()

  return (
    <TransferDirectionProvider value="to">
      <SwapCoinInput value={value} onChange={setValue} />
    </TransferDirectionProvider>
  )
}
