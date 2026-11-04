import { EvmChain } from '@vultisig/core-chain/Chain'
import { getEvmNumericChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'

import { queryOneInchApi } from './queryOneInchApi'

type HistoryTokenAction = {
  address: string
  standard: string
  fromAddress: string
  toAddress: string
  direction: string
}

type HistoryEvent = {
  id: string
  timeMs: number
  details: {
    tokenActions?: HistoryTokenAction[]
  }
}

type HistoryEventsResponse = {
  items: HistoryEvent[]
}

// A token contract and a spender the owner approved it for, lowercased.
type TokenSpender = {
  token: string
  spender: string
}

type GetApprovedTokenSpendersInput = {
  chain: EvmChain
  owner: string
}

const pageSize = 100
// 1,000 approve/revoke events covers even very active wallets and bounds the
// number of history requests per network.
const maxPages = 10

/**
 * Collects every (token, spender) pair the owner ever approved on the
 * network, from 1inch's Approve and Revoke history. Whether an allowance is
 * still active is read separately; permit-based approvals are not indexed.
 */
export const getApprovedTokenSpenders = async ({
  chain,
  owner,
}: GetApprovedTokenSpendersInput): Promise<TokenSpender[]> => {
  const ownerAddress = owner.toLowerCase()
  const pairs = new Map<string, TokenSpender>()

  let cursor: Pick<HistoryEvent, 'id' | 'timeMs'> | undefined
  for (let page = 0; page < maxPages; page++) {
    const { items } = await queryOneInchApi<HistoryEventsResponse>({
      path: `/history/v2.0/history/${ownerAddress}/events`,
      body: {
        filter: {
          chain_ids: [String(getEvmNumericChainId(chain))],
          transaction_types: ['Approve', 'Revoke'],
          limit: pageSize,
          ...(cursor
            ? { to_event_id: cursor.id, to_time_ms: cursor.timeMs }
            : {}),
        },
      },
    })

    items.forEach(({ details }) => {
      details.tokenActions?.forEach(action => {
        if (
          action.standard !== 'ERC20' ||
          action.direction !== 'On' ||
          action.fromAddress.toLowerCase() !== ownerAddress
        ) {
          return
        }

        const token = action.address.toLowerCase()
        const spender = action.toAddress.toLowerCase()
        pairs.set(`${token}:${spender}`, { token, spender })
      })
    })

    if (items.length < pageSize) {
      break
    }
    cursor = getLastItem(items)
  }

  return [...pairs.values()]
}
