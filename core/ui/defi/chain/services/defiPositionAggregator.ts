import { Chain } from '@core/chain/Chain'
import { sum } from '@lib/utils/array/sum'

import { ThorchainDefiPositions } from '../queries/types'

export type ChainAggregates = {
  totalFiat: number
  bondFiat: number
  stakeFiat: number
}

export type DefiAggregatesInput = {
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

export const aggregateDefiPositions = ({
  chain,
  selectedPositionIds,
  thorchain,
}: DefiAggregatesInput): ChainAggregates => {
  switch (chain) {
    case Chain.THORChain:
      return aggregateThorchain({ selectedPositionIds, thorchain })
    default:
      return { totalFiat: 0, bondFiat: 0, stakeFiat: 0 }
  }
}
