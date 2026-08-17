import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useIsCircleVisible } from '@core/ui/storage/circleVisibility'
import {
  SupportedDefiChain,
  supportedDefiChains,
} from '@core/ui/storage/defiChains'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useRefetchQueriesByCategory } from '@lib/ui/query/hooks/useRefetchQueriesByCategory'
import { QueryKey, useMutation } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { usdc } from '@vultisig/core-chain/coin/knownTokens'

import {
  getCircleAccountQueryKey,
  useCircleAccountQuery,
} from './protocols/circle/queries/circleAccount'

type DefiRefreshConfig = {
  getPositionsQueryKey: (address: string) => QueryKey
  poolQueryKeys: QueryKey[]
}

const defiRefreshConfig: Record<SupportedDefiChain, DefiRefreshConfig> = {
  [Chain.THORChain]: {
    getPositionsQueryKey: address => [
      'defi',
      'thorchain',
      'positions',
      address,
    ],
    poolQueryKeys: [['defi', Chain.THORChain, 'lp', 'pools']],
  },
  [Chain.MayaChain]: {
    getPositionsQueryKey: address => [
      'defi',
      'mayachain',
      'positions',
      address,
    ],
    poolQueryKeys: [['defi', Chain.MayaChain, 'lp', 'pools']],
  },
  [Chain.Tron]: {
    getPositionsQueryKey: address => ['tronAccountResources', address],
    poolQueryKeys: [],
  },
  [Chain.Terra]: {
    getPositionsQueryKey: address => [
      'cosmosDelegations',
      Chain.Terra,
      address,
    ],
    poolQueryKeys: [],
  },
  [Chain.TerraClassic]: {
    getPositionsQueryKey: address => [
      'cosmosDelegations',
      Chain.TerraClassic,
      address,
    ],
    poolQueryKeys: [],
  },
  [Chain.QBTC]: {
    getPositionsQueryKey: address => ['cosmosDelegations', Chain.QBTC, address],
    poolQueryKeys: [],
  },
  [Chain.Ton]: {
    getPositionsQueryKey: address => ['tonStakePosition', address],
    poolQueryKeys: [['tonStakingPools']],
  },
  [Chain.Solana]: {
    getPositionsQueryKey: address => ['solanaStakeAccounts', address],
    poolQueryKeys: [['solanaValidators']],
  },
}

/**
 * Refresh button for the DeFi tab: refetches every enabled chain's positions
 * and pool data and invalidates all price queries by category.
 */
export const RefreshDefiData = () => {
  const refetchQueries = useRefetchQueries()
  const refetchQueriesByCategory = useRefetchQueriesByCategory()
  const thorchainAddress = useCurrentVaultAddress(Chain.THORChain)
  const mayachainAddress = useCurrentVaultAddress(Chain.MayaChain)
  const tronAddress = useCurrentVaultAddress(Chain.Tron)
  const terraAddress = useCurrentVaultAddress(Chain.Terra)
  const terraClassicAddress = useCurrentVaultAddress(Chain.TerraClassic)
  const qbtcAddress = useCurrentVaultAddress(Chain.QBTC)
  const tonAddress = useCurrentVaultAddress(Chain.Ton)
  const solanaAddress = useCurrentVaultAddress(Chain.Solana)
  const ethereumAddress = useCurrentVaultAddress(Chain.Ethereum)
  const circleAccountQuery = useCircleAccountQuery()
  const isCircleVisible = useIsCircleVisible()

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: async () => {
      const addresses: Record<SupportedDefiChain, string> = {
        [Chain.THORChain]: thorchainAddress,
        [Chain.MayaChain]: mayachainAddress,
        [Chain.Tron]: tronAddress,
        [Chain.Terra]: terraAddress,
        [Chain.TerraClassic]: terraClassicAddress,
        [Chain.QBTC]: qbtcAddress,
        [Chain.Ton]: tonAddress,
        [Chain.Solana]: solanaAddress,
      }

      const queryKeys = supportedDefiChains.flatMap(chain => {
        const { getPositionsQueryKey, poolQueryKeys } = defiRefreshConfig[chain]

        return [getPositionsQueryKey(addresses[chain]), ...poolQueryKeys]
      }) as QueryKey[]

      if (isCircleVisible) {
        queryKeys.push(
          getCircleAccountQueryKey({ ownerAddress: ethereumAddress })
        )

        const circleAccountAddress = circleAccountQuery.data?.address

        if (circleAccountAddress) {
          queryKeys.push(
            getBalanceQueryKey(
              extractAccountCoinKey({ ...usdc, address: circleAccountAddress })
            )
          )
        }
      }

      // Every price source (CoinGecko, pools, NAV, ...) is tagged with the
      // `price` category, so one invalidation covers all DeFi price coins.
      await Promise.all([
        refetchQueriesByCategory('price'),
        refetchQueries(...queryKeys),
      ])
    },
  })

  return (
    <IconButton loading={isPending} onClick={() => refresh()}>
      <IconWrapper size={24}>
        <RefreshCwIcon />
      </IconWrapper>
    </IconButton>
  )
}
