import { Coin } from '@core/chain/coin/Coin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { vaultsQueryKey } from '@core/ui/query/keys'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { SaveCoin } from '../../../wailsjs/go/storage/Store'
import { deriveAddress } from '../../chain/utils/deriveAddress'
import { toStorageCoin } from '../../storage/storageCoin'

export const useSaveCoinMutation = () => {
  const vault = useCurrentVault()

  const walletCore = useAssertWalletCore()

  const invalidate = useInvalidateQueries()

  return useMutation({
    onError: error => {
      console.error('save coin error: ', error)
    },
    mutationFn: async (coin: Coin) => {
      const publicKey = getPublicKey({
        chain: coin.chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
      })

      const address = deriveAddress({
        chain: coin.chain,
        publicKey,
        walletCore,
      })

      const storageCoin = toStorageCoin({
        ...coin,
        address,
      })

      await SaveCoin(getVaultId(vault), storageCoin)

      await invalidate(vaultsQueryKey)
    },
  })
}
