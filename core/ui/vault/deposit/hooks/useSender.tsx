import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'

import { useDepositCoin } from '../providers/DepositCoinProvider'

export const useSender = () => {
  const [{ address }] = useDepositCoin()
  return useCurrentVaultAddress(address)
}
