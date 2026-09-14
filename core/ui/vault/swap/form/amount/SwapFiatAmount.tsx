import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { text } from '@lib/ui/text'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { EntityWithAmount } from '@vultisig/lib-utils/entities/EntityWithAmount'
import styled from 'styled-components'

const Container = styled.div`
  ${text({
    color: 'shy',
    weight: 500,
    size: 12,
  })};
`

type SwapFiatAmountProps = ValueProp<CoinKey & EntityWithAmount> &
  Partial<OnClickProp> & {
    testId?: string
  }

/**
 * The fiat line under a swap amount. With `onClick` the priced line becomes a
 * button — the From side uses it to enter fiat input — while a missing price
 * renders nothing, so there is never a tap target without a rate behind it.
 */
export const SwapFiatAmount = ({
  value,
  onClick,
  testId,
}: SwapFiatAmountProps) => {
  const coin = useCurrentVaultCoin(value)
  const query = useCoinPriceQuery({
    coin,
  })

  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Container>
      <MatchQuery
        value={query}
        error={() => null}
        pending={() => <Skeleton width="1em" height="1em" />}
        success={price => {
          const formatted = formatFiatAmount(value.amount * price)

          return onClick ? (
            <UnstyledButton onClick={onClick} data-testid={testId}>
              {formatted}
            </UnstyledButton>
          ) : (
            formatted
          )
        }}
      />
    </Container>
  )
}
