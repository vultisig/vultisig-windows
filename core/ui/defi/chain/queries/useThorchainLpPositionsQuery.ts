import { Chain } from '@core/chain/Chain'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { DefiPosition, useDefiPositions } from '../../../storage/defiPositions'
import { useCurrentVaultAddress } from '../../../vault/state/currentVaultCoins'
import {
  fetchThorchainLpPositions,
  ThorchainLpPositionData,
} from './services/thorchainLpService'
import { runeCoin } from './tokens'

export type LpPositionWithData = {
  position: DefiPosition
  runeAmount: number
  assetAmount: number
  poolUnits: string
}

type UseThorchainLpPositionsQueryInput = {
  selectedPositions: DefiPosition[]
}

export const useThorchainLpPositionsQuery = ({
  selectedPositions,
}: UseThorchainLpPositionsQueryInput) => {
  const address = useCurrentVaultAddress(Chain.THORChain)
  const selectedIds = useDefiPositions(Chain.THORChain)

  const lpPositions = selectedPositions.filter(p => p.type === 'lp')
  const poolAssets = lpPositions
    .map(p => p.poolAsset)
    .filter((a): a is string => Boolean(a))

  return useQuery({
    queryKey: ['thorchain', 'lp', 'positions', address, ...poolAssets],
    enabled: Boolean(address) && poolAssets.length > 0,
    queryFn: async (): Promise<LpPositionWithData[]> => {
      const apiPositions = await fetchThorchainLpPositions(poolAssets, address)

      return lpPositions
        .map(position => {
          const apiData = apiPositions.find(
            (a: ThorchainLpPositionData) => a.poolAsset === position.poolAsset
          )

          const runeAmount = apiData
            ? Number(apiData.runeRedeemValue) / Math.pow(10, runeCoin.decimals)
            : 0

          const assetAmount = apiData
            ? Number(apiData.assetRedeemValue) / Math.pow(10, runeCoin.decimals)
            : 0

          return {
            position,
            runeAmount,
            assetAmount,
            poolUnits: apiData?.units ?? '0',
          }
        })
        .filter(p => selectedIds.includes(p.position.id))
    },
    ...noRefetchQueryOptions,
    staleTime: 60_000,
  })
}
