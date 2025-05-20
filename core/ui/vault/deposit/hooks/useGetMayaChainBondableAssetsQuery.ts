import { useQuery } from '@tanstack/react-query'

import { fetchMayaChainAssets } from '../services/fetchMayaChainBondableAssets'

export const useGetMayaChainBondableAssetsQuery = () =>
  useQuery({
    queryKey: ['mayachainBondableAssets'],
    queryFn: async () => {
      try {
        const assets = await fetchMayaChainAssets()
        return assets
          .filter(asset => asset.bondable)
          .map(asset => ({
            ...asset,
            asset: asset.asset.split('-')[0], // Normalize 'asset' by removing '-DATA' or similar suffix
          }))
      } catch (error) {
        console.error(error)
        return []
      }
    },
    staleTime: Infinity,
  })
