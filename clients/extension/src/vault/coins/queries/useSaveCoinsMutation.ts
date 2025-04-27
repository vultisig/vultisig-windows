import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { useMutation } from '@tanstack/react-query'

import { useVaultCoinsMutation } from '../../state/coins'

export const useSaveCoinsMutation = () => {
  const vault = useCurrentVault()
  const { mutateAsync: updateVaultCoins } = useVaultCoinsMutation()
  return useMutation({
    mutationFn: (coins: AccountCoin[]) =>
      updateVaultCoins(getVaultId(vault), coins),
  })
}
