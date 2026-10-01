import {
  daysInYear,
  mayachainBlockTimeSeconds,
  nanosecondsInSecond,
  secondsInDay,
} from '@core/ui/defi/chain/constants/time'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { addQueryParams } from '@vultisig/lib-utils/query/addQueryParams'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { toRecentBondChurns } from '../bondRewards/churns'
import {
  getBondProviderReward,
  getMayachainBondProviderRewards,
} from '../bondRewards/providerRewards'
import { mayaMidgardBaseUrl, mayanodeBaseUrl } from '../constants'
import { mayaCoin } from '../tokens'
import { RawThorchainBondPosition } from '../types'
import {
  canUnbondNode,
  estimateNextChurn,
  parseBigint,
  parseNumber,
  toBondStatusLabel,
} from '../utils/parsers'

const mayanodeHeaders = { 'X-Client-ID': 'vultisig' }

type BondProvider = {
  bond_address?: string
  bond?: string
  reward?: string
}

type ChurnEntry = {
  height?: string
  date?: string
}

type NetworkInfo = {
  bondingAPY?: number
  nextChurnHeight?: number
}

type HealthInfo = {
  lastAggregated?: {
    height?: number
    timestamp?: number
  }
}

/**
 * Full node response from mayanode /nodes endpoint. MAYANode names the
 * accruing award `reward` (THORNode's `current_award`) and reports each
 * provider's share of it on their own row.
 */
type MayachainNode = {
  node_address?: string
  status?: string
  bond_address?: string
  reward?: string
  bond_providers?: {
    node_operator_fee?: string
    providers?: BondProvider[]
  }
}

/** Fetches all MayaChain nodes. Uses mayanode directly (no CORS in production Wails builds). */
const fetchAllNodes = () =>
  queryUrl<MayachainNode[]>(`${mayanodeBaseUrl}/nodes`, {
    headers: mayanodeHeaders,
  })

type NodeAtHeightInput = {
  nodeAddress: string
  height: number
}

const fetchNodeAtHeight = ({ nodeAddress, height }: NodeAtHeightInput) =>
  queryUrl<MayachainNode>(
    addQueryParams(`${mayanodeBaseUrl}/node/${nodeAddress}`, { height }),
    { headers: mayanodeHeaders }
  )

/**
 * Each bond provider's share of the award the node held at a past block.
 * Read one block before a churn, it is what that churn paid out.
 */
export const fetchMayachainBondProviderRewards = async (
  input: NodeAtHeightInput
) => {
  const node = await fetchNodeAtHeight(input)

  return getMayachainBondProviderRewards(node.bond_providers?.providers ?? [])
}

/** Fetches the list of churn events from MayaChain Midgard. */
export const fetchChurns = () =>
  queryUrl<ChurnEntry[]>(`${mayaMidgardBaseUrl}/churns`)

/** Fetches MayaChain network info including bonding APY and next churn height. */
export const fetchNetworkInfo = () =>
  queryUrl<NetworkInfo>(`${mayaMidgardBaseUrl}/network`)

/** Fetches MayaChain Midgard health info including last aggregated block. */
export const fetchHealth = () =>
  queryUrl<HealthInfo>(`${mayaMidgardBaseUrl}/health`)

type CalculateBondMetricsInput = {
  node: MayachainNode
  address: string
  churns: ChurnEntry[]
}

/** Calculates bond metrics from full node data (no extra network call needed). */
const calculateBondMetrics = ({
  node,
  address,
  churns,
}: CalculateBondMetricsInput) => {
  const providers = node.bond_providers?.providers ?? []
  const normalizedAddress = address.toLowerCase()

  const myBond = providers
    .filter(p => p.bond_address?.toLowerCase() === normalizedAddress)
    .reduce((acc, provider) => acc + parseBigint(provider.bond), 0n)

  const myAward = fromChainAmount(
    getBondProviderReward({
      rewards: getMayachainBondProviderRewards(providers),
      bondAddress: address,
    }) ?? 0n,
    mayaCoin.decimals
  )

  const mostRecentChurn = churns[0]
  const recentChurnTimestamp =
    parseNumber(mostRecentChurn?.date) / nanosecondsInSecond
  const now = Date.now() / 1000
  const timeDiffYears =
    recentChurnTimestamp && now > recentChurnTimestamp
      ? (now - recentChurnTimestamp) / (secondsInDay * daysInYear)
      : 0
  const apr =
    myBond > 0n && timeDiffYears > 0
      ? myAward / fromChainAmount(myBond, mayaCoin.decimals) / timeDiffYears
      : 0
  const apy = Math.pow(1 + apr / daysInYear, daysInYear) - 1

  return { myBond, myAward, apy, status: toBondStatusLabel(node.status) }
}

type FetchBondPositionsInput = {
  address: string
  churns: ChurnEntry[]
  networkInfo: NetworkInfo
  health: HealthInfo
}

/**
 * Fetches all MayaChain bond positions for a given address as price-free raw
 * data; fiat values are joined from live prices at render.
 * Uses the iOS pattern: fetch all nodes, filter client-side for the user's bonds.
 * Maya Midgard does not have a /bonds/{address} endpoint.
 */
export const fetchBondPositions = async ({
  address,
  churns,
  networkInfo,
  health,
}: FetchBondPositionsInput) => {
  const allNodes = await fetchAllNodes().catch(() => [])
  if (!allNodes || allNodes.length === 0) {
    return {
      positions: [],
      totalBonded: 0n,
      availableNodes: [],
      recentChurns: toRecentBondChurns(churns),
    }
  }

  const normalizedAddress = address.toLowerCase()

  const nextChurn = estimateNextChurn({
    nextChurnHeight: networkInfo?.nextChurnHeight,
    currentHeight: health?.lastAggregated?.height ?? 0,
    referenceTimestamp: health?.lastAggregated?.timestamp ?? Date.now() / 1000,
    churns,
    blockTimeSeconds: mayachainBlockTimeSeconds,
  })

  const positions: RawThorchainBondPosition[] = []
  const bondedNodeAddresses = new Set<string>()

  for (const node of allNodes) {
    if (!node.node_address) continue

    const providers = node.bond_providers?.providers ?? []
    const isProvider = providers.some(
      p => p.bond_address?.toLowerCase() === normalizedAddress
    )
    if (!isProvider) continue

    bondedNodeAddresses.add(node.node_address.toLowerCase())

    const metrics = calculateBondMetrics({ node, address, churns })
    const apy = metrics.apy || (networkInfo?.bondingAPY ?? 0)

    positions.push({
      id: 'maya-bond-cacao',
      nodeAddress: node.node_address,
      amount: metrics.myBond,
      apy,
      nextReward: metrics.myAward,
      nextChurn,
      status: metrics.status,
      fiatBasis: {
        coinKey: coinKeyToString(mayaCoin),
        amount: fromChainAmount(metrics.myBond, mayaCoin.decimals),
      },
      canUnbond: canUnbondNode(metrics.status),
    })
  }

  const totalBonded = positions.reduce((acc, p) => acc + p.amount, 0n)

  const availableNodes = allNodes
    .filter(node => {
      if (!node.node_address) return false
      if (bondedNodeAddresses.has(node.node_address.toLowerCase())) return false

      const status = toBondStatusLabel(node.status)
      if (
        status !== 'active' &&
        status !== 'ready' &&
        status !== 'standby' &&
        status !== 'whitelisted'
      ) {
        return false
      }

      const providers = node.bond_providers?.providers ?? []
      const isProvider = providers.some(
        p => p.bond_address?.toLowerCase() === normalizedAddress
      )
      const isNodeOperator =
        node.bond_address?.toLowerCase() === normalizedAddress
      return isProvider || isNodeOperator
    })
    .map(node => node.node_address!)

  return {
    positions,
    totalBonded,
    availableNodes,
    recentChurns: toRecentBondChurns(churns),
  }
}
