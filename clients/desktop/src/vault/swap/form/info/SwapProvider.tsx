import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { getSwapQuoteProviderName } from '../../../../chain/swap/quote/getSwapQuoteProviderName'
import { Skeleton } from '../../../../components/skeleton'
import { StrictInfoRow } from '../../../../lib/ui/layout/StrictInfoRow'
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
