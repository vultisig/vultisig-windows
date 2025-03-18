import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import styled from 'styled-components'

import { takeWholeSpace } from '../../../../lib/ui/css/takeWholeSpace'
import { Spinner } from '../../../../lib/ui/loaders/Spinner'
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery'
import { text } from '../../../../lib/ui/text'
import { useSwapOutputAmountQuery } from '../../queries/useSwapOutputAmountQuery'
import { useToCoin } from '../../state/toCoin'
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

export const ToAmount = () => {
  const query = useSwapOutputAmountQuery()
  const [toCoin] = useToCoin()

  return (
    <AmountContainer gap={6} alignItems="flex-end">
      <Value>
        <MatchQuery
          value={query}
          pending={() => <Spinner />}
          error={() => formatTokenAmount(0)}
          inactive={() => formatTokenAmount(0)}
          success={value => formatTokenAmount(value)}
        />
      </Value>
      <MatchQuery
        value={query}
        pending={() => null}
        error={() => null}
        success={value => (
          <SwapFiatAmount value={{ amount: value, ...toCoin }} />
        )}
      />
    </AmountContainer>
  )
}
