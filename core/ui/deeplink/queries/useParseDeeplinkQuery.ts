import { type ParsedDeeplink, parseDeeplink } from '@core/ui/deeplink/core'
import { Query } from '@lib/ui/query/Query'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

export const useParseDeeplinkQuery = (url: string): Query<ParsedDeeplink> => {
  return useQuery({
    queryKey: ['parse-deeplink', url],
    queryFn: () => parseDeeplink(url),
    ...noRefetchQueryOptions,
    retry: false,
  })
}
