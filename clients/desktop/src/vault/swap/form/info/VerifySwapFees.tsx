import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { ComponentType, FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '../../../../components/skeleton'
import { useSwapChainSpecificQuery } from '../../queries/useSwapChainSpecificQuery'
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

interface VerifySwapFeesProps {
  RowComponent: ComponentType<PropsWithChildren>
}

export const VerifySwapFees: FC<VerifySwapFeesProps> = ({ RowComponent }) => {
  const { t } = useTranslation()
  const query = useSwapFeesQuery()
  const chainSpecificQuery = useSwapChainSpecificQuery()

  return (
    <>
      <MatchQuery
        value={query}
        success={({ network }) => {
          if (!network) return null

          return (
            <MatchQuery
              value={chainSpecificQuery}
              success={chainSpecific => {
                return (
                  <RowComponent>
                    <span>{t('network_fee')}</span>
                    <Text color="supporting">
                      {formatFee({ ...network, chainSpecific })} (~
                      <SwapFeeFiatValue value={[network]} />)
                    </Text>
                  </RowComponent>
                )
              }}
            />
          )
        }}
      />
      <RowComponent>
        <Text>{t('swap_fee')}</Text>
        <MatchQuery
          value={query}
          pending={() => <Skeleton width="48px" height="12px" />}
          error={() => <Text color="danger">{t('failed_to_load')}</Text>}
          success={({ swap }) => (
            <Text color="supporting">
              <SwapFeeFiatValue value={[swap]} />
            </Text>
          )}
        />
      </RowComponent>
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
