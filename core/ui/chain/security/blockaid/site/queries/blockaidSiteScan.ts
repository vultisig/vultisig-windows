import { scanSiteWithBlockaid } from '@core/chain/security/blockaid/site'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'

export const getBlockaidSiteScanQuery = (url: string) => ({
  queryKey: ['blockaidSiteScan', url],
  queryFn: async () => scanSiteWithBlockaid(url),
  ...noRefetchQueryOptions,
  ...noPersistQueryOptions,
})
