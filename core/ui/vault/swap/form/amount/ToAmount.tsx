import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { text } from '@lib/ui/text'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import styled from 'styled-components'

import { useIndicativeSwapOutputAmountQuery } from '../../queries/useIndicativeSwapOutputAmountQuery'
import { useSwapOutputAmountQuery } from '../../queries/useSwapOutputAmountQuery'
import { useSwapToCoin } from '../../state/toCoin'
import { AmountContainer } from './AmountContainer'
import { SwapFiatAmount } from './SwapFiatAmount'

const Value = styled.div`
  ${takeWholeSpace};
  text-align: right;

  ${text({
    weight: 500,
    size: 22,
    color: 'shy',
    centerVertically: true,
  })}
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

  return (
    <AmountContainer gap={6} alignItems="flex-end">
      <Value data-testid="swap-to-amount">
        {shouldShowFirmQuote ? (
          formatAmount(firmOutputAmount, { precision: 'high' })
        ) : shouldShowIndicative ? (
          <MatchQuery
            value={indicativeQuery}
            pending={() => <ToAmountSkeleton />}
            error={() => <ToAmountSkeleton />}
            inactive={() => formatAmount(0)}
            success={value => formatAmount(value, { precision: 'high' })}
          />
        ) : (
          <MatchQuery
            value={query}
            error={() => formatAmount(0)}
            inactive={() => formatAmount(0)}
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
    </AmountContainer>
  )
}
