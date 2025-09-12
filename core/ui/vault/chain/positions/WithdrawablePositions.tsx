import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import styled from 'styled-components'

import { CoinIcon } from '../../../chain/coin/icon/CoinIcon'
import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useMergeableTokenBalancesQuery } from '../../deposit/hooks/useMergeableTokenBalancesQuery'

export const WithdrawablePositions = ({ value }: ValueProp<AccountCoin>) => {
  const mergeableBalancesData = useMergeableTokenBalancesQuery(value.address)

  const price = useCoinPriceQuery({
    coin: value,
  })

  const query = useMergeQueries({
    price,
    mergeableBalancesData,
  })

  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Wrapper gap={18} fullWidth>
      <MatchQuery
        pending={() => (
          <CenterAbsolutely>
            <Spinner />
          </CenterAbsolutely>
        )}
        error={error => (
          <CenterAbsolutely>{extractErrorMsg(error)}</CenterAbsolutely>
        )}
        value={query}
        success={({
          price,
          mergeableBalancesData: { totalSharesFormatted, totalShares },
        }) => {
          const amountInFiat = formatFiatAmount(price * totalShares)

          return (
            <>
              <VStack gap={14}>
                <HStack alignItems="center" justifyContent="space-between">
                  <HStack alignItems="center" gap={12}>
                    <CoinIcon style={{ fontSize: 32 }} coin={value} />
                    <Text weight="700" color="contrast" size={20}>
                      {value.ticker}
                    </Text>
                  </HStack>
                  <Text
                    size={20}
                    weight="700"
                    color="contrast"
                    centerVertically
                  >
                    {amountInFiat}
                  </Text>
                </HStack>
                <Text size={20} weight="700" color="contrast" centerVertically>
                  {totalSharesFormatted}
                </Text>
              </VStack>
            </>
          )
        }}
      />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  min-height: 70px;
  position: relative;
`
