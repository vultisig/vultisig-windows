import { getVaultId } from '@core/ui/vault/Vault'
import { useMutation } from '@tanstack/react-query'

import { storage } from '../../../wailsjs/go/models'
import { SaveCoins } from '../../../wailsjs/go/storage/Store'
import { useCurrentVault } from '../../vault/state/currentVault'

export const useSaveCoinsMutation = () => {
  const vault = useCurrentVault()

  return useMutation({
    mutationFn: (coins: storage.Coin[]) => SaveCoins(getVaultId(vault), coins),
  })
}
