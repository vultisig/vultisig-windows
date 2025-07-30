import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'

export const useDepositCoin = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()

  return useCurrentVaultCoin(coinKey)
}
