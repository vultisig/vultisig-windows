import { useElementSize } from '@lib/ui/hooks/useElementSize'
import { useFitText } from '@lib/ui/hooks/useFitText'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { useState } from 'react'
import styled from 'styled-components'

import { TokenVerificationBadge } from '../../../../chain/coin/verification/TokenVerificationBadge'
import { getAmountCandidates } from './getAmountCandidates'

const amountFontSize = 14
const badgeGap = 4

const Amount = styled(Text)`
  white-space: nowrap;
  min-width: 0;
`

type SwapReviewAmountProps = {
  coin: Coin
  amount: number
  /** Drops fraction digits until the amount fits its card. Only for estimates. */
  fit?: boolean
}

/**
 * An amount with its ticker on one line. With `fit`, fraction digits are
 * dropped until it fits the card, since a long estimate would otherwise clip
 * behind the arrow; the amount that gets signed is never shortened.
 */
export const SwapReviewAmount = ({
  coin,
  amount,
  fit = false,
}: SwapReviewAmountProps) => {
  const candidates = getAmountCandidates(amount, coin)
  const [badge, setBadge] = useState<HTMLElement | null>(null)
  const badgeWidth = useElementSize(badge)?.width ?? 0

  const { setContainer, text } = useFitText({
    candidates: fit ? candidates : candidates.slice(0, 1),
    size: amountFontSize,
    fixedWidth: badgeWidth > 0 ? badgeWidth + badgeGap : 0,
  })

  return (
    <HStack
      ref={setContainer}
      alignItems="center"
      justifyContent="center"
      gap={badgeGap}
      fullWidth
    >
      <Amount
        as="span"
        variant="stationBodyS"
        color="regular"
        centerHorizontally
        title={candidates[0]}
      >
        {text}
      </Amount>
      <span ref={setBadge}>
        <TokenVerificationBadge value={coin} />
      </span>
    </HStack>
  )
}
