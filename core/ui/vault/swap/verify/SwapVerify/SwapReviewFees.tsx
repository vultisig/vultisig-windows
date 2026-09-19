import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { getSwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/getSwapQuoteProviderName'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainEntityIcon } from '../../../../chain/coin/icon/ChainEntityIcon'
import { getSwapProviderLogoSrc } from '../../../../chain/metadata/getSwapProviderLogoSrc'
import { ReviewDivider } from '../../../../mpc/keysign/review/ReviewDivider'
import { ReviewRow } from '../../../../mpc/keysign/review/ReviewRow'
import { getSwapFeeDisclosure } from '../../affiliate/affiliateBps'
import { formatSlippage } from '../../form/advanced/slippage'
import { SwapDiscountInfo } from '../../form/info/SwapDiscountInfo'
import { SwapFeeRowRenderer } from '../../form/info/swapFeeRow'
import { getSwapNetworkFeeLabelKey } from '../../form/info/swapNetworkFeeLabel'
import { SwapNetworkFeeRow } from '../../form/info/SwapNetworkFeeRow'
import { SwapPriceImpactRow } from '../../form/info/SwapPriceImpactRow'
import { SwapProviderFeeRows } from '../../form/info/SwapProviderFeeRows'
import { SwapFeeFiatValue } from '../../form/info/SwapTotalFeeFiatValue'
import { getSwapFeeEntries } from '../../queries/resolveSwapFees'
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { useAdvancedSwapSettings } from '../../state/advancedSettings'
import { useSwapFromCoin } from '../../state/fromCoin'

const providerLogoSize = 16

const TotalToggle = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 20px;
  color: ${getColor('textShyExtra')};

  &:hover {
    color: ${getColor('contrast')};
  }
`

const Breakdown = styled(VStack)`
  gap: 12px;
  padding-left: 12px;
  border-left: 1px solid ${getColor('primaryAccentFour')};
`

const renderBreakdownRow: SwapFeeRowRenderer = ({ label, value }) => (
  <ReviewRow label={label} value={value} size="small" />
)

type SwapReviewFeesProps = {
  swapQuote: SwapQuote
}

/**
 * The cost of the swap on its review sheet: provider and slippage up front,
 * then the total, which unfolds into the same breakdown the approval card
 * showed — network, the product's cut, protocol, discounts, price impact and
 * the maximum total.
 */
export const SwapReviewFees = ({ swapQuote }: SwapReviewFeesProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const query = useSwapFeesQuery(swapQuote)
  const disclosure = getSwapFeeDisclosure(swapQuote.discounts)
  const [{ chain: fromChain }] = useSwapFromCoin()
  const [{ slippage }] = useAdvancedSwapSettings()
  const networkFeeLabel = t(getSwapNetworkFeeLabelKey(fromChain))
  const provider = getSwapQuoteProviderName(swapQuote)
  const providerLogoSrc = getSwapProviderLogoSrc(provider)

  const total = (
    <MatchQuery
      value={query}
      pending={() => <Skeleton width="44px" height="12px" />}
      error={() => <Text color="danger">{t('failed_to_load')}</Text>}
      success={value => <SwapFeeFiatValue value={getSwapFeeEntries(value)} />}
    />
  )

  return (
    <VStack gap={12}>
      <ReviewDivider />
      <ReviewRow
        label={t('provider')}
        size="small"
        valueColor="shyExtra"
        value={
          <>
            {providerLogoSrc && (
              <ChainEntityIcon
                value={providerLogoSrc}
                style={{ fontSize: providerLogoSize }}
              />
            )}
            <Text as="span" cropped>
              {provider}
            </Text>
          </>
        }
      />
      <ReviewRow
        label={t('slippage')}
        size="small"
        valueColor="shyExtra"
        value={formatSlippage(slippage, t('auto'))}
      />
      <TotalToggle
        onClick={() => setIsExpanded(prev => !prev)}
        aria-expanded={isExpanded}
      >
        <Text as="span" variant="footnote" color="shy">
          {t('total_fee')}
        </Text>
        <HStack alignItems="center" gap={4}>
          <Text as="span" variant="stationBodyS">
            {total}
          </Text>
          <CollapsableStateIndicator
            isOpen={isExpanded}
            style={{ fontSize: 12 }}
          />
        </HStack>
      </TotalToggle>
      {isExpanded && (
        <Breakdown>
          <MatchQuery
            value={query}
            pending={() =>
              renderBreakdownRow({
                label: networkFeeLabel,
                value: <Skeleton width="48px" height="12px" />,
              })
            }
            error={() =>
              renderBreakdownRow({
                label: networkFeeLabel,
                value: <Text color="danger">{t('failed_to_load')}</Text>,
              })
            }
            success={fees => (
              <>
                <SwapNetworkFeeRow
                  renderRow={renderBreakdownRow}
                  fee={fees.network}
                />
                <SwapProviderFeeRows
                  renderRow={renderBreakdownRow}
                  fees={fees}
                  disclosure={disclosure}
                />
                <SwapDiscountInfo
                  renderRow={renderBreakdownRow}
                  savings={disclosure.savings}
                />
              </>
            )}
          />
          <SwapPriceImpactRow
            renderRow={renderBreakdownRow}
            quote={swapQuote.quote}
          />
          {renderBreakdownRow({ label: t('max_total_fee'), value: total })}
        </Breakdown>
      )}
    </VStack>
  )
}
