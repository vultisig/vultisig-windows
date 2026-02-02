import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { text } from '@lib/ui/text'
import styled from 'styled-components'

type JoinSwapFiatAmountProps = {
  coin: AccountCoin
  amount: number
}

const Container = styled.span`
  ${text({
    color: 'shy',
    size: 13,
  })}
`

export const JoinSwapFiatAmount = ({
  coin,
  amount,
}: JoinSwapFiatAmountProps) => {
  const query = useCoinPriceQuery({ coin })
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Container>
      <MatchQuery
        value={query}
        error={() => null}
        pending={() => <Skeleton width="3em" height="1em" />}
        success={price => (price ? formatFiatAmount(amount * price) : null)}
      />
    </Container>
  )
}
