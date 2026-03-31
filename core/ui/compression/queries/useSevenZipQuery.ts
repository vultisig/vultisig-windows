import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { getSevenZip } from '@vultisig/core-mpc/compression/getSevenZip'

export const useSevenZipQuery = () => {
  return useQuery({
    queryKey: ['seven-zip'],
    queryFn: getSevenZip,
    ...noRefetchQueryOptions,
  })
}
