import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getVaultId } from '@core/ui/vault/Vault'
import { useMutation } from '@tanstack/react-query'

import { SaveCoins } from '../../../wailsjs/go/storage/Store'
import { toStorageCoin } from '../../storage/storageCoin'
import { useCurrentVault } from '../../vault/state/currentVault'

export const useSaveCoinsMutation = () => {
  const vault = useCurrentVault()

  return useMutation({
    mutationFn: (coins: AccountCoin[]) =>
      SaveCoins(getVaultId(vault), coins.map(toStorageCoin)),
  })
}
