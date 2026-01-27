import { EvmChain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import {
  BlockaidEvmSimulationInfo,
  BlockaidSolanaSimulationInfo,
} from '../core'

export type BlockaidSolanaSimulation = {
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
        raw_value: string
      } | null
      out: {
        usd_price: number
        summary: string
        value: number
        raw_value: string
      } | null
      asset_type: 'TOKEN' | 'SOL'
    }>
  }
}

export type BlockaidEVMSimulation = {
  account_summary: {
    assets_diffs: Array<{
      asset_type: 'NATIVE' | 'ERC20'
      asset: {
        type: 'NATIVE' | 'ERC20'
        chain_name: string
        decimals: number
        chain_id: number
        address?: string
        logo_url: string
        name: string
        symbol: string
      }
      in: Array<{
        usd_price: number
        summary: string
        value: number
        raw_value: string
      }>
      out: Array<{
        usd_price: number
        summary: string
        value: number
        raw_value: string
      }>
      balance_changes: {
        before: {
          usd_price: number
          value: number
          raw_value: string
        }
        after: {
          usd_price: number
          value: number
          raw_value: string
        }
      }
    }>
  }
}

export const parseBlockaidSolanaSimulation = async (
  simulation: BlockaidSolanaSimulation
): Promise<BlockaidSolanaSimulationInfo> => {
  const assetDiffs = simulation.account_summary.account_assets_diff

  // When we have 3 items and one is native SOL, filter it out and use the other two tokens.
  // The native SOL is likely the transaction fee, not part of the swap itself.
  let relevantDiffs = assetDiffs
  if (assetDiffs.length === 3) {
    const nativeSolIndex = assetDiffs.findIndex(
      diff => diff.asset.type === 'SOL' || diff.asset_type === 'SOL'
    )
    if (nativeSolIndex !== -1) {
      relevantDiffs = assetDiffs.filter((_, index) => index !== nativeSolIndex)
    }
  }

  if (relevantDiffs.length === 1) {
    const [potentialOutAsset] = relevantDiffs

    if (!potentialOutAsset.out) {
      throw new Error('Invalid simulation data: no out value for transfer')
    }

    return {
      transfer: {
        fromMint:
          potentialOutAsset.asset.type === 'SOL'
            ? 'So11111111111111111111111111111111111111112'
            : shouldBePresent(potentialOutAsset.asset.address),
        fromAmount: BigInt(shouldBePresent(potentialOutAsset.out).raw_value),
      },
    }
  }

  if (relevantDiffs.length > 1) {
    const [potentialOutAsset, potentialInAsset] = relevantDiffs
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
    if (outAsset && inAsset && outValue && inValue) {
      return {
        swap: {
          fromMint:
            outAsset.type === 'SOL'
              ? 'So11111111111111111111111111111111111111112'
              : shouldBePresent(outAsset.address),
          toMint:
            inAsset.type === 'SOL'
              ? 'So11111111111111111111111111111111111111112'
              : shouldBePresent(inAsset.address),
          fromAmount: BigInt(shouldBePresent(outValue).raw_value),
          toAmount: BigInt(shouldBePresent(inValue).raw_value),
          toAssetDecimal: inAsset.decimals,
        },
      }
    } else if (outAsset && outValue) {
      return {
        transfer: {
          fromMint:
            outAsset.type === 'SOL'
              ? 'So11111111111111111111111111111111111111112'
              : shouldBePresent(outAsset.address),
          fromAmount: BigInt(shouldBePresent(outValue).raw_value),
        },
      }
    }
  }
  throw new Error('Invalid simulation data')
}

export const parseBlockaidEvmSimulation = async (
  simulation: BlockaidEVMSimulation,
  chain: EvmChain
): Promise<BlockaidEvmSimulationInfo> => {
  if (!isChainOfKind(chain, 'evm')) {
    throw new Error(
      `parseBlockaidEvmSimulation only supports EVM chains, got: ${chain}`
    )
  }

  const assetDiffs = simulation.account_summary.assets_diffs

  if (assetDiffs.length === 1) {
    const [potentialOutAsset] = assetDiffs

    if (potentialOutAsset.out.length === 0) {
      return null
    }

    return {
      transfer: {
        fromCoin: {
          decimals: potentialOutAsset.asset.decimals,
          logo: potentialOutAsset.asset.logo_url,
          ticker: potentialOutAsset.asset.symbol,
          id: potentialOutAsset.asset.address,
          chain: chain,
        },
        fromAmount: shouldBePresent(BigInt(potentialOutAsset.out[0].raw_value)),
      },
    }
  } else if (assetDiffs.length > 1) {
    const [potentialOutAsset, potentialInAsset] = assetDiffs
    const { inAsset, inValue } =
      potentialInAsset.in.length > 0
        ? {
            inAsset: potentialInAsset.asset,
            inValue: potentialInAsset.in,
          }
        : {
            inAsset: potentialOutAsset.asset,
            inValue: potentialOutAsset.in,
          }

    const { outAsset, outValue } =
      potentialOutAsset.out.length > 0
        ? {
            outAsset: potentialOutAsset.asset,
            outValue: potentialOutAsset.out,
          }
        : {
            outAsset: potentialInAsset.asset,
            outValue: potentialInAsset.out,
          }

    if (outValue.length === 0 || inValue.length === 0) {
      return null
    }

    return {
      swap: {
        fromCoin: {
          decimals: outAsset.decimals,
          logo: outAsset.logo_url,
          ticker: outAsset.symbol,
          id: outAsset.address,
          chain: chain,
        },
        toCoin: {
          chain: chain,
          decimals: inAsset.decimals,
          logo: inAsset.logo_url,
          ticker: inAsset.symbol,
          id: inAsset.address,
        },
        fromAmount: shouldBePresent(BigInt(outValue[0].raw_value)),
        toAmount: shouldBePresent(BigInt(inValue[0].raw_value)),
      },
    }
  }
  return null
}
