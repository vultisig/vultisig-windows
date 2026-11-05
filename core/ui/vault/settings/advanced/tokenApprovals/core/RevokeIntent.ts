import { EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

import { TokenApproval } from './TokenApproval'

type EvmRevokeIntent = {
  chain: EvmChain
  owner: string
  token: string
  spender: string
}

/**
 * What a revoke transaction clears, as read from the bytes being signed:
 * `approve(spender, 0)` on the token, `lockdown([(token, spender)])` on
 * Permit2, or an SPL `Revoke` on one token account.
 */
export type RevokeIntent =
  | ({ kind: 'erc20' } & EvmRevokeIntent)
  | ({ kind: 'permit2' } & EvmRevokeIntent)
  | {
      kind: 'splDelegate'
      chain: typeof OtherChain.Solana
      owner: string
      tokenAccount: string
    }

type IsRevokedByInput = {
  approval: TokenApproval
  intent: RevokeIntent
}

/** Whether `intent` clears `approval`. */
export const isRevokedBy = ({
  approval,
  intent,
}: IsRevokedByInput): boolean => {
  if (approval.kind === 'splDelegate') {
    return (
      intent.kind === 'splDelegate' &&
      approval.tokenAccount === intent.tokenAccount
    )
  }
  if (intent.kind === 'splDelegate') {
    return false
  }

  return (
    approval.kind === intent.kind &&
    approval.token.chain === intent.chain &&
    areLowerCaseEqual(approval.token.id, intent.token) &&
    areLowerCaseEqual(approval.spender, intent.spender)
  )
}
