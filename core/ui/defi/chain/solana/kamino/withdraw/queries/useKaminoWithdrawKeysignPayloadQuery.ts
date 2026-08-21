import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultNullablePublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { KaminoWithdrawRequest } from '@vultisig/core-chain/chains/solana/kamino/tx/validate'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { buildKaminoWithdrawKeysignPayload } from '../buildKaminoWithdrawKeysignPayload'

type UseKaminoWithdrawKeysignPayloadQueryInput = {
  vault: KaminoVaultInfo
  coin: AccountCoin
  request: KaminoWithdrawRequest
}

/**
 * The keysign payload for one Kamino withdrawal. Frozen, and rebuilt by the
 * confirm button the moment signing starts — see the deposit query for why the
 * blockhash and the fail-closed gates both depend on that.
 */
export const useKaminoWithdrawKeysignPayloadQuery = ({
  vault,
  coin,
  request,
}: UseKaminoWithdrawKeysignPayloadQueryInput) => {
  const currentVault = useCurrentVault()
  const publicKey = useCurrentVaultNullablePublicKey(Chain.Solana)
  useAssertWalletCore()

  const hexPublicKey = publicKey
    ? Buffer.from(publicKey.data()).toString('hex')
    : undefined

  return useQuery({
    queryKey: [
      'kaminoWithdrawKeysignPayload',
      {
        vaultAddress: vault.descriptor.address,
        owner: coin.address,
        shares: request.shares.baseUnits.toString(),
        unstakedShares: request.unstakedShares.baseUnits.toString(),
      },
    ] as const,
    enabled: hexPublicKey !== undefined,
    queryFn: () =>
      buildKaminoWithdrawKeysignPayload({
        vault,
        coin,
        request,
        hexPublicKey: shouldBePresent(hexPublicKey, 'Solana public key'),
        vaultId: getVaultId(currentVault),
        localPartyId: currentVault.localPartyId,
        libType: toKeysignLibType(currentVault),
      }),
    ...noRefetchQueryOptions,
  })
}
