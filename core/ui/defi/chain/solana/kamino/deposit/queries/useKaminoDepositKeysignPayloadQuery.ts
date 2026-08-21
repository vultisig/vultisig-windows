import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultNullablePublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { KaminoTokenAmount } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { buildKaminoDepositKeysignPayload } from '../buildKaminoDepositKeysignPayload'

type UseKaminoDepositKeysignPayloadQueryInput = {
  vault: KaminoVaultInfo
  coin: AccountCoin
  amount: KaminoTokenAmount
}

/**
 * The keysign payload for one Kamino deposit.
 *
 * Frozen like every other keysign payload query — the confirm button rebuilds
 * it the moment signing starts, which is what keeps the embedded blockhash
 * young and re-runs the SDK's fail-closed gates against the bytes actually
 * being signed. Building on an interval instead would spend a round trip per
 * tick on a screen the user may sit on.
 */
export const useKaminoDepositKeysignPayloadQuery = ({
  vault,
  coin,
  amount,
}: UseKaminoDepositKeysignPayloadQueryInput) => {
  const currentVault = useCurrentVault()
  const publicKey = useCurrentVaultNullablePublicKey(Chain.Solana)
  // Referenced so the ceremony's wallet-core dependency is initialised before
  // signing starts, matching the other keysign payload queries.
  useAssertWalletCore()

  const hexPublicKey = publicKey
    ? Buffer.from(publicKey.data()).toString('hex')
    : undefined

  return useQuery({
    queryKey: [
      'kaminoDepositKeysignPayload',
      {
        vaultAddress: vault.descriptor.address,
        owner: coin.address,
        amount: amount.baseUnits.toString(),
        decimals: amount.decimals,
      },
    ] as const,
    enabled: hexPublicKey !== undefined,
    queryFn: () =>
      buildKaminoDepositKeysignPayload({
        vault,
        coin,
        amount,
        hexPublicKey: shouldBePresent(hexPublicKey, 'Solana public key'),
        vaultId: getVaultId(currentVault),
        localPartyId: currentVault.localPartyId,
        libType: toKeysignLibType(currentVault),
      }),
    ...noRefetchQueryOptions,
  })
}
