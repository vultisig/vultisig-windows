import { Coin } from '@core/chain/coin/Coin'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { SaveCoin } from '../../../wailsjs/go/storage/Store'
import { deriveAddress } from '../../chain/utils/deriveAddress'
import { toHexPublicKey } from '../../chain/utils/toHexPublicKey'
import { toStorageCoin } from '../../storage/storageCoin'
import { getVaultPublicKey } from '../publicKey/getVaultPublicKey'
import { vaultsQueryKey } from '../queries/useVaultsQuery'
import { useCurrentVault } from '../state/currentVault'
import { getStorageVaultId } from '../utils/storageVault'

export const useSaveCoinMutation = () => {
  const vault = useCurrentVault()

  const walletCore = useAssertWalletCore()

  const invalidate = useInvalidateQueries()

  return useMutation({
    onError: error => {
      console.error('save coin error: ', error)
    },
    mutationFn: async (coin: Coin) => {
      const publicKey = await getVaultPublicKey({
        vault,
        chain: coin.chain,
        walletCore,
      })

      const address = deriveAddress({
        chain: coin.chain,
        publicKey,
        walletCore,
      })

      const hexPublicKey = toHexPublicKey({
        publicKey,
        walletCore,
      })

      const storageCoin = toStorageCoin({
        ...coin,
        address,
        hexPublicKey,
      })

      await SaveCoin(getStorageVaultId(vault), storageCoin)

      await invalidate(vaultsQueryKey)
    },
  })
}
