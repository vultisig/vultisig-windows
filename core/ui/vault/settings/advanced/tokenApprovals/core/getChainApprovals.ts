import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { ChainApprovals } from './ChainApprovals'
import { getSplDelegateApprovals } from './getSplDelegateApprovals'
import { getTokenApprovals } from './getTokenApprovals'
import {
  TokenApprovalsChain,
  tokenApprovalsEvmChains,
} from './tokenApprovalsChains'

type GetChainApprovalsInput = {
  chain: TokenApprovalsChain
  owner: string
}

/**
 * Active approvals of the owner on one chain: ERC-20 and Permit2 allowances
 * on EVM networks, SPL token delegates on Solana.
 */
export const getChainApprovals = async ({
  chain,
  owner,
}: GetChainApprovalsInput): Promise<ChainApprovals> =>
  isOneOf(chain, tokenApprovalsEvmChains)
    ? getTokenApprovals({ chain, owner })
    : {
        approvals: await getSplDelegateApprovals({ owner }),
        isComplete: true,
      }
