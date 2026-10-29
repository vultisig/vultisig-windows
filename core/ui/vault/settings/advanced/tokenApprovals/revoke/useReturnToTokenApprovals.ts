import { useNavigation } from '@lib/ui/navigation/state'
import { useQueryClient } from '@tanstack/react-query'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { getKeysignApprovalRevoke } from '../core/getKeysignApprovalRevoke'
import { TokenApproval } from '../core/TokenApproval'
import { getTokenApprovalsQueryKey } from '../queries/useTokenApprovalsQuery'

/**
 * After a revoke signed from the Token Approvals page, returns a callback that
 * goes back to that page, on the same network and without the revoked row, so
 * the user can keep revoking. Null for any other transaction.
 */
export const useReturnToTokenApprovals = (keysignPayload: KeysignPayload) => {
  const [{ history }, setNavigation] = useNavigation()
  const queryClient = useQueryClient()

  const revoke = getKeysignApprovalRevoke(keysignPayload)
  const pageIndex = history.map(({ id }) => id).lastIndexOf('tokenApprovals')
  if (!revoke || pageIndex === -1) {
    return null
  }

  const { chain, owner, token, spender } = revoke

  return () => {
    queryClient.setQueryData<TokenApproval[]>(
      getTokenApprovalsQueryKey({ chain, owner }),
      approvals =>
        approvals?.filter(
          approval =>
            approval.token.id.toLowerCase() !== token.toLowerCase() ||
            approval.spender.toLowerCase() !== spender.toLowerCase()
        )
    )
    setNavigation(state => ({
      ...state,
      history: state.history.slice(0, pageIndex + 1),
    }))
  }
}
