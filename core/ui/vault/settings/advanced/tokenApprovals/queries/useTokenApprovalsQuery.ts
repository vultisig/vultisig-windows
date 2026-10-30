import { useQuery } from '@tanstack/react-query'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

import { getTokenApprovals } from '../core/getTokenApprovals'
import { isTokenApprovalsSupportedChain } from '../core/tokenApprovalsChains'

type UseTokenApprovalsQueryInput = {
  chain: EvmChain
  owner: string
}

/** Cache key of the approvals list for one vault address on one network. */
export const getTokenApprovalsQueryKey = (input: UseTokenApprovalsQueryInput) =>
  ['getTokenApprovals', input] as const

/**
 * Active ERC-20 allowances of the vault address on one network. Stays idle
 * on networks the approvals history does not cover.
 */
export const useTokenApprovalsQuery = (input: UseTokenApprovalsQueryInput) =>
  useQuery({
    queryKey: getTokenApprovalsQueryKey(input),
    queryFn: () => getTokenApprovals(input),
    enabled: isTokenApprovalsSupportedChain(input.chain),
    // The lookup already retries rate limits per request; retrying the whole
    // chain of requests again would keep the spinner up for minutes.
    retry: false,
    // A revoke drops its row from the cache right away; this keeps the page
    // from refetching it back before the transaction is indexed.
    staleTime: convertDuration(1, 'min', 'ms'),
  })
