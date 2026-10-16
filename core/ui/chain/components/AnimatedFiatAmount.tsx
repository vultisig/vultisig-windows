import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useAnimatedNumber } from '@lib/ui/hooks/useAnimatedNumber'
import { useReducedMotion } from 'framer-motion'
import styled from 'styled-components'

type AnimatedFiatAmountProps = {
  value: number
  cacheKey: string
}

/**
 * Renders a fiat amount that animates with a count-up effect when `value`
 * changes — used for vault and DeFi totals. The `cacheKey` keeps each usage's
 * last shown value isolated so re-entering a screen with an unchanged total does
 * not replay the animation. Digits are rendered tabular (equal width) so the
 * currency symbol and surrounding layout don't jitter as digits change. With
 * reduced motion requested the amount changes at once.
 */
export const AnimatedFiatAmount = ({
  value,
  cacheKey,
}: AnimatedFiatAmountProps) => {
  const formatFiatAmount = useFormatFiatAmount()
  const animatedValue = useAnimatedNumber({ value, cacheKey })
  const shouldReduceMotion = useReducedMotion() === true

  return (
    <TabularNumbers>
      {formatFiatAmount(shouldReduceMotion ? value : animatedValue)}
    </TabularNumbers>
  )
}

const TabularNumbers = styled.span`
  font-variant-numeric: tabular-nums;
`
