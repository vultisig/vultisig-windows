import { getSwapQuoteProviderName } from '@core/chain/swap/quote/getSwapQuoteProviderName'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

<<<<<<< HEAD:core/ui/vault/swap/form/info/SwapProvider.tsx
=======
import { Skeleton } from '../../../../components/skeleton'
import { StrictInfoRow } from '@core/ui/layout/StrictInfoRow'
>>>>>>> c98b9877 (feat: use useCoreNavigate hook instead of useAppNavigate for vaults organisation):clients/desktop/src/vault/swap/form/info/SwapProvider.tsx
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
