import { getFeeQuote } from '@core/chain/fee-quote'
import { FeeQuoteResolverInput } from '@core/chain/fee-quote/resolver'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { without } from '@lib/utils/array/without'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useSendAmount } from '../../vault/send/state/amount'
import { useSendMemo } from '../../vault/send/state/memo'
import { useSendReceiver } from '../../vault/send/state/receiver'
import { useCurrentSendCoin } from '../../vault/send/state/sendCoin'

const feeQuoteQueryKeyPrefix = 'feeQuote'

const getFeeQuoteQueryKey = (input: FeeQuoteResolverInput) =>
  without([feeQuoteQueryKeyPrefix, ...Object.values(input)], undefined)

export const useFeeQuoteQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [amount] = useSendAmount()
  const [memo] = useSendMemo()

  const input: FeeQuoteResolverInput = useMemo(
    () => ({
      coin,
      receiver,
      amount: amount ?? 0n,
      data: memo,
    }),
    [amount, coin, memo, receiver]
  )

  return useQuery({
    queryKey: getFeeQuoteQueryKey(input),
    queryFn: () => getFeeQuote(input),
    ...noRefetchQueryOptions,
  })
}
