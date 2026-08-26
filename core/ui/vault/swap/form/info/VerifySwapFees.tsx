import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { getSwapQuoteAffiliateBps } from '@core/ui/vault/swap/affiliate/affiliateBps'
import { SwapDiscountInfo } from '@core/ui/vault/swap/form/info/SwapDiscountInfo'
import { SwapNetworkFeeRow } from '@core/ui/vault/swap/form/info/SwapNetworkFeeRow'
import { SwapPriceImpactRow } from '@core/ui/vault/swap/form/info/SwapPriceImpactRow'
import { SwapProviderFeeRows } from '@core/ui/vault/swap/form/info/SwapProviderFeeRows'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
import { getSwapFeeEntries } from '@core/ui/vault/swap/queries/resolveSwapFees'
import { useSwapFeesQuery } from '@core/ui/vault/swap/queries/useSwapFeesQuery'
import {
  renderSwapVerifyRow,
  SwapVerifyRow,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyRow'
import { HStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getSwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/getSwapQuoteProviderName'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

// Stays below the line box of the row label so the logo does not make the row
// taller than its neighbours.
const logoSize = 14

type VerifySwapFeesProps = {
  swapQuote: SwapQuote
}

/**
 * Cost breakdown shown at the moment of approval: provider, network, the
 * product's own cut, protocol, discounts, price impact, then the total. The
 * vault that pays is rendered by the card above it, since a joiner carries no
 * quote to derive these rows from but still names the same signing vault.
 */
export const VerifySwapFees: FC<VerifySwapFeesProps> = ({ swapQuote }) => {
  const { t } = useTranslation()
  const query = useSwapFeesQuery(swapQuote)
  const affiliateBps = getSwapQuoteAffiliateBps(swapQuote.discounts)
  const provider = getSwapQuoteProviderName(swapQuote)
  const providerLogoSrc = getSwapProviderLogoSrc(provider)

  return (
    <>
      <SwapVerifyRow
        label={t('provider')}
        value={
          <HStack alignItems="center" gap={6} justifyContent="end">
            {providerLogoSrc ? (
              <ChainEntityIcon
                value={providerLogoSrc}
                style={{ fontSize: logoSize }}
              />
            ) : null}
            <Text cropped>{provider}</Text>
          </HStack>
        }
      />
      <MatchQuery
        value={query}
        pending={() => (
          <SwapVerifyRow
            label={t('network_fee')}
            value={<Skeleton width="48px" height="12px" />}
          />
        )}
        error={() => (
          <SwapVerifyRow
            label={t('network_fee')}
            value={<Text color="danger">{t('failed_to_load')}</Text>}
          />
        )}
        success={fees => (
          <>
            <SwapNetworkFeeRow
              renderRow={renderSwapVerifyRow}
              fee={fees.network}
              layout="stacked"
            />
            <SwapProviderFeeRows
              renderRow={renderSwapVerifyRow}
              fees={fees}
              affiliateBps={affiliateBps}
            />
            <SwapDiscountInfo
              renderRow={renderSwapVerifyRow}
              discounts={swapQuote.discounts}
              affiliate={fees.affiliate}
              notional={fees.affiliateNotional}
              affiliateBps={affiliateBps}
            />
          </>
        )}
      />
      <SwapPriceImpactRow
        renderRow={renderSwapVerifyRow}
        quote={swapQuote.quote}
      />
      <SwapVerifyRow
        label={t('max_total_fee')}
        value={
          <MatchQuery
            value={query}
            pending={() => <Skeleton width="88px" height="12px" />}
            error={() => <Text color="danger">{t('failed_to_load')}</Text>}
            success={value => (
              <SwapFeeFiatValue value={getSwapFeeEntries(value)} />
            )}
          />
        }
      />
    </>
  )
}
