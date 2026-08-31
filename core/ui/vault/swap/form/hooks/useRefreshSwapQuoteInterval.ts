import { Seconds } from '@vultisig/lib-utils/time'
import { useEffect, useState } from 'react'

import { useRefreshSwapQuoteMutation } from '../../mutations/useRefreshSwapQuoteMutation'
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'

type GetDisplayedSwapQuoteCountdownInput = {
  timeLeft: Seconds
  expiresAt: number | undefined
  now?: number
}

/**
 * The countdown to show for the quote currently on screen: whichever runs out
 * first, the refresh interval or the quote's own validity. A quote served from
 * cache after a failed refetch would otherwise carry a full interval and read
 * as freshly fetched; clamping to its remaining validity shows `0` instead.
 */
export const getDisplayedSwapQuoteCountdown = ({
  timeLeft,
  expiresAt,
  now = Date.now(),
}: GetDisplayedSwapQuoteCountdownInput): Seconds => {
  if (expiresAt === undefined) {
    return timeLeft
  }

  const secondsUntilExpiry = Math.max(Math.floor((expiresAt - now) / 1000), 0)

  return Math.min(timeLeft, secondsUntilExpiry)
}

export const useRefreshSwapQuoteInterval = (countdownTime: Seconds) => {
  const [timeLeft, setTimeLeft] = useState(0)

  const { data: swapQuoteData } = useSwapQuoteQuery()
  const { mutate: refreshQuote } = useRefreshSwapQuoteMutation()

  // Reset timer when a new quote is received
  useEffect(() => {
    if (swapQuoteData) {
      setTimeLeft(countdownTime)
    }
  }, [countdownTime, swapQuoteData])

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

  return getDisplayedSwapQuoteCountdown({
    timeLeft,
    expiresAt: swapQuoteData?.expiresAt,
  })
}
