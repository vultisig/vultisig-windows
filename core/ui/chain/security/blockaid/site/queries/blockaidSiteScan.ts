import { scanSiteWithBlockaid } from '@core/chain/security/blockaid/site'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'

export const getBlockaidSiteScanQuery = (url: string) => ({
  queryKey: ['blockaidSiteScan', url],
  queryFn: async () => scanSiteWithBlockaid(url),
  ...noRefetchQueryOptions,
})
