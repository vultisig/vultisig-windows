import { EvmChain } from '@vultisig/core-chain/Chain'
import { groupItems } from '@vultisig/lib-utils/array/groupItems'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { attempt } from '@vultisig/lib-utils/attempt'
import { getAddress } from 'viem'

import { ChainApprovals } from './ChainApprovals'
import { getApprovalTokens } from './getApprovalTokens'
import {
  getApprovedTokenSpenders,
  TokenSpender,
} from './getApprovedTokenSpenders'
import { getPermit2Allowances } from './getPermit2Allowances'
import { getSpenderAllowances } from './getSpenderAllowances'
import { concurrentRequests, mapInBatches } from './mapInBatches'
import { isPermit2Chain } from './permit2'
import { Erc20Approval, Permit2Approval } from './TokenApproval'

type GetTokenApprovalsInput = {
  chain: EvmChain
  owner: string
}

type GetErc20AllowancesInput = GetTokenApprovalsInput & {
  pairs: TokenSpender[]
}

const getErc20Allowances = async ({
  chain,
  owner,
  pairs,
}: GetErc20AllowancesInput) => {
  const tokensBySpender = groupItems(pairs, ({ spender }) => spender)

  const entries = await mapInBatches({
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

  return entries.flat().filter(({ allowance }) => allowance > 0n)
}

/**
 * Lists the owner's active ERC-20 and Permit2 allowances on one EVM network.
 * Every pair in the approval history is checked both as an ERC-20 allowance
 * and, where Permit2 is read, as a Permit2 allowance, since a spender can
 * hold both.
 */
export const getTokenApprovals = async ({
  chain,
  owner,
}: GetTokenApprovalsInput): Promise<ChainApprovals> => {
  const pairs = await getApprovedTokenSpenders({ chain, owner })

  const [erc20, permit2Read] = await Promise.all([
    getErc20Allowances({ chain, owner, pairs }),
    isPermit2Chain(chain)
      ? attempt(() => getPermit2Allowances({ chain, owner, candidates: pairs }))
      : { data: { allowances: [], isComplete: true } },
  ])
  // A Permit2 outage marks the chain incomplete instead of hiding its ERC-20 rows.
  const permit2 = permit2Read.data ?? { allowances: [], isComplete: false }

  const tokens = await getApprovalTokens({
    chain,
    tokens: withoutDuplicates(
      [...erc20, ...permit2.allowances].map(({ token }) => token)
    ),
  })

  const approvals = [
    ...erc20.flatMap(({ token, spender, allowance }): Erc20Approval[] => {
      const coin = tokens[token]
      return coin
        ? [
            {
              kind: 'erc20',
              token: coin,
              spender: getAddress(spender),
              allowance,
            },
          ]
        : []
    }),
    ...permit2.allowances.flatMap(
      ({ token, spender, amount, expiration }): Permit2Approval[] => {
        const coin = tokens[token]
        return coin
          ? [
              {
                kind: 'permit2',
                token: coin,
                spender: getAddress(spender),
                allowance: amount,
                expiration,
              },
            ]
          : []
      }
    ),
  ]

  return { approvals, isComplete: permit2.isComplete }
}
