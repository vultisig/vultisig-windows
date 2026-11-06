import { useOptionalNavigationHistory } from '@lib/ui/navigation/state'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { readRevokeKeysignPayload } from '../core/readRevokeKeysignPayload'
import { RevokeIntent } from '../core/RevokeIntent'

/** A signed revoke and where the Token Approvals page sits in the history. */
export type TokenApprovalsReturnTarget = {
  revoke: RevokeIntent
  pageIndex: number
}

/**
 * Non-null when the signed transaction is a revoke started from the Token
 * Approvals page, so the done screen can send the user back there.
 */
export const useTokenApprovalsReturnTarget = (
  keysignPayload: KeysignPayload
): TokenApprovalsReturnTarget | null => {
  // Optional: the done screen is also hosted in the dApp popup.
  const history = useOptionalNavigationHistory() ?? []

  const revoke = readRevokeKeysignPayload(keysignPayload)
  const pageIndex = history.map(({ id }) => id).lastIndexOf('tokenApprovals')

  return revoke && pageIndex !== -1 ? { revoke, pageIndex } : null
}
