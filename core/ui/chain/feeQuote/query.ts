import { getFeeQuote } from '@core/chain/feeQuote'
import { FeeQuoteResolverInput } from '@core/chain/feeQuote/resolver'
import { useQuery } from '@tanstack/react-query'

export const feeQuoteQueryKeyPrefix = 'feeQuote'

export const useFeeQuoteQuery = (input: FeeQuoteResolverInput) => {
  return useQuery({
    queryKey: [feeQuoteQueryKeyPrefix, input],
    queryFn: () => getFeeQuote(input),
  })
}
