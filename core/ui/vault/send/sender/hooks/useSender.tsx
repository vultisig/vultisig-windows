import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'

import { useCurrentSendCoin } from '../../state/sendCoin'

export const useSender = () => {
  const [
    {
      coin: { chain },
    },
  ] = useCurrentSendCoin()
  return useCurrentVaultAddress(chain)
}
