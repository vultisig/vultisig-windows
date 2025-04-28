import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'

import { useCurrentDepositCoin } from './useCurrentDepositCoin'

export const useSender = () => {
  const [{ chain }] = useCurrentDepositCoin()
  return useCurrentVaultAddress(chain)
}
