import { HStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { BoundSwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { useTranslation } from 'react-i18next'

import { getSwapFeeEntries } from '../../queries/resolveSwapFees'
import { getSwapQuoteEtaSeconds } from '../../queries/swapQuoteEta'
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { SwapFeeFiatValue } from '../info/SwapTotalFeeFiatValue'
import { useFormatSwapRouteEta } from './swapRouteEta'

type SwapRouteSubtitleProps = {
  quote: BoundSwapQuote
}

/**
 * What a route costs and how long it takes, as one line under the provider
 * name. The fee is the same total the swap form quotes for the active route,
 * network fee included, so switching routes cannot change how the number is
 * read. Providers that publish no settlement estimate simply lose that segment.
 */
export const SwapRouteSubtitle = ({ quote }: SwapRouteSubtitleProps) => {
  const { t } = useTranslation()
  const query = useSwapFeesQuery(quote)
  const formatEta = useFormatSwapRouteEta()
  const etaSeconds = getSwapQuoteEtaSeconds(quote.quote)

  return (
    <HStack alignItems="center" gap={4}>
      <Text size={12} color="shy">
        {t('total_fee')}
      </Text>
      <MatchQuery
        value={query}
        pending={() => <Skeleton as="span" width="36px" height="10px" />}
        error={() => (
          <Text size={12} color="shy">
            {t('failed_to_load')}
          </Text>
        )}
        success={fees => (
          <Text size={12} color="shy">
            <SwapFeeFiatValue value={getSwapFeeEntries(fees)} />
          </Text>
        )}
      />
      {etaSeconds !== undefined && (
        <Text size={12} color="shy">
          {`· ${formatEta(etaSeconds)}`}
        </Text>
      )}
    </HStack>
  )
}
