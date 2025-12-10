import { Chain } from '@core/chain/Chain'
import { sum } from '@lib/utils/array/sum'

import { ThorchainDefiPositions } from '../queries/types'

type ChainAggregates = {
  totalFiat: number
  bondFiat: number
  stakeFiat: number
}

type DefiAggregatesInput = {
  chain: Chain
  selectedPositionIds: string[]
  thorchain?: ThorchainDefiPositions | undefined
}

const aggregateThorchain = ({
  selectedPositionIds,
  thorchain,
}: {
  selectedPositionIds: string[]
  thorchain?: ThorchainDefiPositions
}): ChainAggregates => {
  if (!thorchain) return { totalFiat: 0, bondFiat: 0, stakeFiat: 0 }

  const selected = new Set(selectedPositionIds)
  const bondFiat = sum(
    thorchain.bond.positions
      .filter(position => selected.has(position.id))
      .map(position => position.fiatValue)
  )
  const stakeFiat = sum(
    thorchain.stake.positions
      .filter(position => selected.has(position.id))
      .map(position => position.fiatValue)
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
  thorchain?: ThorchainDefiPositions
}) => ChainAggregates

const chainAggregators: Partial<Record<Chain, ChainAggregator>> = {
  [Chain.THORChain]: aggregateThorchain,
}

export const aggregateDefiPositions = ({
  chain,
  selectedPositionIds,
  thorchain,
}: DefiAggregatesInput): ChainAggregates => {
  const aggregator = chainAggregators[chain]
  return aggregator
    ? aggregator({ selectedPositionIds, thorchain })
    : defaultAggregates
}
