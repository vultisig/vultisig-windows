import { CoinKey } from '@core/chain/coin/Coin'
import { EntityWithAmount } from '@lib/utils/entities/EntityWithAmount'
import styled from 'styled-components'

import { useFormatFiatAmount } from '../../../../chain/ui/hooks/useFormatFiatAmount'
import { useCoinPriceQuery } from '../../../../coin/query/useCoinPriceQuery'
import { Spinner } from '../../../../lib/ui/loaders/Spinner'
import { ValueProp } from '../../../../lib/ui/props'
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery'
import { text } from '../../../../lib/ui/text'
import { useCurrentVaultCoin } from '../../../state/currentVault'

const Container = styled.div`
  pointer-events: none;
  height: 100%;

  ${text({
    color: 'shy',
    weight: 500,
    size: 12,
  })};
`

export const SwapFiatAmount = ({
  value,
}: ValueProp<CoinKey & EntityWithAmount>) => {
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
        pending={() => <Spinner />}
        success={price => formatFiatAmount(value.amount * price)}
      />
    </Container>
  )
}
