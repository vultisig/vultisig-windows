import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { BlockaidSolanaSwapSimulationInfo } from '../core'

export type BlockaidSimulation = {
  account_summary: {
    account_assets_diff: Array<{
      asset: {
        type: 'TOKEN' | 'SOL'
        name?: string
        symbol?: string
        address?: string
        decimals: number
        logo: string
      }
      in: {
        usd_price: number
        summary: string
        value: number
        raw_value: number
      } | null
      out: {
        usd_price: number
        summary: string
        value: number
        raw_value: number
      } | null
      asset_type: 'TOKEN' | 'SOL'
    }>
  }
}

export const parseBlockaidSimulation = async (
  simulation: BlockaidSimulation
): Promise<BlockaidSolanaSwapSimulationInfo> => {
  const assetDiffs = simulation.account_summary.account_assets_diff
  if (assetDiffs.length > 1) {
    const [potentialOutAsset, potentialInAsset] = assetDiffs
    const { inAsset, inValue } = potentialInAsset.in
      ? {
          inAsset: potentialInAsset.asset,
          inValue: potentialInAsset.in,
        }
      : {
          inAsset: potentialOutAsset.asset,
          inValue: potentialOutAsset.in,
        }

    const { outAsset, outValue } = potentialOutAsset.out
      ? {
          outAsset: potentialOutAsset.asset,
          outValue: potentialOutAsset.out,
        }
      : {
          outAsset: potentialInAsset.asset,
          outValue: potentialInAsset.out,
        }

    return {
      fromMint:
        outAsset.type === 'SOL'
          ? 'So11111111111111111111111111111111111111112'
          : shouldBePresent(outAsset.address),
      toMint:
        inAsset.type === 'SOL'
          ? 'So11111111111111111111111111111111111111112'
          : shouldBePresent(inAsset.address),
      fromAmount: shouldBePresent(outValue).raw_value,
      toAmount: shouldBePresent(inValue).raw_value,
      toAssetDecimal: inAsset.decimals,
    }
  }
  throw new Error('Invalid simulation data')
}
