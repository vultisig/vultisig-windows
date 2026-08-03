import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { buildLimitSwapCancelKeysignPayload } from '@vultisig/core-mpc/keysign/swap/buildLimitSwapCancelKeysignPayload'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { omit } from '@vultisig/lib-utils/record/omit'

type UseLimitOrderCancelKeysignPayloadQueryInput = {
  /** The funding chain's gas asset — a cancel moves nothing of its own. */
  signingCoin: AccountCoin
  /** The `m=<` memo from `buildCancelLimitSwapMemo`. */
  memo: string
}

/**
 * Build the keysign payload for a limit-order cancellation.
 *
 * The SDK owns the branching (a THORChain `MsgDeposit` versus a dust transfer to
 * the live Asgard inbound) and every fail-closed gate, including refusing a memo
 * that re-targets rather than cancels and deriving the attached dust from the
 * live `dust_threshold` rather than guessing it. This supplies only the vault
 * identity, key and `walletCore`, exactly as the placement query does; the SDK's
 * refusals surface through the query error, which the verify screen renders.
 */
export const useLimitOrderCancelKeysignPayloadQuery = ({
  signingCoin,
  memo,
}: UseLimitOrderCancelKeysignPayloadQueryInput) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(signingCoin.chain)

  const input = {
    signingCoin,
    memo,
    vaultId: getVaultId(vault),
    localPartyId: vault.localPartyId,
    publicKey,
    libType: toKeysignLibType(vault),
    walletCore,
  }

  return useQuery({
    // Keyed off the whole signing identity, as the placement query is: a reshare
    // keeps the ECDSA key (and so the vault id) while changing `localPartyId`
    // and `libType`, and refetch-on-mount is off — so a vault-id-only key could
    // serve a payload built for the previous participant set.
    queryKey: [
      'limitOrderCancelKeysignPayload',
      omit(input, 'walletCore', 'publicKey'),
    ],
    queryFn: () => buildLimitSwapCancelKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}
