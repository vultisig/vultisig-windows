import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useMemo } from 'react'

import {
  useThorBondedNodesQuery,
  useThorLpPositionsQuery,
  useThorMergedAssetsQuery,
  useThorTcyStakeQuery,
} from './hooks'

type ThorchainDefiBalance = {
  totalUsd: number
  bondedRune: bigint
  bondedRuneUsd: number
  stakedTcy: bigint
  stakedTcyUsd: number
  lpValueUsd: number
  isPending: boolean
  isError: boolean
}

const runeDecimals = 8

export const useThorchainDefiBalance = (): ThorchainDefiBalance => {
  const {
    data: bondedNodes,
    isPending: isBondsPending,
    isError: isBondsError,
  } = useThorBondedNodesQuery()
  const {
    data: tcyStake,
    isPending: isTcyPending,
    isError: isTcyError,
  } = useThorTcyStakeQuery()
  const {
    data: lpPositions,
    isPending: isLpPending,
    isError: isLpError,
  } = useThorLpPositionsQuery()
  const {
    data: mergedAssets,
    isPending: isMergedPending,
    isError: isMergedError,
  } = useThorMergedAssetsQuery()

  const runeCoin = chainFeeCoin.THORChain

  const pricesQuery = useCoinPricesQuery({
    coins: [
      {
        chain: Chain.THORChain,
        id: runeCoin.id,
        priceProviderId: runeCoin.priceProviderId,
      },
    ],
  })

  const runePrice = useMemo(() => {
    if (!pricesQuery.data) return 0
    // The key format is "chain:id" or just "chain:" for native coins
    const key = `${Chain.THORChain}:`
    return pricesQuery.data[key] ?? 0
  }, [pricesQuery.data])

  return useMemo(() => {
    const isPending =
      isBondsPending ||
      isTcyPending ||
      isLpPending ||
      isMergedPending ||
      pricesQuery.isPending

    const isError = isBondsError || isTcyError || isLpError || isMergedError

    // Calculate total bonded RUNE
    const bondedRune = (bondedNodes ?? []).reduce(
      (sum, node) => sum + BigInt(node.bond ?? '0'),
      0n
    )
    const bondedRuneUsd = fromChainAmount(bondedRune, runeDecimals) * runePrice

    // Calculate staked TCY (assuming TCY has the same price as RUNE for simplicity)
    // In reality, TCY might have its own price
    const stakedTcy = tcyStake ?? 0n
    const stakedTcyUsd = fromChainAmount(stakedTcy, runeDecimals) * runePrice

    // Calculate LP positions value (rune value * 2 since it's symmetric)
    // The rune_deposit_value represents the RUNE value in the LP
    const lpRuneValue = (lpPositions ?? []).reduce(
      (sum, position) => sum + BigInt(position.rune_deposit_value ?? '0'),
      0n
    )
    // LP value is approximately 2x the RUNE value (RUNE + asset side)
    const lpValueUsd =
      fromChainAmount(lpRuneValue, runeDecimals) * runePrice * 2

    // Calculate merged assets value (RUJI, etc.)
    const mergedAssetsUsd = (mergedAssets ?? []).reduce((sum, asset) => {
      const assetAmount = BigInt(asset.sizeAmountChain ?? '0')
      // Assuming these are priced in RUNE for simplicity
      return sum + fromChainAmount(assetAmount, runeDecimals) * runePrice
    }, 0)

    const totalUsd = bondedRuneUsd + stakedTcyUsd + lpValueUsd + mergedAssetsUsd

    return {
      totalUsd,
      bondedRune,
      bondedRuneUsd,
      stakedTcy,
      stakedTcyUsd,
      lpValueUsd,
      isPending,
      isError,
    }
  }, [
    bondedNodes,
    tcyStake,
    lpPositions,
    mergedAssets,
    runePrice,
    isBondsPending,
    isTcyPending,
    isLpPending,
    isMergedPending,
    pricesQuery.isPending,
    isBondsError,
    isTcyError,
    isLpError,
    isMergedError,
  ])
}
