import { Chain } from '@core/chain/Chain'
import { useAssertWalletCore } from '@core/chain-ui/providers/WalletCoreProvider'
import { useQuery } from '@tanstack/react-query'

import { useCurrentVault } from '../../state/currentVault'
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
