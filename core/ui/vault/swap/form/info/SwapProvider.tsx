import { getSwapQuoteProviderName } from '@core/chain/swap/quote/getSwapQuoteProviderName'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'

export const SwapProvider = () => {
  const { t } = useTranslation()

  const query = useSwapQuoteQuery()

  return (
    <StrictInfoRow>
      <Text>{t('provider')}</Text>
      <MatchQuery
        value={query}
        pending={() => <Skeleton width="88px" height="12px" />}
        success={quote => (
          <Text color="supporting">{getSwapQuoteProviderName(quote)}</Text>
        )}
      />
    </StrictInfoRow>
  )
}
