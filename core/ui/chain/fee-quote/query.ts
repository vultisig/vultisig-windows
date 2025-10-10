import { getFeeQuote } from '@core/chain/fee-quote'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import { useQuery } from '@tanstack/react-query'

const feeQuoteQueryKeyPrefix = 'feeQuote'

export const useFeeQuoteQuery = (input: ChainSpecificResolverInput) => {
  return useQuery({
    queryKey: [feeQuoteQueryKeyPrefix, input],
    queryFn: () => getFeeQuote(input),
  })
}
