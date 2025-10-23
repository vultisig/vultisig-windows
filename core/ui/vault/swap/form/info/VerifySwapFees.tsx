import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { ComponentType, FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'

import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { useSwapFromCoin } from '../../state/fromCoin'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

type VerifySwapFeesProps = {
  RowComponent: ComponentType<PropsWithChildren>
}

export const VerifySwapFees: FC<VerifySwapFeesProps> = ({ RowComponent }) => {
  const { t } = useTranslation()
  const query = useSwapFeesQuery()

  const [fromCoinKey] = useSwapFromCoin()

  return (
    <>
      <MatchQuery
        value={query}
        pending={() => (
          <RowComponent>
            <Text>{t('swap_fee')}</Text>
            <Skeleton width="48px" height="12px" />
          </RowComponent>
        )}
        error={() => (
          <RowComponent>
            <Text>{t('swap_fee')}</Text>
            <Text color="danger">{t('failed_to_load')}</Text>
          </RowComponent>
        )}
        success={({ network, swap }) => {
          const { ticker, decimals } = chainFeeCoin[fromCoinKey.chain]
          return (
            <>
              {swap && (
                <RowComponent>
                  <Text>{t('swap_fee')}</Text>
                  <Text color="shy">
                    <SwapFeeFiatValue value={[swap]} />
                  </Text>
                </RowComponent>
              )}
              <RowComponent>
                <span>{t('network_fee')}</span>
                <Text color="shy">
                  {formatAmount(fromChainAmount(network.amount, decimals), {
                    ticker,
                  })}{' '}
                  (~
                  <SwapFeeFiatValue value={[network]} />)
                </Text>
              </RowComponent>
            </>
          )
        }}
      />
      <RowComponent>
        <span>{t('max_total_fees')}</span>
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
      </RowComponent>
    </>
  )
}
