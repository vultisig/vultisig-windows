import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { getLimitOrderBuyCoin } from '@core/ui/mpc/keysign/join/tx/limitOrderBuyCoin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { toNativeSwapLimitAmount } from '@core/ui/vault/swap/keysignPayload/getSwapToAmountLimit'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  areEqualCoins,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { thorchainAssetPrefixToChain } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'
import styled, { keyframes } from 'styled-components'

import {
  LimitSwapTransactionRecord,
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
} from '../core'
import { getRecordTagType } from '../recordTagType'
import { TransactionHistoryTag } from '../TransactionHistoryTag'

const safeBigInt = (value: string): bigint => {
  try {
    return BigInt(value)
  } catch {
    return BigInt(0)
  }
}

const useFiatValue = (coin: CoinKey, cryptoAmount: number) => {
  const formatFiatAmount = useFormatFiatAmount()
  const vaultCoins = useCurrentVaultCoins()
  const vaultCoin = vaultCoins.find(c => areEqualCoins(c, coin))

  const priceQuery = useCoinPricesQuery({
    coins: [{ ...coin, priceProviderId: vaultCoin?.priceProviderId }],
    eager: false,
  })

  if (priceQuery.data != null) {
    const price = priceQuery.data[coinKeyToString(coin)]
    if (price) return formatFiatAmount(price * cryptoAmount)
  }

  return null
}

/** Renders a send transaction progress card with from-amount. */
const SendProgressContent = ({ record }: { record: SendTransactionRecord }) => {
  const { t } = useTranslation()
  const { data } = record
  const cryptoAmount = Number(
    fromChainAmount(safeBigInt(data.amount), data.decimals)
  )
  const fiat = useFiatValue(
    { chain: record.chain, id: data.tokenId },
    cryptoAmount
  )
  const truncatedAddress = `${data.toAddress.slice(0, 8)}...${data.toAddress.slice(-6)}`

  return (
    <StepperContainer>
      <StepperLine />

      <VStack gap={16} style={{ position: 'relative' }}>
        <HStack alignItems="center" gap={8}>
          {data.tokenLogo && (
            <CoinIcon
              coin={{
                chain: record.chain,
                id: data.tokenId,
                logo: data.tokenLogo,
              }}
              style={{ fontSize: 28 }}
            />
          )}
          <VStack gap={2}>
            <Text size={16} weight={600}>
              {formatAmount(cryptoAmount, { precision: 'high' })} {data.token}
            </Text>
            {fiat && (
              <Text size={12} color="supporting">
                {fiat}
              </Text>
            )}
          </VStack>
        </HStack>

        <HStack alignItems="center" gap={8} fullWidth>
          <StepperIcon>
            <ArrowDownIcon />
          </StepperIcon>
          <Text size={13} color="shy">
            {t('to')}
          </Text>
          <StepperDivider />
        </HStack>

        <HStack alignItems="center" gap={8}>
          <DestinationWalletIcon>
            <WalletIcon />
          </DestinationWalletIcon>
          <Text size={14} color="shy">
            {truncatedAddress}
          </Text>
        </HStack>
      </VStack>
    </StepperContainer>
  )
}

/** Renders a swap transaction progress card with from → to vertical stepper. */
/**
 * A resting limit order: the sell side, the connector with an indeterminate
 * ring circling its arrow, then the order's guaranteed minimum on the buy
 * side.
 *
 * The "min. payout" label is reused verbatim from the swap path because it is
 * exactly right here — a limit order's LIM *is* a guaranteed minimum output,
 * not an estimate. The buy asset is resolved from the memo's THORChain notation
 * for its icon; an unresolvable one renders as text rather than borrowing
 * another coin's logo.
 */
const LimitSwapProgressContent = ({
  record,
}: {
  record: LimitSwapTransactionRecord
}) => {
  const { t } = useTranslation()
  const { data } = record
  const fromAmount = Number(
    fromChainAmount(safeBigInt(data.fromAmount), data.fromDecimals)
  )
  const fromFiat = useFiatValue(
    { chain: data.fromChain, id: data.fromTokenId },
    fromAmount
  )
  const buyCoin = getLimitOrderBuyCoin({
    targetAsset: data.targetAsset,
    targetChain:
      thorchainAssetPrefixToChain[data.targetAsset.split('.')[0].toUpperCase()],
  })

  return (
    <StepperContainer>
      <StepperLine />

      <VStack gap={16} style={{ position: 'relative' }}>
        <HStack alignItems="center" gap={8}>
          {data.fromTokenLogo && (
            <CoinIcon
              coin={{
                chain: data.fromChain,
                id: data.fromTokenId,
                logo: data.fromTokenLogo,
              }}
              style={{ fontSize: 28 }}
            />
          )}
          <VStack gap={2}>
            <Text size={16} weight={600}>
              {formatAmount(fromAmount, { precision: 'high' })} {data.fromToken}
            </Text>
            {fromFiat && (
              <Text size={12} color="supporting">
                {fromFiat}
              </Text>
            )}
          </VStack>
        </HStack>

        <HStack alignItems="center" gap={8} fullWidth>
          <StepperIcon>
            <PendingRing viewBox="0 0 28 28" aria-hidden>
              <circle cx="14" cy="14" r="13" pathLength="100" />
            </PendingRing>
            <ArrowDownIcon />
          </StepperIcon>
          <Text size={13} color="shy">
            {t('to')}
          </Text>
          <StepperDivider />
        </HStack>

        <HStack alignItems="center" gap={8}>
          {buyCoin ? (
            <CoinIcon coin={buyCoin} style={{ fontSize: 28 }} />
          ) : null}
          <VStack gap={2}>
            <Text size={11} color="shy">
              {t('to_min_payout')}
            </Text>
            <Text size={16} weight={600}>
              {data.minimumReceived} {data.buyTicker}
            </Text>
          </VStack>
        </HStack>
      </VStack>

      <SwapProviderPill provider={Chain.THORChain} />
    </StepperContainer>
  )
}

const SwapProgressContent = ({ record }: { record: SwapTransactionRecord }) => {
  const { t } = useTranslation()
  const { data } = record
  const fromAmount = Number(
    fromChainAmount(safeBigInt(data.fromAmount), data.fromDecimals)
  )
  const toAmount = parseFloat(data.toAmount)
  const toAmountLimit = toNativeSwapLimitAmount({
    rawLimit: data.toAmountLimit,
    toCoin: { chain: data.toChain, id: data.toTokenId },
  })
  const fromFiat = useFiatValue(
    { chain: data.fromChain, id: data.fromTokenId },
    fromAmount
  )
  const toFiat = useFiatValue(
    { chain: data.toChain, id: data.toTokenId },
    toAmount
  )

  return (
    <StepperContainer>
      <StepperLine />

      <VStack gap={16} style={{ position: 'relative' }}>
        <HStack alignItems="center" gap={8}>
          {data.fromTokenLogo && (
            <CoinIcon
              coin={{
                chain: data.fromChain,
                id: data.fromTokenId,
                logo: data.fromTokenLogo,
              }}
              style={{ fontSize: 28 }}
            />
          )}
          <VStack gap={2}>
            <Text size={16} weight={600}>
              {formatAmount(fromAmount, { precision: 'high' })} {data.fromToken}
            </Text>
            {fromFiat && (
              <Text size={12} color="supporting">
                {fromFiat}
              </Text>
            )}
          </VStack>
        </HStack>

        <HStack alignItems="center" gap={8} fullWidth>
          <StepperIcon>
            <ArrowDownIcon />
          </StepperIcon>
          <Text size={13} color="shy">
            {t('to')}
          </Text>
          <StepperDivider />
        </HStack>

        <HStack alignItems="center" gap={8}>
          {data.toTokenLogo && (
            <CoinIcon
              coin={{
                chain: data.toChain,
                id: data.toTokenId,
                logo: data.toTokenLogo,
              }}
              style={{ fontSize: 28 }}
            />
          )}
          <VStack gap={2}>
            <Text size={11} color="shy">
              {t('swap_expected_payout')}
            </Text>
            <Text size={16} weight={600}>
              {formatAmount(toAmount, { precision: 'high' })} {data.toToken}
            </Text>
            {toFiat && (
              <Text size={12} color="supporting">
                {toFiat}
              </Text>
            )}
            {toAmountLimit !== null && (
              <Text size={12} color="shy">
                {`${t('to_min_payout')}: ${formatAmount(toAmountLimit, {
                  precision: 'high',
                })} ${data.toToken}`}
              </Text>
            )}
          </VStack>
        </HStack>
      </VStack>

      {data.provider && <SwapProviderPill provider={data.provider} />}
    </StepperContainer>
  )
}

const SwapProviderPill = ({ provider }: { provider: string }) => {
  const { t } = useTranslation()
  const logoSrc = getSwapProviderLogoSrc(provider)

  return (
    <ProviderPill>
      {logoSrc ? (
        <ProviderIconSlot>
          <ChainEntityIcon value={logoSrc} style={{ fontSize: 16 }} />
        </ProviderIconSlot>
      ) : null}
      <Text variant="caption" color="shy">
        {t('via')}
      </Text>
      <Text variant="caption" color="regular" weight={600}>
        {provider}
      </Text>
    </ProviderPill>
  )
}

type PendingTransactionProgressCardProps = {
  record: TransactionRecord
}

/** Displays a progress card for a pending/broadcasted transaction above the transaction list. */
export const PendingTransactionProgressCard = ({
  record,
}: PendingTransactionProgressCardProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const handleClick = () =>
    navigate({ id: 'transactionDetail', state: { id: record.id } })

  return (
    <ProgressCard
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <TopRow>
        <TransactionHistoryTag
          type={getRecordTagType(record.type)}
          label={match(record.type, {
            send: () => undefined,
            swap: () => undefined,
            limitSwap: () => t('swap_mode_limit'),
            trustLine: () => t('trust_line'),
          })}
        />
        <InProgressBadge>
          <Text variant="caption" color="shy">
            {record.type === 'limitSwap'
              ? t('swap_limit_status_in_progress')
              : t('in_progress')}
          </Text>
        </InProgressBadge>
      </TopRow>

      {record.type === 'send' ? (
        <SendProgressContent record={record} />
      ) : record.type === 'limitSwap' ? (
        <LimitSwapProgressContent record={record} />
      ) : record.type === 'trustLine' ? null : ( // above already says everything this card can. // A TrustSet confirms in seconds and has no amount to track, so the tag
        <SwapProgressContent record={record} />
      )}
    </ProgressCard>
  )
}

const ProgressCard = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TopRow = styled(HStack).attrs({
  alignItems: 'center',
  justifyContent: 'space-between',
})`
  width: 100%;
`

const InProgressBadge = styled.div`
  padding: 6px 12px;
  border-radius: 99px;
  background: ${({ theme }) =>
    theme.colors.foregroundExtra.withAlpha(0.5).toCssValue()};
  border: 1px solid ${getColor('foregroundExtra')};
`

const StepperContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const StepperLine = styled.div`
  position: absolute;
  left: 14px;
  top: 32px;
  bottom: 24px;
  width: 1px;
  background: ${getColor('foregroundExtra')};
`

const ringSpin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

/**
 * The arc's head runs ahead of its tail and then the tail catches up, so the
 * stroke grows to roughly four-fifths of the circle and shrinks back each
 * cycle. `pathLength="100"` normalises the circumference, so these are plain
 * percentages rather than radius-derived magic numbers.
 */
const ringDash = keyframes`
  0% {
    stroke-dasharray: 1 100;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 80 100;
    stroke-dashoffset: -20;
  }
  100% {
    stroke-dasharray: 1 100;
    stroke-dashoffset: -100;
  }
`

/**
 * Indeterminate arc circling the connector's arrow while an order rests, so the
 * card reads as ongoing work rather than a static row.
 *
 * Two animations at deliberately different periods: the sweep grows and shrinks
 * on one clock while the whole ring rotates on a slower one, so the arc
 * precesses instead of retracing the same path every cycle — a single rotation
 * would read as a fixed notch spinning.
 */
const PendingRing = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: ${ringSpin} 1.677s linear infinite;

  circle {
    fill: none;
    stroke: ${getColor('primaryAccentFour')};
    stroke-width: 1.5;
    stroke-linecap: round;
    animation: ${ringDash} 1.332s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    circle {
      animation: none;
      stroke-dasharray: 25 100;
    }
  }
`

const StepperIcon = styled.div`
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  z-index: 1;
`

const ProviderPill = styled(HStack).attrs({
  alignItems: 'center',
  gap: 6,
})`
  padding: 8px 12px;
  border-radius: 12px 0 16px 0;
  background: ${getColor('buttonSecondary')};
  border-top: 1px solid ${getColor('foregroundExtra')};
  border-left: 1px solid ${getColor('foregroundExtra')};
  position: absolute;
  right: -16px;
  bottom: -16px;
`

const ProviderIconSlot = styled.div`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StepperDivider = styled.div`
  flex: 1;
  height: 1px;
  border-top: 1px dashed ${getColor('foregroundExtra')};
`

const DestinationWalletIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  color: ${getColor('textShy')};
`
