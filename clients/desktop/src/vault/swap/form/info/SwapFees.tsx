import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text, TextColor } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { TFunction } from 'i18next'
import { ComponentType, FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Skeleton } from '../../../../components/skeleton'
import { useSwapChainSpecificQuery } from '../../queries/useSwapChainSpecificQuery'
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

interface SwapFeesProps {
  RowComponent: ComponentType<PropsWithChildren>
}

export const SwapFees: FC<SwapFeesProps> = ({ RowComponent }) => {
  const { t } = useTranslation()
  const query = useSwapFeesQuery()
  const chainSpecificQuery = useSwapChainSpecificQuery()
  const swapQuoteQuery = useSwapQuoteQuery()

  return (
    <>
      <RowComponent>
        <span>{t('total_fee')}</span>
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
      <FeesWrapper gap={10}>
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
      </FeesWrapper>

      <MatchQuery
        value={swapQuoteQuery}
        pending={() => <Skeleton width="48px" height="12px" />}
        error={() => <Text color="danger">{t('failed_to_load')}</Text>}
        success={data => {
          const totalBps = 'native' in data ? data.native.fees.total_bps : 0
          if (!totalBps) return null

          const toalBpsPercentage = totalBps / 100
          const { color, label } = getPriceImpactVariant(toalBpsPercentage, t)

          return (
            <RowComponent>
              <span>Price Impact</span>
              <Text color={color}>
                {toalBpsPercentage}% ({label})
              </Text>
            </RowComponent>
          )
        }}
      />
    </>
  )
}

const FeesWrapper = styled(VStack)`
  padding-left: 20px;
  position: relative;

  &:before {
    width: 2px;
    height: 100%;
    content: '';
    background: ${getColor('primaryAlt')};
    top: 0;
    left: 8px;
    bottom: 0;
    position: absolute;
  }
`

const getPriceImpactVariant = (
  toalBpsPercentage: number,
  t: TFunction
): {
  color: TextColor
  label: string
} =>
  toalBpsPercentage < 2.5
    ? {
        color: 'primary',
        label: t('price_impact_good'),
      }
    : toalBpsPercentage < 5
      ? {
          color: 'idle',
          label: t('price_impact_average'),
        }
      : {
          color: 'danger',
          label: t('price_impact_high'),
        }
