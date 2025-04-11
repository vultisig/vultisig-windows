import { Chain } from '@core/chain/Chain'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useQuery } from '@tanstack/react-query'

import { getVaultPublicKey } from '../getVaultPublicKey'

export const useVaultPublicKeyQuery = (chain: Chain) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  return useQuery({
    queryKey: ['vaultPublicKey'],
    queryFn: () =>
      getVaultPublicKey({
        chain,
        walletCore,
        vault,
      }),
  })
}
