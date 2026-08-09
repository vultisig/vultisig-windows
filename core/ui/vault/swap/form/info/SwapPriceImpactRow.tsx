import { Text, TextColor } from '@lib/ui/text'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { match } from '@vultisig/lib-utils/match'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import {
  formatPriceImpact,
  getSwapPriceImpact,
  PriceImpactLevel,
} from './priceImpact'
import { SwapFeeRowRenderer } from './swapFeeRow'

const priceImpactColors: Record<PriceImpactLevel, TextColor> = {
  good: 'primary',
  average: 'idle',
  high: 'danger',
}

// Keys stay literal so the i18n integrity check can resolve them statically.
const getPriceImpactLabel = (level: PriceImpactLevel, t: TFunction) =>
  match(level, {
    good: () => t('price_impact_good'),
    average: () => t('price_impact_average'),
    high: () => t('price_impact_high'),
  })

type SwapPriceImpactRowProps = {
  renderRow: SwapFeeRowRenderer
  quote: SwapQuoteResult
}

/**
 * Price impact of the route, hidden entirely for providers that do not report
 * it rather than filled with a stand-in figure.
 */
export const SwapPriceImpactRow = ({
  renderRow,
  quote,
}: SwapPriceImpactRowProps) => {
  const { t } = useTranslation()
  const priceImpact = formatPriceImpact(getSwapPriceImpact(quote))

  if (!priceImpact) return null

  return (
    <>
      {renderRow({
        label: t('price_impact'),
        value: (
          <Text as="span" color={priceImpactColors[priceImpact.level]}>
            {priceImpact.percent} ({getPriceImpactLabel(priceImpact.level, t)})
          </Text>
        ),
      })}
    </>
  )
}
