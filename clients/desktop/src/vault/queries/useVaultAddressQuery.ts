import { Chain } from '@core/chain/Chain'
import { useAssertWalletCore } from '@core/chain/providers/WalletCoreProvider'

import { deriveAddress } from '../../chain/utils/deriveAddress'
import { useStateDependentQuery } from '../../lib/ui/query/hooks/useStateDependentQuery'
import { useVaultPublicKeyQuery } from '../publicKey/queries/useVaultPublicKeyQuery'
import { useCurrentVaultId } from '../state/currentVaultId'

export const useVaultAddressQuery = (chain: Chain) => {
  const vaultId = useCurrentVaultId()

  const walletCore = useAssertWalletCore()

  const publicKeyQuery = useVaultPublicKeyQuery(chain)

  return useStateDependentQuery({
    state: {
      publicKey: publicKeyQuery.data,
    },
    getQuery: ({ publicKey }) => ({
      queryKey: ['vaultChainAddress', vaultId, chain],
      queryFn: async () => {
        return deriveAddress({ chain, publicKey, walletCore })
      },
    }),
  })
}
