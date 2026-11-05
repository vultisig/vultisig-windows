import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { buildSendKeysignPayload } from '@vultisig/core-mpc/keysign/send/build'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useTranslation } from 'react-i18next'

import { buildSplRevokeKeysignPayload } from '../core/buildSplRevokeKeysignPayload'
import { getEvmRevokeCall } from '../core/getEvmRevokeCall'
import { readRevokeKeysignPayload } from '../core/readRevokeKeysignPayload'
import { isRevokedBy } from '../core/RevokeIntent'
import { TokenApproval } from '../core/TokenApproval'

/**
 * Keysign payload that clears one approval: a zero-value call carrying
 * `approve(spender, 0)` or Permit2 `lockdown` as calldata on EVM, a raw SPL
 * `Revoke` transaction on Solana. The verify screen rebuilds it when signing
 * starts, which keeps the Solana blockhash recent. Every build is read back
 * from its own bytes and refused unless it clears exactly this approval, so
 * the check covers the payload that is actually signed.
 */
export const useRevokeApprovalKeysignPayloadQuery = (
  approval: TokenApproval
) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const { chain } = approval.token
  const publicKey = useCurrentVaultPublicKey(chain)
  const address = useCurrentVaultAddress(chain)

  const signer = {
    vaultId: getVaultId(vault),
    localPartyId: vault.localPartyId,
    libType: toKeysignLibType(vault),
  }

  const build = () => {
    if (approval.kind === 'splDelegate') {
      return buildSplRevokeKeysignPayload({
        approval,
        owner: address,
        hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
        ...signer,
      })
    }

    const { receiver, calldata } = getEvmRevokeCall(approval)
    return buildSendKeysignPayload({
      coin: { ...chainFeeCoin[approval.token.chain], address },
      receiver,
      amount: 0n,
      memo: calldata,
      publicKey,
      walletCore,
      ...signer,
    })
  }

  return useQuery({
    queryKey: [
      'revokeApprovalKeysignPayload',
      {
        kind: approval.kind,
        chain,
        token: approval.token.id,
        spender: approval.spender,
        ...(approval.kind === 'splDelegate'
          ? {
              tokenAccount: approval.tokenAccount,
              programId: approval.programId,
            }
          : {}),
        address,
        ...signer,
      },
    ],
    queryFn: async () => {
      const payload = await build()
      const intent = readRevokeKeysignPayload(payload)
      if (!intent || !isRevokedBy({ approval, intent })) {
        throw new Error(t('revoke_approval_unreadable'))
      }
      return payload
    },
    ...noRefetchQueryOptions,
  })
}
