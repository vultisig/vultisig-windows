import { Chain } from '@vultisig/core-chain/Chain'
import { addQueryParams } from '@vultisig/lib-utils/query/addQueryParams'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { mayaMidgardBaseUrl, midgardBaseUrl } from '../constants'
import { BondChain } from './config'

const midgardBaseUrls: Record<BondChain, string> = {
  [Chain.THORChain]: midgardBaseUrl,
  [Chain.MayaChain]: mayaMidgardBaseUrl,
}

const addressPrefixes: Record<BondChain, string> = {
  [Chain.THORChain]: 'thor1',
  [Chain.MayaChain]: 'maya1',
}

const unbondsPageLimit = 50

type UnbondAction = {
  height: string
  in?: { address?: string }[]
  metadata?: { bond?: { memo?: string; nodeAddress?: string } }
}

type UnbondActionsResponse = {
  actions: UnbondAction[]
}

type GetUnbondProviderInput = {
  chain: BondChain
  nodeAddress: string
  action: UnbondAction
}

/**
 * Whose bond an unbond moved, lowercased: the first address in the memo that
 * is not the node, as when a node operator unbonds on a provider's behalf,
 * or else whoever sent it. Memo layouts differ by chain and era, so the
 * provider is found by shape rather than by position.
 */
const getUnbondProvider = ({
  chain,
  nodeAddress,
  action,
}: GetUnbondProviderInput) => {
  const node = nodeAddress.toLowerCase()
  const named = action.metadata?.bond?.memo
    ?.split(':')
    .map(field => field.trim().toLowerCase())
    .find(field => field.startsWith(addressPrefixes[chain]) && field !== node)

  return named ?? action.in?.[0]?.address?.toLowerCase()
}

type FetchBondUnbondHeightsInput = {
  chain: BondChain
  bondAddress: string
  nodeAddress: string
  fromHeight: number
  /** Exclusive; omitted to look up to the latest block. */
  toHeight?: number
}

/**
 * Heights in `[fromHeight, toHeight)` where the bond address's bond on the
 * node was unbonded, by the provider or by the node operator, in one Midgard
 * request. Throws when that page is full, since older unbonds may then be
 * missing from it.
 */
export const fetchBondUnbondHeights = async ({
  chain,
  bondAddress,
  nodeAddress,
  fromHeight,
  toHeight,
}: FetchBondUnbondHeightsInput): Promise<number[]> => {
  const { actions } = await queryUrl<UnbondActionsResponse>(
    addQueryParams(`${midgardBaseUrls[chain]}/actions`, {
      address: nodeAddress,
      type: 'unbond',
      fromHeight,
      ...(toHeight === undefined ? {} : { height: toHeight }),
      limit: unbondsPageLimit,
    })
  )

  if (actions.length === unbondsPageLimit) {
    throw new Error('Midgard returned a full page of unbonds')
  }

  return actions
    .filter(
      action =>
        action.metadata?.bond?.nodeAddress?.toLowerCase() ===
          nodeAddress.toLowerCase() &&
        getUnbondProvider({ chain, nodeAddress, action }) ===
          bondAddress.toLowerCase()
    )
    .map(({ height }) => Number(height))
}
