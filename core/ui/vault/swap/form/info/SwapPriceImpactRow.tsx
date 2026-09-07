import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { useTranslation } from 'react-i18next'

import { formatPriceImpact, getSwapPriceImpact } from './priceImpact'
import { PriceImpactValue } from './PriceImpactValue'
import { SwapFeeRowRenderer } from './swapFeeRow'

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
        value: <PriceImpactValue value={priceImpact} />,
      })}
    </>
  )
}
