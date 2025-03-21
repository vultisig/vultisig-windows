import { SideProvider } from '../providers/SideProvider'
import { useToCoin } from '../state/toCoin'
import { SwapCoinInput } from './SwapCoinInput'

export const ManageToCoin = () => {
  const [value, setValue] = useToCoin()

  return (
    <SideProvider value="to">
      <SwapCoinInput value={value} onChange={setValue} />
    </SideProvider>
  )
}
