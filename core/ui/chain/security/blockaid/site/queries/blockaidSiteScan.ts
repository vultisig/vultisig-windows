import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { scanSiteWithBlockaid } from '@vultisig/core-chain/security/blockaid/site'

export const getBlockaidSiteScanQuery = (url: string) => ({
  queryKey: ['blockaidSiteScan', url],
  queryFn: async () => scanSiteWithBlockaid(url),
  ...noRefetchQueryOptions,
})
