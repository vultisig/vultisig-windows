import { queryBlockaid } from '@core/chain/security/blockaid/tx/validation/api/query'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'

type SiteScanResult = 'malicious' | null

type BlockaidSiteScanResponse = {
  is_malicious: boolean
}

export const getBlockaidSiteScanQuery = (url: string) => ({
  queryKey: ['blockaidSiteScan', url],
  queryFn: async (): Promise<SiteScanResult> => {
    const { is_malicious } = await queryBlockaid<BlockaidSiteScanResponse>(
      '/site/scan',
      {
        metadata: { type: 'catalog' },
        url,
      }
    )

    return is_malicious ? 'malicious' : null
  },
  ...noRefetchQueryOptions,
  ...noPersistQueryOptions,
})
