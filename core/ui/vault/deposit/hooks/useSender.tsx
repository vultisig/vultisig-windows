import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'

import { useDepositCoin } from '../providers/DepositCoinProvider'

export const useSender = () => {
  const [{ chain }] = useDepositCoin()
  return useCurrentVaultAddress(chain)
}
