import { getCoinPricesQueryKeys } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useIsCircleVisible } from '@core/ui/storage/circleVisibility'
import {
  SupportedDefiChain,
  supportedDefiChains,
} from '@core/ui/storage/defiChains'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { QueryKey, useMutation } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { usdc } from '@vultisig/core-chain/coin/knownTokens'

import {
  mayaDefiCoins,
  thorchainDefiCoins,
  tronDefiCoins,
} from './chain/queries/tokens'
import {
  getCircleAccountQueryKey,
  useCircleAccountQuery,
} from './protocols/circle/queries/circleAccount'

type DefiRefreshConfig = {
  priceCoins: Coin[]
  getPositionsQueryKey: (address: string) => QueryKey
  poolQueryKeys: QueryKey[]
}

const defiRefreshConfig: Record<SupportedDefiChain, DefiRefreshConfig> = {
  [Chain.THORChain]: {
    priceCoins: thorchainDefiCoins,
    getPositionsQueryKey: address => [
      'defi',
      'thorchain',
      'positions',
      address,
    ],
    poolQueryKeys: [['defi', Chain.THORChain, 'lp', 'pools']],
  },
  [Chain.MayaChain]: {
    priceCoins: mayaDefiCoins,
    getPositionsQueryKey: address => [
      'defi',
      'mayachain',
      'positions',
      address,
    ],
    poolQueryKeys: [['defi', Chain.MayaChain, 'lp', 'pools']],
  },
  [Chain.Tron]: {
    priceCoins: tronDefiCoins,
    getPositionsQueryKey: address => ['tronAccountResources', address],
    poolQueryKeys: [],
  },
  [Chain.Terra]: {
    priceCoins: [],
    getPositionsQueryKey: address => [
      'cosmosDelegations',
      Chain.Terra,
      address,
    ],
    poolQueryKeys: [],
  },
  [Chain.TerraClassic]: {
    priceCoins: [],
    getPositionsQueryKey: address => [
      'cosmosDelegations',
      Chain.TerraClassic,
      address,
    ],
    poolQueryKeys: [],
  },
  [Chain.QBTC]: {
    priceCoins: [],
    getPositionsQueryKey: address => ['cosmosDelegations', Chain.QBTC, address],
    poolQueryKeys: [],
  },
  [Chain.Ton]: {
    priceCoins: [{ ...chainFeeCoin[Chain.Ton], chain: Chain.Ton }],
    getPositionsQueryKey: address => ['tonStakePosition', address],
    poolQueryKeys: [['tonStakingPools']],
  },
}

export const RefreshDefiData = () => {
  const refetchQueries = useRefetchQueries()
  const fiatCurrency = useFiatCurrency()
  const thorchainAddress = useCurrentVaultAddress(Chain.THORChain)
  const mayachainAddress = useCurrentVaultAddress(Chain.MayaChain)
  const tronAddress = useCurrentVaultAddress(Chain.Tron)
  const terraAddress = useCurrentVaultAddress(Chain.Terra)
  const terraClassicAddress = useCurrentVaultAddress(Chain.TerraClassic)
  const qbtcAddress = useCurrentVaultAddress(Chain.QBTC)
  const tonAddress = useCurrentVaultAddress(Chain.Ton)
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
      }

      const queryKeys = supportedDefiChains.flatMap(chain => {
        const { priceCoins, getPositionsQueryKey, poolQueryKeys } =
          defiRefreshConfig[chain]

        return [
          getCoinPricesQueryKeys({
            coins: priceCoins,
            fiatCurrency,
          }),
          getPositionsQueryKey(addresses[chain]),
          ...poolQueryKeys,
        ]
      }) as QueryKey[]

      if (isCircleVisible) {
        queryKeys.push(
          getCoinPricesQueryKeys({ coins: [usdc], fiatCurrency }),
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

      await refetchQueries(...queryKeys)
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
