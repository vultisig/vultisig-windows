import { Seconds } from '@lib/utils/time'
import { useEffect, useState } from 'react'

import { useRefreshSwapQuoteMutation } from '../../mutations/useRefreshSwapQuoteMutation'
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'

export const useRefreshSwapQuoteInterval = (countdownTime: Seconds) => {
  const [timeLeft, setTimeLeft] = useState(0)

  const { data: swapQuoteData, isPending: isSwapQuotePending } =
    useSwapQuoteQuery()
  const { mutate: refreshQuote } = useRefreshSwapQuoteMutation()

  // Reset timer when a new quote is received or when quote starts loading
  useEffect(() => {
    if (swapQuoteData || isSwapQuotePending) {
      setTimeLeft(countdownTime)
    }
  }, [countdownTime, isSwapQuotePending, swapQuoteData])

  useEffect(() => {
    if (timeLeft === 0) {
      refreshQuote()
      setTimeLeft(countdownTime)
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, refreshQuote, countdownTime])

  return timeLeft
}
