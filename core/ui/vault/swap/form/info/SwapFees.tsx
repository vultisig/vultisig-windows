import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text, TextColor } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { TFunction } from 'i18next'
import { ComponentType, FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

type SwapFeesProps = {
  RowComponent: ComponentType<PropsWithChildren>
}

export const SwapFees: FC<SwapFeesProps> = ({ RowComponent }) => {
  const [showFeesBreakdown, { toggle }] = useBoolean(false)
  const prefersReduced = useReducedMotion()

  const { t } = useTranslation()
  const query = useSwapFeesQuery()
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
            <HStack alignItems="center" gap={4}>
              <Text color="shy">
                <SwapFeeFiatValue value={Object.values(value)} />
              </Text>
              <UnstyledButton onClick={toggle}>
                <CollapsableStateIndicator isOpen={showFeesBreakdown} />
              </UnstyledButton>
            </HStack>
          )}
        />
      </RowComponent>
      <AnimatePresence initial={false}>
        {showFeesBreakdown && (
          <motion.div
            key="fees"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: prefersReduced ? 0 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ overflow: 'hidden' }}
          >
            <FeesWrapper gap={10}>
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
                success={({ network, swap }) => (
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
                        {formatFee(network)} (~
                        <SwapFeeFiatValue value={[network]} />)
                      </Text>
                    </RowComponent>
                  </>
                )}
              />
            </FeesWrapper>
          </motion.div>
        )}
      </AnimatePresence>

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
