import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { ActiveQueryOnly } from '@lib/ui/query/components/ActiveQueryOnly'

<<<<<<< HEAD:core/ui/vault/swap/form/info/SwapInfo.tsx
=======
import { StrictInfoRow } from '@core/ui/layout/StrictInfoRow'
>>>>>>> c98b9877 (feat: use useCoreNavigate hook instead of useAppNavigate for vaults organisation):clients/desktop/src/vault/swap/form/info/SwapInfo.tsx
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
