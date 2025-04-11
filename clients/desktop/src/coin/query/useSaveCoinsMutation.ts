import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { useMutation } from '@tanstack/react-query'

import { storage } from '../../../wailsjs/go/models'
import { SaveCoins } from '../../../wailsjs/go/storage/Store'

export const useSaveCoinsMutation = () => {
  const vault = useCurrentVault()

  return useMutation({
    mutationFn: (coins: storage.Coin[]) => SaveCoins(getVaultId(vault), coins),
  })
}
