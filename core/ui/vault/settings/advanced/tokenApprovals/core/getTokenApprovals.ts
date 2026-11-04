import { EvmChain } from '@vultisig/core-chain/Chain'
import { groupItems } from '@vultisig/lib-utils/array/groupItems'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { getAddress } from 'viem'

import { getApprovalTokens } from './getApprovalTokens'
import { getApprovedTokenSpenders } from './getApprovedTokenSpenders'
import { getSpenderAllowances } from './getSpenderAllowances'
import { isUnlimitedAllowance } from './isUnlimitedAllowance'
import { concurrentRequests, mapInBatches } from './mapInBatches'
import { TokenApproval } from './TokenApproval'

type GetTokenApprovalsInput = {
  chain: EvmChain
  owner: string
}

/**
 * Lists the owner's active ERC-20 allowances on one network: pairs found in
 * the approval history whose current allowance is above zero, unlimited ones
 * first.
 */
export const getTokenApprovals = async ({
  chain,
  owner,
}: GetTokenApprovalsInput): Promise<TokenApproval[]> => {
  const pairs = await getApprovedTokenSpenders({ chain, owner })
  if (pairs.length === 0) {
    return []
  }

  const tokensBySpender = groupItems(pairs, ({ spender }) => spender)

  const allowanceEntries = (
    await mapInBatches({
      items: Object.entries(tokensBySpender),
      batchSize: concurrentRequests,
      map: async ([spender, spenderPairs]) => {
        const allowances = await getSpenderAllowances({
          chain,
          owner,
          spender,
          tokens: spenderPairs.map(({ token }) => token),
        })
        return Object.entries(allowances).map(([token, allowance]) => ({
          token,
          spender,
          allowance,
        }))
      },
    })
  ).flat()

  const active = allowanceEntries.filter(({ allowance }) => allowance > 0n)
  if (active.length === 0) {
    return []
  }

  const tokens = await getApprovalTokens({
    chain,
    tokens: withoutDuplicates(active.map(({ token }) => token)),
  })

  return active
    .flatMap(({ token, spender, allowance }) => {
      const coin = tokens[token]
      return coin
        ? [{ token: coin, spender: getAddress(spender), allowance }]
        : []
    })
    .sort(
      (a, b) =>
        Number(isUnlimitedAllowance(b.allowance)) -
          Number(isUnlimitedAllowance(a.allowance)) ||
        a.token.ticker.localeCompare(b.token.ticker)
    )
}
