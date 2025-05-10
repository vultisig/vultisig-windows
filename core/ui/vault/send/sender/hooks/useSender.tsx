import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'

import { useCoreViewState } from '../../../../navigation/hooks/useCoreViewState'

export const useSender = () => {
  const [
    {
      coin: { chain },
    },
  ] = useCoreViewState<'send'>()
  return useCurrentVaultAddress(chain)
}
