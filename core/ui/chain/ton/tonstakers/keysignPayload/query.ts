import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultNullablePublicKey,
} from '@core/ui/vault/state/currentVault'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { buildTonstakersKeysignPayload, TonstakersAction } from './build'

type UseTonstakersKeysignPayloadQueryInput = {
  action: TonstakersAction
  amount: bigint
  coin: AccountCoin
  jettonWalletAddress?: string
  minimumStake?: bigint
}

export const useTonstakersKeysignPayloadQuery = ({
  action,
  amount,
  coin,
  jettonWalletAddress,
  minimumStake,
}: UseTonstakersKeysignPayloadQueryInput) => {
  const vault = useCurrentVault()
  const publicKey = useCurrentVaultNullablePublicKey(Chain.Ton)
  const walletCore = useAssertWalletCore()

  return useQuery({
    queryKey: [
      'tonstakersKeysignPayload',
      action,
      amount,
      coin.address,
      jettonWalletAddress,
      minimumStake,
      getVaultId(vault),
    ],
    queryFn: () =>
      buildTonstakersKeysignPayload({
        action,
        amount,
        coin,
        ownerAddress: coin.address,
        jettonWalletAddress,
        minimumStake,
        vaultId: getVaultId(vault),
        localPartyId: vault.localPartyId,
        publicKey: shouldBePresent(publicKey),
        libType: toKeysignLibType(vault),
        walletCore,
      }),
    enabled:
      (action === 'stake' && minimumStake !== undefined) ||
      (action === 'unstake' && !!jettonWalletAddress),
    // A TON seqno is embedded in blockchainSpecific. Rebuild it whenever this
    // review screen mounts so an identical second transaction cannot reuse it.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
