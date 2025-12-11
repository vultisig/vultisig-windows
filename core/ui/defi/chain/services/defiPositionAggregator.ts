import { Chain } from '@core/chain/Chain'
import { sum } from '@lib/utils/array/sum'

import { DefiChainPositions } from '../queries/types'

type ChainAggregates = {
  totalFiat: number
  bondFiat: number
  stakeFiat: number
  positionsWithBalanceCount: number
}

type DefiAggregatesInput = {
  chain: Chain
  selectedPositionIds: string[]
  thorchain?: DefiChainPositions | undefined
  maya?: DefiChainPositions | undefined
}

const aggregatePositions = (
  data?: DefiChainPositions,
  selectedPositionIds: string[] = []
): ChainAggregates => {
  if (!data)
    return {
      totalFiat: 0,
      bondFiat: 0,
      stakeFiat: 0,
      positionsWithBalanceCount: 0,
    }

  const selected = new Set(selectedPositionIds)
  const bondPositions =
    data.bond?.positions.filter(
      position => selected.has(position.id) && position.amount > 0n
    ) ?? []
  const stakePositions =
    data.stake?.positions.filter(
      position => selected.has(position.id) && position.amount > 0n
    ) ?? []

  const bondFiat = sum(bondPositions.map(position => position.fiatValue))
  const stakeFiat = sum(stakePositions.map(position => position.fiatValue))

  const totalFiat = bondFiat + stakeFiat
  const positionsWithBalanceCount = bondPositions.length + stakePositions.length

  return { totalFiat, bondFiat, stakeFiat, positionsWithBalanceCount }
}

const defaultAggregates: ChainAggregates = {
  totalFiat: 0,
  bondFiat: 0,
  stakeFiat: 0,
  positionsWithBalanceCount: 0,
}

type ChainAggregator = (input: {
  selectedPositionIds: string[]
  thorchain?: DefiChainPositions
  maya?: DefiChainPositions
}) => ChainAggregates

const chainAggregators: Partial<Record<Chain, ChainAggregator>> = {
  [Chain.THORChain]: ({ selectedPositionIds, thorchain }) =>
    aggregatePositions(thorchain, selectedPositionIds),
  [Chain.MayaChain]: ({ selectedPositionIds, maya }) =>
    aggregatePositions(maya, selectedPositionIds),
}

export const aggregateDefiPositions = ({
  chain,
  selectedPositionIds,
  thorchain,
  maya,
}: DefiAggregatesInput): ChainAggregates => {
  const aggregator = chainAggregators[chain]
  return aggregator
    ? aggregator({ selectedPositionIds, thorchain, maya })
    : defaultAggregates
}
