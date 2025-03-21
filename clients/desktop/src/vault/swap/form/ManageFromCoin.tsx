import { SideProvider } from '../providers/SideProvider'
import { useFromCoin } from '../state/fromCoin'
import { SwapCoinInput } from './SwapCoinInput'

export const ManageFromCoin = () => {
  const [value, setValue] = useFromCoin()

  return (
    <SideProvider value="from">
      <SwapCoinInput value={value} onChange={setValue} />
    </SideProvider>
  )
}
