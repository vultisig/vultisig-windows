import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
import { useSwapFeesQuery } from '@core/ui/vault/swap/queries/useSwapFeesQuery'
import { useSwapFromCoin } from '@core/ui/vault/swap/state/fromCoin'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type VerifySwapFeesProps = {
  swapQuote: SwapQuote
}

export const VerifySwapFees: FC<VerifySwapFeesProps> = ({ swapQuote }) => {
  const { t } = useTranslation()
  const [fromCoinKey] = useSwapFromCoin()
  const query = useSwapFeesQuery(swapQuote)

  return (
    <List>
      <MatchQuery
        value={query}
        pending={() => (
          <ListItem
            extra={<Skeleton width="48px" height="12px" />}
            hoverable={false}
            title={t('swap_fee')}
          />
        )}
        error={() => (
          <ListItem
            extra={<Text color="danger">{t('failed_to_load')}</Text>}
            hoverable={false}
            title={t('swap_fee')}
          />
        )}
        success={({ network, swap }) => {
          const { ticker, decimals } = chainFeeCoin[fromCoinKey.chain]
          return (
            <>
              {swap && (
                <ListItem
                  extra={
                    <Text color="shy">
                      <SwapFeeFiatValue value={[swap]} />
                    </Text>
                  }
                  hoverable={false}
                  title={t('swap_fee')}
                />
              )}
              <ListItem
                extra={
                  <Text color="shy">
                    {formatAmount(fromChainAmount(network.amount, decimals), {
                      ticker,
                    })}{' '}
                    (~
                    <SwapFeeFiatValue value={[network]} />)
                  </Text>
                }
                hoverable={false}
                title={t('network_fee')}
              />
            </>
          )
        }}
      />
      <ListItem
        extra={
          <MatchQuery
            value={query}
            pending={() => <Skeleton width="88px" height="12px" />}
            error={() => <Text color="danger">{t('failed_to_load')}</Text>}
            success={value => (
              <Text color="supporting">
                <SwapFeeFiatValue value={Object.values(value)} />
              </Text>
            )}
          />
        }
        hoverable={false}
        title={t('max_total_fees')}
      />
    </List>
  )
}
