import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { getLimitOrderBuyCoin } from '@core/ui/mpc/keysign/join/tx/limitOrderBuyCoin'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { useTransactionRecords } from '@core/ui/storage/transactionHistory'
import {
  LimitSwapTransactionRecord,
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecordStatus,
  TrustLineTransactionRecord,
} from '@core/ui/transaction-history/core'
import { getRecordTagType } from '@core/ui/transaction-history/recordTagType'
import { useTransactionStatusPolling } from '@core/ui/transaction-history/status/useTransactionStatusPolling'
import { TransactionHistoryTag } from '@core/ui/transaction-history/TransactionHistoryTag'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { toNativeSwapLimitAmount } from '@core/ui/vault/swap/keysignPayload/getSwapToAmountLimit'
import { fromThorchainFixedPoint } from '@core/ui/vault/swap/limit/amount'
import {
  limitOrderStatusColor,
  useFormatLimitOrderExpiry,
  useLimitOrderStatusLabels,
} from '@core/ui/vault/swap/limit/tracking/presentation'
import { useLimitOrderTracking } from '@core/ui/vault/swap/limit/tracking/useLimitOrderTracking'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text, TextColor } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import {
  areEqualCoins,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { thorchainAssetPrefixToChain } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { match } from '@vultisig/lib-utils/match'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { LimitOrderCancelActions } from '../../vault/swap/limit/cancel/LimitOrderCancelActions'

const safeBigInt = (value: string): bigint => {
  try {
    return BigInt(value)
  } catch {
    return BigInt(0)
  }
}

const statusLabelKey = {
  broadcasted: 'broadcasted',
  pending: 'pending',
  confirmed: 'confirmed',
  failed: 'failed',
} as const satisfies Record<TransactionRecordStatus, string>

const statusColor: Record<TransactionRecordStatus, TextColor> = {
  broadcasted: 'idle',
  pending: 'idle',
  confirmed: 'success',
  failed: 'danger',
}

type FormatTimestampInput = {
  timestamp: string
  locale: string
}

const formatTimestamp = ({
  timestamp,
  locale,
}: FormatTimestampInput): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

type DetailRowProps = {
  label: string
  children: ReactNode
}

const DetailRow = ({ label, children }: DetailRowProps) => (
  <HStack alignItems="center" gap={4} justifyContent="space-between">
    <Text color="shy" weight={500}>
      {label}
    </Text>
    {children}
  </HStack>
)

const formatCryptoDisplay = (amount: bigint, decimals: number): string => {
  const raw = Number(fromChainAmount(amount, decimals))
  return formatAmount(raw, { precision: 'high' })
}

type UseFiatFromPriceInput = {
  coin: CoinKey
  fiatValue: string
  cryptoAmount: number
}

const useFiatFromPrice = ({
  coin,
  fiatValue,
  cryptoAmount,
}: UseFiatFromPriceInput): string | null => {
  const formatFiatAmount = useFormatFiatAmount()
  const vaultCoins = useCurrentVaultCoins()
  const vaultCoin = vaultCoins.find(c => areEqualCoins(c, coin))

  const priceQuery = useCoinPricesQuery({
    coins: [
      {
        ...coin,
        priceProviderId: vaultCoin?.priceProviderId,
      },
    ],
    eager: false,
  })

  if (fiatValue) {
    const parsed = Number(fiatValue)
    if (!Number.isNaN(parsed)) return formatFiatAmount(parsed)
    return fiatValue
  }

  if (priceQuery.data != null) {
    const price = priceQuery.data[coinKeyToString(coin)]
    if (price) {
      return formatFiatAmount(price * cryptoAmount)
    }
  }

  return null
}

const SendAmountDisplay = ({ record }: { record: SendTransactionRecord }) => {
  const { data } = record
  const cryptoAmount = Number(
    fromChainAmount(safeBigInt(data.amount), data.decimals)
  )
  const formattedFiat = useFiatFromPrice({
    coin: { chain: record.chain, id: data.tokenId },
    fiatValue: record.fiatValue,
    cryptoAmount,
  })

  return (
    <AmountCard gap={12} alignItems="center">
      {data.tokenLogo && (
        <CoinIcon
          coin={{
            chain: record.chain,
            id: data.tokenId,
            logo: data.tokenLogo,
          }}
          style={{ fontSize: 48 }}
        />
      )}
      <VStack alignItems="center" gap={2}>
        <Text size={18} weight={500} centerHorizontally>
          {formatCryptoDisplay(safeBigInt(data.amount), data.decimals)}{' '}
          {data.token}
        </Text>
        {formattedFiat && (
          <Text size={14} color="supporting" centerHorizontally>
            {formattedFiat}
          </Text>
        )}
      </VStack>
    </AmountCard>
  )
}

const SendDetailPanel = ({ record }: { record: SendTransactionRecord }) => {
  const { t } = useTranslation()
  const { data } = record

  return (
    <Panel>
      <SeparatedByLine gap={12}>
        <DetailRow label={t('from')}>
          <MiddleTruncate text={data.fromAddress} width={160} />
        </DetailRow>
        <DetailRow label={t('to')}>
          <MiddleTruncate text={data.toAddress} width={160} />
        </DetailRow>
        {data.feeEstimate && (
          <DetailRow label={t('network_fee')}>
            <Text>{data.feeEstimate}</Text>
          </DetailRow>
        )}
        {data.memo && (
          <DetailRow label={t('memo')}>
            <Text>{data.memo}</Text>
          </DetailRow>
        )}
      </SeparatedByLine>
    </Panel>
  )
}

/**
 * A trust line has no amount — it authorises an issuer rather than moving
 * anything — so this shows what was actually agreed: the issuer, and the
 * ceiling the account will hold.
 */
const TrustLineDetailPanel = ({
  record,
}: {
  record: TrustLineTransactionRecord
}) => {
  const { t } = useTranslation()
  const { data } = record

  return (
    <>
      <AmountCard gap={12} alignItems="center">
        {data.tokenLogo && (
          <CoinIcon
            coin={{
              chain: record.chain,
              id: data.tokenId,
              logo: data.tokenLogo,
            }}
            style={{ fontSize: 48 }}
          />
        )}
        <Text size={18} weight={500} centerHorizontally>
          {data.token}
        </Text>
      </AmountCard>
      <Panel>
        <SeparatedByLine gap={12}>
          <DetailRow label={t('from')}>
            <MiddleTruncate text={data.fromAddress} width={160} />
          </DetailRow>
          <DetailRow label={t('trust_line_issuer')}>
            <MiddleTruncate text={data.issuer} width={160} />
          </DetailRow>
          <DetailRow label={t('trust_line_limit')}>
            <Text>
              {formatCryptoDisplay(safeBigInt(data.limit), data.decimals)}{' '}
              {data.token}
            </Text>
          </DetailRow>
        </SeparatedByLine>
      </Panel>
    </>
  )
}

const SwapAmountDisplay = ({ record }: { record: SwapTransactionRecord }) => {
  const { t } = useTranslation()
  const { data } = record
  const fromCryptoAmount = Number(
    fromChainAmount(safeBigInt(data.fromAmount), data.fromDecimals)
  )
  const toCryptoAmount = parseFloat(data.toAmount)
  const toAmountLimit = toNativeSwapLimitAmount({
    rawLimit: data.toAmountLimit,
    toCoin: { chain: data.toChain, id: data.toTokenId },
  })
  const fromFiat = useFiatFromPrice({
    coin: { chain: data.fromChain, id: data.fromTokenId },
    fiatValue: record.fiatValue,
    cryptoAmount: fromCryptoAmount,
  })
  const toFiat = useFiatFromPrice({
    coin: { chain: data.toChain, id: data.toTokenId },
    fiatValue: '',
    cryptoAmount: toCryptoAmount,
  })

  return (
    <HStack gap={8} style={{ position: 'relative' }}>
      <SwapCoinCard gap={12} alignItems="center">
        {data.fromTokenLogo && (
          <CoinIcon
            coin={{
              chain: data.fromChain,
              id: data.fromTokenId,
              logo: data.fromTokenLogo,
            }}
            style={{ fontSize: 36 }}
          />
        )}
        <VStack alignItems="center" gap={2}>
          <Text size={14} weight={500} centerHorizontally>
            {formatCryptoDisplay(
              safeBigInt(data.fromAmount),
              data.fromDecimals
            )}{' '}
            {data.fromToken}
          </Text>
          {fromFiat && (
            <Text size={12} color="supporting" centerHorizontally>
              {fromFiat}
            </Text>
          )}
        </VStack>
      </SwapCoinCard>

      <SwapChevronWrapper alignItems="center" justifyContent="center">
        <SwapChevronCircle>
          <ChevronRightIcon />
        </SwapChevronCircle>
      </SwapChevronWrapper>

      <SwapCoinCard gap={12} alignItems="center">
        {data.toTokenLogo && (
          <CoinIcon
            coin={{
              chain: data.toChain,
              id: data.toTokenId,
              logo: data.toTokenLogo,
            }}
            style={{ fontSize: 36 }}
          />
        )}
        <VStack alignItems="center" gap={2}>
          <Text size={14} weight={500} centerHorizontally>
            {formatAmount(toCryptoAmount, { precision: 'high' })} {data.toToken}
          </Text>
          {toFiat && (
            <Text size={12} color="supporting" centerHorizontally>
              {toFiat}
            </Text>
          )}
          {toAmountLimit !== null && (
            <Text size={12} color="shy" centerHorizontally>
              {`${t('to_min_payout')}: ${formatAmount(toAmountLimit, {
                precision: 'high',
              })} ${data.toToken}`}
            </Text>
          )}
        </VStack>
      </SwapCoinCard>
    </HStack>
  )
}

const SwapDetailPanel = ({ record }: { record: SwapTransactionRecord }) => {
  const { t } = useTranslation()
  const { data } = record
  const hasDetails = data.provider || data.route

  if (!hasDetails) return null

  const route = data.route || `${data.fromToken} → ${data.toToken}`

  return (
    <Panel>
      <SeparatedByLine gap={12}>
        {data.route && (
          <DetailRow label={t('route')}>
            <Text>{route}</Text>
          </DetailRow>
        )}
        {data.provider && (
          <DetailRow label={t('provider')}>
            <SwapProviderValue provider={data.provider} />
          </DetailRow>
        )}
      </SeparatedByLine>
    </Panel>
  )
}

const SwapProviderValue = ({ provider }: { provider: string }) => {
  const logoSrc = getSwapProviderLogoSrc(provider)

  return (
    <HStack alignItems="center" gap={6}>
      {logoSrc ? (
        <ChainEntityIcon value={logoSrc} style={{ fontSize: 16 }} />
      ) : null}
      <Text>{provider}</Text>
    </HStack>
  )
}

const LimitSwapAmountDisplay = ({
  record,
}: {
  record: LimitSwapTransactionRecord
}) => {
  const { t } = useTranslation()
  const { data } = record
  // The memo only names the buy asset in THORChain notation; resolve it back to
  // a real coin for its logo. Unresolvable assets render as text, never as
  // another coin's icon.
  const buyCoin = getLimitOrderBuyCoin({
    targetAsset: data.targetAsset,
    targetChain:
      thorchainAssetPrefixToChain[data.targetAsset.split('.')[0].toUpperCase()],
  })

  return (
    <HStack gap={8} style={{ position: 'relative' }}>
      <SwapCoinCard gap={12} alignItems="center">
        {data.fromTokenLogo && (
          <CoinIcon
            coin={{
              chain: data.fromChain,
              id: data.fromTokenId,
              logo: data.fromTokenLogo,
            }}
            style={{ fontSize: 36 }}
          />
        )}
        <VStack alignItems="center" gap={2}>
          <Text size={14} weight={500} centerHorizontally>
            {formatCryptoDisplay(
              safeBigInt(data.fromAmount),
              data.fromDecimals
            )}{' '}
            {data.fromToken}
          </Text>
        </VStack>
      </SwapCoinCard>

      <SwapChevronWrapper alignItems="center" justifyContent="center">
        <SwapChevronCircle>
          <ChevronRightIcon />
        </SwapChevronCircle>
      </SwapChevronWrapper>

      <SwapCoinCard gap={12} alignItems="center">
        {buyCoin ? <CoinIcon coin={buyCoin} style={{ fontSize: 36 }} /> : null}
        <VStack alignItems="center" gap={2}>
          <Text size={14} weight={500} centerHorizontally>
            {`${data.minimumReceived} ${data.buyTicker}`}
          </Text>
          <Text size={12} color="shy" centerHorizontally>
            {t('swap_limit_minimum_received')}
          </Text>
        </VStack>
      </SwapCoinCard>
    </HStack>
  )
}

const LimitSwapDetailPanel = ({
  record,
}: {
  record: LimitSwapTransactionRecord
}) => {
  const { t } = useTranslation()
  const statusLabel = useLimitOrderStatusLabels()
  const formatExpiry = useFormatLimitOrderExpiry()
  const { data } = record

  // The queue's own accounting of what has been paid out so far — kept even
  // after the order closes, since an expiry settle can follow a partial fill.
  const filledSoFar =
    data.amountOut && data.amountOut !== '0'
      ? `${fromThorchainFixedPoint(data.amountOut)} ${data.buyTicker}`
      : null

  return (
    <Panel>
      <SeparatedByLine gap={12}>
        <DetailRow label={t('swap_limit_order_status')}>
          <Text color={limitOrderStatusColor[data.orderStatus]}>
            {statusLabel[data.orderStatus]}
          </Text>
        </DetailRow>
        {filledSoFar && (
          <DetailRow label={t('swap_limit_filled_so_far')}>
            <Text>{filledSoFar}</Text>
          </DetailRow>
        )}
        {data.orderStatus === 'resting' &&
          data.timeToExpiryBlocks !== undefined && (
            <DetailRow label={t('swap_limit_expiry_label')}>
              <Text>{formatExpiry(data.timeToExpiryBlocks)}</Text>
            </DetailRow>
          )}
        <DetailRow label={t('swap_limit_payout_to')}>
          <MiddleTruncate text={data.destinationAddress} width={200} />
        </DetailRow>
        <DetailRow label={t('memo')}>
          <Text style={{ wordBreak: 'break-all', textAlign: 'right' }}>
            {data.memo}
          </Text>
        </DetailRow>
      </SeparatedByLine>
    </Panel>
  )
}

/** Displays detailed information for a single transaction record, including amounts, addresses, status, and an explorer link. */
export const TransactionDetailPage = () => {
  const goBack = useNavigateBack()
  const { t, i18n } = useTranslation()
  const [{ id }] = useCoreViewState<'transactionDetail'>()
  const { openUrl } = useCore()
  const records = useTransactionRecords()

  const record = shouldBePresent(
    records.find(r => r.id === id),
    'transaction record for detail view'
  )

  useTransactionStatusPolling(record)
  // Keeps a limit order's own state fresh while its detail is on screen; the
  // generic poller above deliberately ignores limit records.
  useLimitOrderTracking()

  const explorerUrl =
    record.explorerUrl ||
    getBlockExplorerUrl({
      chain: record.chain,
      entity: 'tx',
      value: record.txHash,
    })

  return (
    <ScreenLayout title={t('transaction_details')} onBack={goBack}>
      <VStack gap={20} alignItems="stretch">
        <VStack alignItems="center">
          <TransactionHistoryTag
            type={getRecordTagType(record.type)}
            label={match(record.type, {
              send: () => undefined,
              swap: () => undefined,
              limitSwap: () => t('swap_mode_limit'),
              trustLine: () => t('trust_line'),
            })}
          />
        </VStack>

        {record.type === 'send' && (
          <>
            <SendAmountDisplay record={record} />
            <SendDetailPanel record={record} />
          </>
        )}

        {record.type === 'swap' && (
          <>
            <SwapAmountDisplay record={record} />
            <SwapDetailPanel record={record} />
          </>
        )}

        {record.type === 'trustLine' && (
          <TrustLineDetailPanel record={record} />
        )}

        {record.type === 'limitSwap' && (
          <>
            <LimitSwapAmountDisplay record={record} />
            <LimitSwapDetailPanel record={record} />
          </>
        )}

        <Panel>
          <SeparatedByLine gap={12}>
            {record.type === 'limitSwap' ? null : (
              <DetailRow label={t('status')}>
                <Text color={statusColor[record.status]}>
                  {t(statusLabelKey[record.status])}
                </Text>
              </DetailRow>
            )}
            <DetailRow label={t('date')}>
              <Text>
                {formatTimestamp({
                  timestamp: record.timestamp,
                  locale: i18n.language,
                })}
              </Text>
            </DetailRow>
            <DetailRow label={t('network')}>
              <HStack alignItems="center" gap={4}>
                <ChainEntityIcon
                  value={getChainLogoSrc(record.chain)}
                  style={{ fontSize: 16 }}
                />
                <Text>{record.chain}</Text>
              </HStack>
            </DetailRow>
            <DetailRow label={t('tx_hash')}>
              <MiddleTruncate text={record.txHash} width={140} />
            </DetailRow>
          </SeparatedByLine>
        </Panel>

        <Button
          kind="secondary"
          onClick={() => openUrl(explorerUrl)}
          icon={<SquareArrowOutUpRightIcon />}
        >
          {t('view_on_explorer')}
        </Button>

        {record.type === 'limitSwap' ? (
          <LimitOrderCancelActions record={record} />
        ) : null}
      </VStack>
    </ScreenLayout>
  )
}

const AmountCard = styled(VStack)`
  background-color: ${({ theme }) => theme.colors.foreground.toCssValue()};
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  ${borderRadius.lg};
  padding: 24px 16px;
  width: 100%;
`

const SwapCoinCard = styled(VStack)`
  background-color: ${({ theme }) => theme.colors.foreground.toCssValue()};
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  ${borderRadius.lg};
  flex: 1;
  padding: 24px 16px;
`

const SwapChevronWrapper = styled(HStack)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  ${borderRadius.pill};
  padding: 7px;
  background-color: ${({ theme }) => theme.colors.background.toCssValue()};
`

const SwapChevronCircle = styled.div`
  ${borderRadius.pill};
  ${sameDimensions(24)};
  ${centerContent};
  background: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  font-size: 16px;
  color: #718096;
`
