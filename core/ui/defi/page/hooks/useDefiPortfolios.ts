import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { cosmosStakedFiat } from '@core/ui/chain/cosmos/staking/cosmosStakedFiat'
import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useTonStakePositionQuery } from '@core/ui/chain/ton/staking/queries/useTonStakePositionQuery'
import { useIsCircleIncluded } from '@core/ui/storage/circleVisibility'
import { useTronAccountResourcesQuery } from '@core/ui/vault/chain/tron/useTronAccountResourcesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { sunToTrx } from '@vultisig/core-chain/chains/tron/resources'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { sum } from '@vultisig/lib-utils/array/sum'
import { useMemo } from 'react'

import { useDefiChains } from '../../../storage/defiChains'
import { useDefiPositions } from '../../../storage/defiPositions'
import { tronDefiCoins } from '../../chain/queries/tokens'
import { useMayaDefiPositionsQuery } from '../../chain/queries/useMayaDefiPositionsQuery'
import { useThorchainDefiPositionsQuery } from '../../chain/queries/useThorchainDefiPositionsQuery'
import { aggregateDefiPositions } from '../../chain/services/defiPositionAggregator'
import { useCircleAccountUsdcFiatBalanceQuery } from '../../protocols/circle/queries/useCircleAccountUsdcFiatBalanceQuery'

export type DefiChainPortfolio = {
  chain: Chain
  totalFiat: number
  positionsWithBalanceCount: number
  isLoading: boolean
}

export const useDefiChainPortfolios = () => {
  const enabledChains = useDefiChains()
  const thorchainSelectedPositions = useDefiPositions(Chain.THORChain)
  const mayaSelectedPositions = useDefiPositions(Chain.MayaChain)
  const tonSelectedPositions = useDefiPositions(Chain.Ton)
  const thorchainQuery = useThorchainDefiPositionsQuery()
  const mayaQuery = useMayaDefiPositionsQuery({
    enabled: enabledChains.includes(Chain.MayaChain),
  })
  const tronResourcesQuery = useTronAccountResourcesQuery()
  const tronPricesQuery = useCoinPricesQuery({ coins: tronDefiCoins })

  // Terra-family native staking. Per-chain fiat = sum(staked uluna) ÷
  // 10^decimals × LUNA/LUNC USD price. Prices are routed via the fee
  // coin's `priceProviderId` (e.g. `terra-luna-2`) — same feed the
  // `CosmosDelegationsView` chain page uses, so the rollup and the
  // chain-detail banner stay in sync.
  const terraAddress = useCurrentVaultAddress(Chain.Terra)
  const terraClassicAddress = useCurrentVaultAddress(Chain.TerraClassic)
  const terraDelegationsQuery = useCosmosDelegationsQuery({
    chain: Chain.Terra,
    delegatorAddress: terraAddress ?? '',
  })
  const terraClassicDelegationsQuery = useCosmosDelegationsQuery({
    chain: Chain.TerraClassic,
    delegatorAddress: terraClassicAddress ?? '',
  })
  const terraPricesQuery = useCoinPricesQuery({
    coins: [{ ...chainFeeCoin[Chain.Terra], chain: Chain.Terra }],
  })
  const terraClassicPricesQuery = useCoinPricesQuery({
    coins: [{ ...chainFeeCoin[Chain.TerraClassic], chain: Chain.TerraClassic }],
  })

  // QBTC native staking. Same shape as Terra, but QBTC has no spot-price feed
  // on the testnet, so the fiat rollup is 0 — the position count still surfaces
  // the staked balance in the DeFi tab.
  const qbtcAddress = useCurrentVaultAddress(Chain.QBTC)
  const qbtcDelegationsQuery = useCosmosDelegationsQuery({
    chain: Chain.QBTC,
    delegatorAddress: qbtcAddress ?? '',
  })
  const qbtcPricesQuery = useCoinPricesQuery({
    coins: [{ ...chainFeeCoin[Chain.QBTC], chain: Chain.QBTC }],
  })

  // TON nominator-pool staking. The aggregated position (active + pending
  // deposit) is read live from tonapi; its TON value × spot price rolls into
  // the DeFi total. Like Tron, it's surfaced whenever a stake exists — no
  // per-position opt-in.
  const tonAddress = useCurrentVaultAddress(Chain.Ton)
  const tonStakePositionQuery = useTonStakePositionQuery(tonAddress)
  const tonPricesQuery = useCoinPricesQuery({
    coins: [{ ...chainFeeCoin[Chain.Ton], chain: Chain.Ton }],
  })

  const data = useMemo<DefiChainPortfolio[]>(() => {
    const portfolios: DefiChainPortfolio[] = []

    if (enabledChains.includes(Chain.THORChain)) {
      const aggregates = aggregateDefiPositions({
        chain: Chain.THORChain,
        selectedPositionIds: thorchainSelectedPositions,
        thorchain: thorchainQuery.data,
      })

      portfolios.push({
        chain: Chain.THORChain,
        totalFiat: aggregates.totalFiat,
        positionsWithBalanceCount: aggregates.positionsWithBalanceCount,
        isLoading: thorchainQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.MayaChain)) {
      const aggregates = aggregateDefiPositions({
        chain: Chain.MayaChain,
        selectedPositionIds: mayaSelectedPositions,
        maya: mayaQuery.data,
      })

      portfolios.push({
        chain: Chain.MayaChain,
        totalFiat: aggregates.totalFiat,
        positionsWithBalanceCount: aggregates.positionsWithBalanceCount,
        isLoading: mayaQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.Tron)) {
      let totalFiat = 0
      let positionsWithBalanceCount = 0

      if (tronResourcesQuery.data && tronPricesQuery.data) {
        const pendingWithdrawalSun =
          tronResourcesQuery.data.unfreezingEntries.reduce(
            (acc, entry) => acc + entry.unfreezeAmountSun,
            0n
          )
        const totalLockedTrx = sunToTrx(
          tronResourcesQuery.data.frozenForBandwidthSun +
            tronResourcesQuery.data.frozenForEnergySun +
            pendingWithdrawalSun
        )
        const trxKey = coinKeyToString(tronDefiCoins[0])
        const trxPrice = tronPricesQuery.data[trxKey] ?? 0
        totalFiat = totalLockedTrx * trxPrice
        positionsWithBalanceCount = totalLockedTrx > 0 ? 1 : 0
      }

      portfolios.push({
        chain: Chain.Tron,
        totalFiat,
        positionsWithBalanceCount,
        isLoading: tronResourcesQuery.isPending || tronPricesQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.Terra)) {
      portfolios.push({
        chain: Chain.Terra,
        totalFiat: cosmosStakedFiat({
          delegations: terraDelegationsQuery.data,
          price:
            terraPricesQuery.data?.[coinKeyToString({ chain: Chain.Terra })],
          decimals: chainFeeCoin[Chain.Terra].decimals,
        }),
        positionsWithBalanceCount: terraDelegationsQuery.data?.length ?? 0,
        isLoading:
          terraDelegationsQuery.isPending || terraPricesQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.TerraClassic)) {
      portfolios.push({
        chain: Chain.TerraClassic,
        totalFiat: cosmosStakedFiat({
          delegations: terraClassicDelegationsQuery.data,
          price:
            terraClassicPricesQuery.data?.[
              coinKeyToString({ chain: Chain.TerraClassic })
            ],
          decimals: chainFeeCoin[Chain.TerraClassic].decimals,
        }),
        positionsWithBalanceCount:
          terraClassicDelegationsQuery.data?.length ?? 0,
        isLoading:
          terraClassicDelegationsQuery.isPending ||
          terraClassicPricesQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.QBTC)) {
      portfolios.push({
        chain: Chain.QBTC,
        totalFiat: cosmosStakedFiat({
          delegations: qbtcDelegationsQuery.data,
          price: qbtcPricesQuery.data?.[coinKeyToString({ chain: Chain.QBTC })],
          decimals: chainFeeCoin[Chain.QBTC].decimals,
        }),
        positionsWithBalanceCount: qbtcDelegationsQuery.data?.length ?? 0,
        isLoading: qbtcDelegationsQuery.isPending || qbtcPricesQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.Ton)) {
      // Respect the position opt-in: a disabled `ton-stake-ton` hides the
      // balance and count, matching the "No positions selected" empty state.
      const isSelected = tonSelectedPositions.length > 0
      const position = isSelected ? tonStakePositionQuery.data : undefined
      const price = tonPricesQuery.data?.[coinKeyToString({ chain: Chain.Ton })]
      const stakedUi = position
        ? Number(
            fromChainAmount(
              position.stakedAmount,
              chainFeeCoin[Chain.Ton].decimals
            )
          )
        : 0

      portfolios.push({
        chain: Chain.Ton,
        totalFiat: price !== undefined ? stakedUi * price : 0,
        positionsWithBalanceCount: position ? 1 : 0,
        isLoading:
          isSelected &&
          (tonStakePositionQuery.isPending || tonPricesQuery.isPending),
      })
    }

    return portfolios
  }, [
    enabledChains,
    thorchainQuery.data,
    mayaQuery.data,
    thorchainSelectedPositions,
    mayaSelectedPositions,
    thorchainQuery.isPending,
    mayaQuery.isPending,
    tronResourcesQuery.data,
    tronResourcesQuery.isPending,
    tronPricesQuery.data,
    tronPricesQuery.isPending,
    terraDelegationsQuery.data,
    terraDelegationsQuery.isPending,
    terraClassicDelegationsQuery.data,
    terraClassicDelegationsQuery.isPending,
    terraPricesQuery.data,
    terraPricesQuery.isPending,
    terraClassicPricesQuery.data,
    terraClassicPricesQuery.isPending,
    qbtcDelegationsQuery.data,
    qbtcDelegationsQuery.isPending,
    qbtcPricesQuery.data,
    qbtcPricesQuery.isPending,
    tonSelectedPositions,
    tonStakePositionQuery.data,
    tonStakePositionQuery.isPending,
    tonPricesQuery.data,
    tonPricesQuery.isPending,
  ])

  const isPending =
    (enabledChains.includes(Chain.THORChain) && thorchainQuery.isPending) ||
    (enabledChains.includes(Chain.MayaChain) && mayaQuery.isPending) ||
    (enabledChains.includes(Chain.Tron) &&
      (tronResourcesQuery.isPending || tronPricesQuery.isPending)) ||
    (enabledChains.includes(Chain.Terra) &&
      (terraDelegationsQuery.isPending || terraPricesQuery.isPending)) ||
    (enabledChains.includes(Chain.TerraClassic) &&
      (terraClassicDelegationsQuery.isPending ||
        terraClassicPricesQuery.isPending)) ||
    (enabledChains.includes(Chain.QBTC) &&
      (qbtcDelegationsQuery.isPending || qbtcPricesQuery.isPending)) ||
    (enabledChains.includes(Chain.Ton) &&
      tonSelectedPositions.length > 0 &&
      (tonStakePositionQuery.isPending || tonPricesQuery.isPending))

  const isTronEnabled = enabledChains.includes(Chain.Tron)

  const error =
    thorchainQuery.error ??
    mayaQuery.error ??
    (isTronEnabled
      ? (tronResourcesQuery.error ?? tronPricesQuery.errors[0])
      : null) ??
    null

  return {
    isPending,
    data,
    error,
  }
}

export const useDefiPortfolioBalance = () => {
  const portfolios = useDefiChainPortfolios()
  const isCircleIncluded = useIsCircleIncluded()
  const circleFiatBalanceQuery = useCircleAccountUsdcFiatBalanceQuery()

  const total = useMemo(() => {
    if (portfolios.isPending || circleFiatBalanceQuery.isPending) {
      return undefined
    }

    const chainTotal = sum(
      portfolios.data.map(portfolio => portfolio.totalFiat)
    )

    const circleTotal = isCircleIncluded
      ? (circleFiatBalanceQuery.data ?? 0)
      : 0

    return chainTotal + circleTotal
  }, [
    portfolios.data,
    portfolios.isPending,
    circleFiatBalanceQuery.data,
    circleFiatBalanceQuery.isPending,
    isCircleIncluded,
  ])

  return {
    ...portfolios,
    data: total,
    error: portfolios.error,
  }
}
