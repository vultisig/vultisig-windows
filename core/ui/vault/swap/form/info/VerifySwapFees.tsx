import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getSwapQuoteAffiliateBps } from '@core/ui/vault/swap/affiliate/affiliateBps'
import { SwapDiscountInfo } from '@core/ui/vault/swap/form/info/SwapDiscountInfo'
import { SwapFeeRowRenderer } from '@core/ui/vault/swap/form/info/swapFeeRow'
import { SwapNetworkFeeRow } from '@core/ui/vault/swap/form/info/SwapNetworkFeeRow'
import { SwapPriceImpactRow } from '@core/ui/vault/swap/form/info/SwapPriceImpactRow'
import { SwapProviderFeeRows } from '@core/ui/vault/swap/form/info/SwapProviderFeeRows'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
import { getSwapFeeEntries } from '@core/ui/vault/swap/queries/resolveSwapFees'
import { useSwapFeesQuery } from '@core/ui/vault/swap/queries/useSwapFeesQuery'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
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

const renderRow: SwapFeeRowRenderer = ({ label, value }) => (
  <ListItem
    extra={<Text color="shy">{value}</Text>}
    hoverable={false}
    title={label}
  />
)

/**
 * Cost breakdown shown at the moment of approval, in the order iOS uses:
 * provider, network, the product's own cut, protocol, discounts, price impact,
 * total, then the vault the swap signs from.
 */
export const VerifySwapFees: FC<VerifySwapFeesProps> = ({ swapQuote }) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const query = useSwapFeesQuery(swapQuote)
  const affiliateBps = getSwapQuoteAffiliateBps(swapQuote.discounts)
  const provider = getSwapQuoteProviderName(swapQuote)
  const providerLogoSrc = getSwapProviderLogoSrc(provider)

  return (
    <List>
      <ListItem
        extra={
          <HStack alignItems="center" gap={6}>
            {providerLogoSrc ? (
              <ChainEntityIcon
                value={providerLogoSrc}
                style={{ fontSize: logoSize }}
              />
            ) : null}
            <Text color="shy" cropped>
              {provider}
            </Text>
          </HStack>
        }
        hoverable={false}
        title={t('provider')}
      />
      <MatchQuery
        value={query}
        pending={() => (
          <ListItem
            extra={<Skeleton width="48px" height="12px" />}
            hoverable={false}
            title={t('network_fee')}
          />
        )}
        error={() => (
          <ListItem
            extra={<Text color="danger">{t('failed_to_load')}</Text>}
            hoverable={false}
            title={t('network_fee')}
          />
        )}
        success={fees => (
          <>
            <SwapNetworkFeeRow renderRow={renderRow} fee={fees.network} />
            <SwapProviderFeeRows
              renderRow={renderRow}
              fees={fees}
              affiliateBps={affiliateBps}
            />
            <SwapDiscountInfo
              renderRow={renderRow}
              discounts={swapQuote.discounts}
              affiliate={fees.affiliate}
              notional={fees.affiliateNotional}
              affiliateBps={affiliateBps}
            />
          </>
        )}
      />
      <SwapPriceImpactRow renderRow={renderRow} quote={swapQuote.quote} />
      <ListItem
        extra={
          <MatchQuery
            value={query}
            pending={() => <Skeleton width="88px" height="12px" />}
            error={() => <Text color="danger">{t('failed_to_load')}</Text>}
            success={value => (
              <Text color="supporting">
                <SwapFeeFiatValue value={getSwapFeeEntries(value)} />
              </Text>
            )}
          />
        }
        hoverable={false}
        title={t('total_fee')}
      />
      <ListItem
        extra={<Text color="shy">{vault.name}</Text>}
        hoverable={false}
        title={t('vault')}
      />
    </List>
  )
}
