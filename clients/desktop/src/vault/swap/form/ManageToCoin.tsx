import { TransferDirectionProvider } from '@core/ui/state/transferDirection'

import { useToCoin } from '../state/toCoin'
import { SwapCoinInput } from './SwapCoinInput'

export const ManageToCoin = () => {
  const [value, setValue] = useToCoin()

  return (
    <TransferDirectionProvider value="to">
      <SwapCoinInput value={value} onChange={setValue} />
    </TransferDirectionProvider>
  )
}
