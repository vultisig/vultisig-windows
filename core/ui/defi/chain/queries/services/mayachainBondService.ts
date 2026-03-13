import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import {
  daysInYear,
  mayachainBlockTimeSeconds,
  nanosecondsInSecond,
  secondsInDay,
} from '@core/ui/defi/chain/constants/time'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { mayaMidgardBaseUrl, mayanodeBaseUrl } from '../constants'
import { mayaCoin } from '../tokens'
import { ThorchainBondPosition } from '../types'
import { toDecimalFactor } from '../utils/decimals'
import { parseBigint, parseNumber, toBondStatusLabel } from '../utils/parsers'

const mayaDecimalFactor = toDecimalFactor(mayaCoin.decimals)

type BondProvider = {
  bond_address?: string
  bond?: string
}

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
    providers?: BondProvider[]
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

type MayachainNode = {
  node_address?: string
  status?: string
  bond_address?: string
  bond_providers?: {
    providers?: BondProvider[]
  }
}

const getBondedNodes = (address: string) =>
  queryUrl<BondedNodesResponse>(`${mayaMidgardBaseUrl}/bonds/${address}`)

const getNodeDetails = (address: string) =>
  queryUrl<NodeDetailsResponse>(`${mayanodeBaseUrl}/node/${address}`)

const getNodes = () => queryUrl<MayachainNode[]>(`${mayanodeBaseUrl}/nodes`)

/** Fetches the list of churn events from MayaChain Midgard. */
export const fetchChurns = () =>
  queryUrl<ChurnEntry[]>(`${mayaMidgardBaseUrl}/churns`)

/** Fetches MayaChain network info including bonding APY and next churn height. */
export const fetchNetworkInfo = () =>
  queryUrl<NetworkInfo>(`${mayaMidgardBaseUrl}/network`)

/** Fetches MayaChain Midgard health info including last aggregated block. */
export const fetchHealth = () =>
  queryUrl<HealthInfo>(`${mayaMidgardBaseUrl}/health`)

const estimateNextMayaChurn = ({
  nextChurnHeight,
  currentHeight,
  referenceTimestamp,
  churns,
}: {
  nextChurnHeight?: number
  currentHeight: number
  referenceTimestamp: number
  churns: ChurnEntry[]
}) => {
  if (!nextChurnHeight || nextChurnHeight <= currentHeight) return undefined

  const deriveAverageBlockTime = (entries: ChurnEntry[]) => {
    if (!entries || entries.length < 2) return mayachainBlockTimeSeconds

    const sorted = entries
      .map(churn => ({
        height: parseNumber(churn.height),
        date: parseNumber(churn.date) / nanosecondsInSecond,
      }))
      .filter(entry => entry.height && entry.date)
      .sort((a, b) => b.height - a.height)

    if (sorted.length < 2) return mayachainBlockTimeSeconds

    let totalSeconds = 0
    let totalBlocks = 0

    for (let i = 0; i < sorted.length - 1; i++) {
      const newer = sorted[i]
      const older = sorted[i + 1]
      const blockDiff = newer.height - older.height
      const timeDiff = newer.date - older.date
      if (blockDiff > 0 && timeDiff > 0) {
        totalBlocks += blockDiff
        totalSeconds += timeDiff
      }
    }

    return totalBlocks > 0
      ? totalSeconds / totalBlocks
      : mayachainBlockTimeSeconds
  }

  const avgBlockTime = deriveAverageBlockTime(churns)
  const remainingBlocks = nextChurnHeight - currentHeight
  const etaSeconds = remainingBlocks * avgBlockTime
  return new Date((referenceTimestamp + etaSeconds) * 1000)
}

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
  const currentAward = parseNumber(details?.current_award) / mayaDecimalFactor
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
      ? myAward / fromChainAmount(myBond, mayaCoin.decimals) / timeDiffYears
      : 0
  const apy = Math.pow(1 + apr / daysInYear, daysInYear) - 1

  return {
    myBond,
    myAward,
    apy,
    status: toBondStatusLabel(details?.status),
  }
}

type FetchBondPositionsInput = {
  address: string
  prices: Record<string, number>
  churns: ChurnEntry[]
  networkInfo: NetworkInfo
  health: HealthInfo
}

/** Fetches all MayaChain bond positions for a given address. */
export const fetchBondPositions = async ({
  address,
  prices,
  churns,
  networkInfo,
  health,
}: FetchBondPositionsInput) => {
  const bondedNodes = await getBondedNodes(address)
  const nodes = bondedNodes?.nodes ?? []
  const mayachainNodes = await getNodes().catch(() => [])

  const nextChurn = estimateNextMayaChurn({
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
      decimals: mayaCoin.decimals,
      price: prices[coinKeyToString(mayaCoin)] ?? 0,
    })

    positions.push({
      id: 'maya-bond-cacao',
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
  const normalizedAddress = address.toLowerCase()
  const availableNodes = mayachainNodes
    .map(node => {
      if (!node.node_address) return null
      const addr = node.node_address.toLowerCase()
      if (bondedAddresses.has(addr)) return null
      const status = toBondStatusLabel(node.status)
      if (
        status === 'active' ||
        status === 'ready' ||
        status === 'standby' ||
        status === 'whitelisted'
      ) {
        const providers = node.bond_providers?.providers ?? []
        const isProvider = providers.some(
          provider => provider.bond_address?.toLowerCase() === normalizedAddress
        )
        const isNodeOperator =
          node.bond_address?.toLowerCase() === normalizedAddress
        if (!isProvider && !isNodeOperator) return null
        return node.node_address
      }
      return null
    })
    .filter((addr): addr is string => addr !== null)

  return {
    positions,
    totalBonded,
    availableNodes,
    canUnbond: true,
  }
}
