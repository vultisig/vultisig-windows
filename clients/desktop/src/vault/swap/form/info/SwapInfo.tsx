import { ActiveQueryOnly } from '@lib/ui/query/components/ActiveQueryOnly'

import { StrictInfoRow } from '../../../../lib/ui/layout/StrictInfoRow'
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'
import { SwapFees } from './SwapFees'
import { SwapProvider } from './SwapProvider'

export const SwapInfo = () => {
  const query = useSwapQuoteQuery()

  if (query.error) {
    return null
  }

  return (
    <ActiveQueryOnly value={query}>
      <SwapProvider />
      <SwapFees RowComponent={StrictInfoRow} />
    </ActiveQueryOnly>
  )
}
