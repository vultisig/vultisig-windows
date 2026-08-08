import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { HStack } from '@lib/ui/layout/Stack'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getSwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/getSwapQuoteProviderName'
import { useTranslation } from 'react-i18next'

import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'

// Stays below the line box of the row label so the resolved quote does not
// make the row taller than its skeleton.
const logoSize = 14

export const SwapProvider = () => {
  const { t } = useTranslation()

  const query = useSwapQuoteQuery()

  return (
    <StrictInfoRow>
      <Text>{t('provider')}</Text>
      <MatchQuery
        value={query}
        pending={() => <Skeleton width="88px" height="12px" />}
        success={quote => {
          const provider = getSwapQuoteProviderName(quote)
          const logoSrc = getSwapProviderLogoSrc(provider)

          return (
            <HStack alignItems="center" gap={6}>
              {logoSrc ? (
                <ChainEntityIcon
                  value={logoSrc}
                  style={{ fontSize: logoSize }}
                />
              ) : null}
              <Text color="supporting" cropped>
                {provider}
              </Text>
            </HStack>
          )
        }}
      />
    </StrictInfoRow>
  )
}
