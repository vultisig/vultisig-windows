import { Chain } from '@core/chain/Chain'
import { sum } from '@lib/utils/array/sum'

import { DefiChainPositions } from '../queries/types'

type ChainAggregates = {
  totalFiat: number
  bondFiat: number
  stakeFiat: number
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
  if (!data) return { totalFiat: 0, bondFiat: 0, stakeFiat: 0 }

  const selected = new Set(selectedPositionIds)
  const bondFiat = sum(
    data.bond?.positions
      .filter(position => selected.has(position.id))
      .map(position => position.fiatValue) ?? []
  )
  const stakeFiat = sum(
    data.stake?.positions
      .filter(position => selected.has(position.id))
      .map(position => position.fiatValue) ?? []
  )

  const totalFiat = bondFiat + stakeFiat
  return { totalFiat, bondFiat, stakeFiat }
}

const defaultAggregates: ChainAggregates = {
  totalFiat: 0,
  bondFiat: 0,
  stakeFiat: 0,
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
