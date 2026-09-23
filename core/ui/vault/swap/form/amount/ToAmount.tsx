import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { text } from '@lib/ui/text'
import { FitText } from '@lib/ui/text/FitText'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import styled from 'styled-components'

import { useIndicativeSwapOutputAmountQuery } from '../../queries/useIndicativeSwapOutputAmountQuery'
import { useSwapOutputAmountQuery } from '../../queries/useSwapOutputAmountQuery'
import { useSwapToCoin } from '../../state/toCoin'
import { AmountContainer } from './AmountContainer'
import { SwapFiatAmount } from './SwapFiatAmount'

const valueFontSize = 22
const minValueFontSize = 14

const Value = styled.div`
  ${takeWholeSpace};
  text-align: right;

  ${text({
    weight: 500,
    size: valueFontSize,
    color: 'shy',
    centerVertically: true,
  })}
`

/**
 * Shares the row with the coin pill, so it takes whatever the pill leaves
 * rather than its content width — a long amount then shrinks inside the card
 * instead of pushing past its edge.
 */
const Container = styled(AmountContainer)`
  flex: 1;
  min-width: 0;
`

const ToAmountSkeleton = () => (
  <VStack gap={6} alignItems="flex-end">
    <Skeleton width="100px" height="12px" />
    <Skeleton width="50px" height="12px" />
  </VStack>
)

export const ToAmount = () => {
  const query = useSwapOutputAmountQuery()
  const indicativeQuery = useIndicativeSwapOutputAmountQuery()
  const [toCoin] = useSwapToCoin()
  const firmOutputAmount = query.isPlaceholderData ? undefined : query.data
  const shouldShowFirmQuote = firmOutputAmount !== undefined
  const shouldShowIndicative = query.isPending || query.isPlaceholderData

  const renderValue = (value: string) => (
    <FitText value={value} size={valueFontSize} minSize={minValueFontSize} />
  )

  return (
    <Container gap={6} alignItems="flex-end">
      <Value data-testid="swap-to-amount">
        {shouldShowFirmQuote ? (
          renderValue(formatAmount(firmOutputAmount, { precision: 'high' }))
        ) : shouldShowIndicative ? (
          <MatchQuery
            value={indicativeQuery}
            pending={() => <ToAmountSkeleton />}
            error={() => <ToAmountSkeleton />}
            inactive={() => renderValue(formatAmount(0))}
            success={value =>
              renderValue(formatAmount(value, { precision: 'high' }))
            }
          />
        ) : (
          <MatchQuery
            value={query}
            error={() => renderValue(formatAmount(0))}
            inactive={() => renderValue(formatAmount(0))}
          />
        )}
      </Value>
      {shouldShowFirmQuote ? (
        <SwapFiatAmount value={{ amount: firmOutputAmount, ...toCoin }} />
      ) : (
        shouldShowIndicative && (
          <MatchQuery
            value={indicativeQuery}
            pending={() => null}
            error={() => null}
            inactive={() => null}
            success={value => (
              <SwapFiatAmount value={{ amount: value, ...toCoin }} />
            )}
          />
        )
      )}
    </Container>
  )
}
