import { useFromCoin } from '../state/fromCoin'
import { SwapCoinInput } from './SwapCoinInput'

export const ManageFromCoin = () => {
  const [value, setValue] = useFromCoin()

  return <SwapCoinInput side="from" value={value} onChange={setValue} />
}
