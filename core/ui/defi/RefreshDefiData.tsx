import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { usdc } from '@core/chain/coin/knownTokens'
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
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { QueryKey, useMutation } from '@tanstack/react-query'

import { mayaDefiCoins, thorchainDefiCoins } from './chain/queries/tokens'
import {
  getCircleAccountQueryKey,
  useCircleAccountQuery,
} from './protocols/circle/queries/circleAccount'

type DefiRefreshConfig = {
  priceCoins: typeof thorchainDefiCoins | typeof mayaDefiCoins
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
}

export const RefreshDefiData = () => {
  const invalidateQueries = useInvalidateQueries()
  const fiatCurrency = useFiatCurrency()
  const thorchainAddress = useCurrentVaultAddress(Chain.THORChain)
  const mayachainAddress = useCurrentVaultAddress(Chain.MayaChain)
  const ethereumAddress = useCurrentVaultAddress(Chain.Ethereum)
  const circleAccountQuery = useCircleAccountQuery()
  const isCircleVisible = useIsCircleVisible()

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: async () => {
      const addresses: Record<SupportedDefiChain, string> = {
        [Chain.THORChain]: thorchainAddress,
        [Chain.MayaChain]: mayachainAddress,
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

      await invalidateQueries(...queryKeys)
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
