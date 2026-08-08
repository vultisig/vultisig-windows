import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useAnimatedNumber } from '@lib/ui/hooks/useAnimatedNumber'
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
 * currency symbol and surrounding layout don't jitter as digits change.
 */
export const AnimatedFiatAmount = ({
  value,
  cacheKey,
}: AnimatedFiatAmountProps) => {
  const formatFiatAmount = useFormatFiatAmount()
  const animatedValue = useAnimatedNumber({ value, cacheKey })

  return <TabularNumbers>{formatFiatAmount(animatedValue)}</TabularNumbers>
}

const TabularNumbers = styled.span`
  font-variant-numeric: tabular-nums;
`
