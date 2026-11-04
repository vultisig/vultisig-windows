import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'

import { DefiPosition, useDefiPositions } from '../../../storage/defiPositions'
import { useCurrentVaultAddress } from '../../../vault/state/currentVaultCoins'
import {
  fetchMayachainLpPositions,
  getMayaLpRedeemAmounts,
} from './services/mayachainLpService'
import { ThorchainLpPositionData } from './services/thorchainLpService'

type MayaLpPositionWithData = {
  position: DefiPosition
  runeAmount: number
  assetAmount: number
  poolUnits: string
}

type UseMayaLpPositionsQueryInput = {
  selectedPositions: DefiPosition[]
}

/**
 * Redeemable CACAO and asset amounts for the vault's selected MayaChain LP
 * positions. A selected pool with no mayanode record reads as zero.
 */
export const useMayaLpPositionsQuery = ({
  selectedPositions,
}: UseMayaLpPositionsQueryInput) => {
  const address = useCurrentVaultAddress(Chain.MayaChain)
  const selectedIds = useDefiPositions(Chain.MayaChain)

  const lpPositions = selectedPositions.filter(p => p.type === 'lp')
  const poolAssets = lpPositions
    .map(p => p.poolAsset)
    .filter((a): a is string => Boolean(a))

  return useQuery({
    queryKey: ['mayachain', 'lp', 'positions', address, ...poolAssets],
    enabled: Boolean(address) && poolAssets.length > 0,
    queryFn: async (): Promise<MayaLpPositionWithData[]> => {
      const apiPositions = await fetchMayachainLpPositions({
        poolAssets,
        address,
      })

      return lpPositions
        .map(position => {
          const apiData = apiPositions.find(
            (a: ThorchainLpPositionData) => a.poolAsset === position.poolAsset
          )

          const { runeAmount, assetAmount } = apiData
            ? getMayaLpRedeemAmounts(apiData)
            : { runeAmount: 0, assetAmount: 0 }

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
