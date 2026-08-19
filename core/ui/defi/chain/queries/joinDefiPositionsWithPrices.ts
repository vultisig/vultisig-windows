import {
  DefiChainPositions,
  PositionAprBasis,
  RawDefiChainPositions,
  RawThorchainBondPosition,
  RawThorchainStakePosition,
  ThorchainBondPosition,
  ThorchainStakePosition,
} from './types'
import { convertAPYtoAPR } from './utils/apy'

type JoinDefiPositionsWithPricesInput = {
  positions: RawDefiChainPositions
  prices: Record<string, number>
}

type GetAprFromBasisInput = {
  basis: PositionAprBasis
  fiatValue: number
  prices: Record<string, number>
}

const getAprFromBasis = ({
  basis,
  fiatValue,
  prices,
}: GetAprFromBasisInput) => {
  if (fiatValue <= 0) return 0

  const annualRewardValue =
    basis.annualRewardAmount * (prices[basis.rewardCoinKey] ?? 0)

  return convertAPYtoAPR((annualRewardValue / fiatValue) * 100)
}

/**
 * Joins price-free cached positions with live prices: fiat values (and TCY's
 * price-ratio APR) are computed at render, never stored. Prices missing from
 * the map value as 0, which self-corrects on the next render once the price
 * query resolves — unlike the previous snapshot approach, nothing sticks.
 */
export const joinDefiPositionsWithPrices = ({
  positions,
  prices,
}: JoinDefiPositionsWithPricesInput): DefiChainPositions => {
  const joinBond = ({
    fiatBasis,
    ...position
  }: RawThorchainBondPosition): ThorchainBondPosition => ({
    ...position,
    fiatValue: fiatBasis.amount * (prices[fiatBasis.coinKey] ?? 0),
  })

  const joinStake = ({
    fiatBasis,
    aprBasis,
    ...position
  }: RawThorchainStakePosition): ThorchainStakePosition => {
    const fiatValue = fiatBasis.amount * (prices[fiatBasis.coinKey] ?? 0)

    return {
      ...position,
      apr: aprBasis
        ? getAprFromBasis({ basis: aprBasis, fiatValue, prices })
        : position.apr,
      fiatValue,
    }
  }

  const { bond, stake } = positions

  return {
    ...(bond
      ? { bond: { ...bond, positions: bond.positions.map(joinBond) } }
      : {}),
    ...(stake ? { stake: { positions: stake.positions.map(joinStake) } } : {}),
  }
}
