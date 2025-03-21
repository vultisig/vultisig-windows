import { useEffect, useState } from 'react'

import { useRefreshSwapQuoteMutation } from '../../mutations/useRefreshSwapQuoteMutation'
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'

export const useRefreshSwapQuoteInterval = (countdownTime: number) => {
  const [timeLeft, setTimeLeft] = useState(0)

  const { data: swapQuoteData, isPending: isSwapQuotePending } =
    useSwapQuoteQuery()
  const { mutate: refreshQuote } = useRefreshSwapQuoteMutation()

  useEffect(() => {
    if ((swapQuoteData || isSwapQuotePending) && !timeLeft) {
      setTimeLeft(countdownTime)
    }
  }, [countdownTime, isSwapQuotePending, swapQuoteData, timeLeft])

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
