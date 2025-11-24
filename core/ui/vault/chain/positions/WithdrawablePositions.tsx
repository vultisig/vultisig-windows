import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CoinIcon } from '../../../chain/coin/icon/CoinIcon'
import { useCoinPricesQuery } from '../../../chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useUnmergeOptions } from '../../deposit/DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useMergeableTokenBalancesQuery } from '../../deposit/hooks/useMergeableTokenBalancesQuery'

export const WithdrawablePositions = ({ value }: ValueProp<AccountCoin>) => {
  const mergeableBalancesData = useMergeableTokenBalancesQuery()
  const coins = useUnmergeOptions()
  const formatFiatAmount = useFormatFiatAmount()
  const { t } = useTranslation()

  const price = useCoinPricesQuery({
    coins,
  })

  const query = useMergeQueries({
    prices: { ...price, error: undefined },
    mergeableBalancesData,
  })

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
          prices,
          mergeableBalancesData: { balances, totalSharesFormatted },
        }) => {
          const coinBySymbol = new Map(
            coins.map(c => [c.ticker.toUpperCase(), c])
          )

          const rujiFiat = balances.reduce((sum, b) => {
            const coin = coinBySymbol.get(b.symbol.toUpperCase())

            if (!coin) return sum

            const key = coinKeyToString(coin)
            const px = prices[key] ?? 0

            const size = fromChainAmount(
              b.sizeAmountChain,
              knownCosmosTokens['THORChain']['x/ruji'].decimals
            )

            return sum + size * px
          }, 0)

          return (
            <>
              <VStack gap={14}>
                <HStack alignItems="center" justifyContent="space-between">
                  <HStack alignItems="center" gap={12}>
                    <CoinIcon style={{ fontSize: 32 }} coin={value} />
                    <Text weight="700" color="contrast" size={20}>
                      {value.ticker} ({t('merged')})
                    </Text>
                  </HStack>
                  <Text
                    size={20}
                    weight="700"
                    color="contrast"
                    centerVertically
                  >
                    {formatFiatAmount(rujiFiat)}
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
