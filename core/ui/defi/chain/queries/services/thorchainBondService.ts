import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import {
  daysInYear,
  nanosecondsInSecond,
  secondsInDay,
} from '@core/ui/defi/chain/constants/time'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { midgardBaseUrl, thornodeBaseUrl } from '../constants'
import { runeCoin } from '../tokens'
import { ThorchainBondPosition } from '../types'
import { toDecimalFactor } from '../utils/decimals'
import {
  estimateNextChurn,
  parseBigint,
  parseNumber,
  toBondStatusLabel,
} from '../utils/parsers'

const runeDecimalFactor = toDecimalFactor(runeCoin.decimals)

type BondedNodesResponse = {
  nodes?: Array<{
    status?: string
    address: string
    bond?: string
  }>
}

type NodeDetailsResponse = {
  bond_providers?: {
    node_operator_fee?: string
    providers?: Array<{
      bond_address?: string
      bond?: string
    }>
  }
  current_award?: string
  status?: string
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

type ThorchainNode = {
  node_address?: string
  status?: string
}

const getBondedNodes = (address: string) =>
  queryUrl<BondedNodesResponse>(`${midgardBaseUrl}/bonds/${address}`)

const getNodeDetails = (address: string) =>
  queryUrl<NodeDetailsResponse>(`${thornodeBaseUrl}/node/${address}`)

const getNodes = () => queryUrl<ThorchainNode[]>(`${thornodeBaseUrl}/nodes`)

export const fetchChurns = () =>
  queryUrl<ChurnEntry[]>(`${midgardBaseUrl}/churns`)
export const fetchNetworkInfo = () =>
  queryUrl<NetworkInfo>(`${midgardBaseUrl}/network`)
export const fetchHealth = () =>
  queryUrl<HealthInfo>(`${midgardBaseUrl}/health`)
export const fetchNetwork = () =>
  queryUrl<{ vaults_migrating?: boolean }>(`${thornodeBaseUrl}/network`)

const calculateBondMetrics = async (
  nodeAddress: string,
  bondAddress: string,
  churns: ChurnEntry[]
) => {
  const details = await getNodeDetails(nodeAddress)

  const providers = details?.bond_providers?.providers ?? []
  const myBond = providers
    .filter(p => p.bond_address?.toLowerCase() === bondAddress.toLowerCase())
    .reduce((acc, provider) => acc + parseBigint(provider.bond), 0n)
  const totalBond = providers.reduce(
    (acc, provider) => acc + parseBigint(provider.bond),
    0n
  )

  const ownership = totalBond > 0n ? Number(myBond) / Number(totalBond) : 0
  const nodeOperatorFee =
    (parseNumber(details?.bond_providers?.node_operator_fee) ?? 0) / 10_000
  const currentAward = parseNumber(details?.current_award) / runeDecimalFactor
  const myAward = currentAward * (1 - nodeOperatorFee) * ownership

  const mostRecentChurn = churns?.[0]
  const recentChurnTimestamp =
    parseNumber(mostRecentChurn?.date) / nanosecondsInSecond
  const now = Date.now() / 1000
  const timeDiffYears =
    recentChurnTimestamp && now > recentChurnTimestamp
      ? (now - recentChurnTimestamp) / (secondsInDay * daysInYear)
      : 0
  const apr =
    myBond > 0n && timeDiffYears > 0
      ? myAward / fromChainAmount(myBond, runeCoin.decimals) / timeDiffYears
      : 0
  const apy = Math.pow(1 + apr / daysInYear, daysInYear) - 1

  return {
    myBond,
    myAward,
    apy,
    status: toBondStatusLabel(details?.status),
  }
}

export const fetchBondPositions = async (
  address: string,
  prices: Record<string, number>,
  churns: ChurnEntry[],
  networkInfo: NetworkInfo,
  health: HealthInfo,
  canUnbond: boolean
) => {
  const bondedNodes = await getBondedNodes(address)
  const nodes = bondedNodes?.nodes ?? []
  const thorchainNodes = await getNodes().catch(() => [])

  const nextChurn = estimateNextChurn({
    nextChurnHeight: networkInfo?.nextChurnHeight,
    currentHeight: health?.lastAggregated?.height ?? 0,
    referenceTimestamp: health?.lastAggregated?.timestamp ?? Date.now() / 1000,
    churns,
  })

  const positions: ThorchainBondPosition[] = []

  for (const node of nodes) {
    const metrics = await calculateBondMetrics(
      node.address,
      address,
      churns
    ).catch(() => undefined)
    const amount = metrics?.myBond ?? parseBigint(node.bond)
    const apy = metrics?.apy ?? networkInfo?.bondingAPY ?? 0
    const nextReward = metrics?.myAward ?? 0
    const fiatValue = getCoinValue({
      amount,
      decimals: runeCoin.decimals,
      price: prices[coinKeyToString(runeCoin)] ?? 0,
    })

    positions.push({
      id: 'thor-bond-rune',
      nodeAddress: node.address,
      amount,
      apy,
      nextReward,
      nextChurn,
      status: metrics?.status ?? toBondStatusLabel(node.status),
      fiatValue,
    })
  }

  const totalBonded = positions.reduce((acc, p) => acc + p.amount, 0n)

  const bondedAddresses = new Set(nodes.map(node => node.address.toLowerCase()))
  const availableNodes = thorchainNodes
    .map(node => {
      if (!node.node_address) return null
      const addr = node.node_address.toLowerCase()
      const status = toBondStatusLabel(node.status)
      if (bondedAddresses.has(addr)) return null
      if (
        status === 'active' ||
        status === 'ready' ||
        status === 'standby' ||
        status === 'whitelisted'
      ) {
        return node.node_address
      }
      return null
    })
    .filter((addr): addr is string => addr !== null)

  return {
    positions,
    totalBonded,
    availableNodes,
    canUnbond,
  }
}
