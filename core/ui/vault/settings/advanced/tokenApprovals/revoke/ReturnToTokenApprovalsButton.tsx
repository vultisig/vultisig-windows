import { useTxHash } from '@core/ui/chain/state/txHash'
import { useTxStatusQuery } from '@core/ui/chain/tx/status/useTxStatusQuery'
import { Button } from '@lib/ui/buttons/Button'
import { useSetNavigation } from '@lib/ui/navigation/state'
import { ValueProp } from '@lib/ui/props'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { TokenApproval } from '../core/TokenApproval'
import { getTokenApprovalsQueryKey } from '../queries/useTokenApprovalsQuery'
import { TokenApprovalsReturnTarget } from './useTokenApprovalsReturnTarget'

/**
 * Done button for a revoke: goes back to the Token Approvals page on the same
 * network so the user can keep revoking. The revoked row is dropped from the
 * list only once the transaction has confirmed; a pending or failed revoke
 * leaves it there.
 */
export const ReturnToTokenApprovalsButton = ({
  value: {
    revoke: { chain, owner, token, spender },
    pageIndex,
  },
}: ValueProp<TokenApprovalsReturnTarget>) => {
  const { t } = useTranslation()
  const setNavigation = useSetNavigation()
  const queryClient = useQueryClient()
  // Shares the done screen's status poll, so this adds no requests.
  const { data: txStatus } = useTxStatusQuery({
    chain,
    hash: useTxHash(),
    senderAccountId: owner,
  })

  const returnToPage = () => {
    if (txStatus?.status === 'success') {
      queryClient.setQueryData<TokenApproval[]>(
        getTokenApprovalsQueryKey({ chain, owner }),
        approvals =>
          approvals?.filter(
            approval =>
              approval.token.id.toLowerCase() !== token.toLowerCase() ||
              approval.spender.toLowerCase() !== spender.toLowerCase()
          )
      )
    }
    setNavigation(state => ({
      ...state,
      history: state.history.slice(0, pageIndex + 1),
    }))
  }

  return (
    <Button data-testid="tx-success-done" onClick={returnToPage}>
      {t('done')}
    </Button>
  )
}
