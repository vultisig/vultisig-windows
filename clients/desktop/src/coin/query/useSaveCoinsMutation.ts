import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { useMutation } from '@tanstack/react-query'

import { SaveCoins } from '../../../wailsjs/go/storage/Store'
import { toStorageCoin } from '../../storage/storageCoin'

export const useSaveCoinsMutation = () => {
  const vault = useCurrentVault()

  return useMutation({
    mutationFn: (coins: AccountCoin[]) =>
      SaveCoins(getVaultId(vault), coins.map(toStorageCoin)),
  })
}
