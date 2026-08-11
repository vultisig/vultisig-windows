import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ComponentType, FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getSwapQuoteAffiliateBps } from '../../affiliate/affiliateBps'
import { getSwapFeeEntries } from '../../queries/resolveSwapFees'
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { SwapDiscountInfo } from './SwapDiscountInfo'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { SwapNetworkFeeRow } from './SwapNetworkFeeRow'
import { SwapPriceImpactRow } from './SwapPriceImpactRow'
import { SwapProviderFeeRows } from './SwapProviderFeeRows'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

type SwapFeesProps = {
  RowComponent: ComponentType<PropsWithChildren>
  swapQuote: SwapQuote
}

export const SwapFees: FC<SwapFeesProps> = ({ RowComponent, swapQuote }) => {
  const [showFeesBreakdown, { toggle }] = useBoolean(false)
  const prefersReduced = useReducedMotion()

  const { t } = useTranslation()
  const query = useSwapFeesQuery(swapQuote)
  const affiliateBps = getSwapQuoteAffiliateBps(swapQuote.discounts)

  const renderRow: SwapFeeRowRenderer = ({ label, value }) => (
    <RowComponent>
      <span>{label}</span>
      <Text color="supporting">{value}</Text>
    </RowComponent>
  )

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
              <Text color="supporting">
                <SwapFeeFiatValue value={getSwapFeeEntries(value)} />
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
                    <Text>{t('network_fee')}</Text>
                    <Skeleton width="48px" height="12px" />
                  </RowComponent>
                )}
                error={() => (
                  <RowComponent>
                    <Text>{t('network_fee')}</Text>
                    <Text color="danger">{t('failed_to_load')}</Text>
                  </RowComponent>
                )}
                success={fees => (
                  <>
                    <SwapNetworkFeeRow
                      renderRow={renderRow}
                      fee={fees.network}
                    />
                    <SwapProviderFeeRows
                      renderRow={renderRow}
                      fees={fees}
                      affiliateBps={affiliateBps}
                    />
                    <SwapDiscountInfo
                      renderRow={renderRow}
                      discounts={swapQuote.discounts}
                      affiliate={fees.affiliate}
                      notional={fees.affiliateNotional}
                      affiliateBps={affiliateBps}
                    />
                    <SwapPriceImpactRow
                      renderRow={renderRow}
                      quote={swapQuote.quote}
                    />
                  </>
                )}
              />
            </FeesWrapper>
          </motion.div>
        )}
      </AnimatePresence>
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
