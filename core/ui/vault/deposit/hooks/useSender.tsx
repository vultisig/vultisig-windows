import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'

export const useSender = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  return useCurrentVaultAddress(coinKey.chain)
}
