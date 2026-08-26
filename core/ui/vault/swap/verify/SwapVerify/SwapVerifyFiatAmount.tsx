import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import styled from 'styled-components'

type SwapVerifyFiatAmountProps = {
  coin: Coin
  amount: number
}

const Container = styled.span`
  ${text({
    color: 'shy',
    size: 13,
  })}
`

/**
 * Fiat estimate shown under a swap amount on the approval card. Prices the coin
 * it is handed rather than looking one up in the vault, so the joiner — who
 * holds only the payload's coins — renders through the same component as the
 * initiator.
 */
export const SwapVerifyFiatAmount = ({
  coin,
  amount,
}: SwapVerifyFiatAmountProps) => {
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
