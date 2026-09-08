import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { getLimitOrderBuyCoin } from '@core/ui/mpc/keysign/join/tx/limitOrderBuyCoin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { getTronClaimChainAmountDisplay } from '@core/ui/vault/deposit/tron/withdrawExpireUnfreeze'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { fromThorchainFixedPoint } from '@core/ui/vault/swap/limit/amount'
import { useLimitOrderStatusLabels } from '@core/ui/vault/swap/limit/tracking/presentation'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  areEqualCoins,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'

import {
  LimitOrderTrackedStatus,
  TransactionRecord,
  TransactionRecordStatus,
} from '../core'
import { getTransactionTagLabel } from '../cosmosMessageLabel'
import { getRecordFailureReason, swapFailureCopy } from '../swapFailureCopy'
import {
  TransactionHistoryCard,
  TransactionHistoryCardPill,
  TransactionHistoryCardStatus,
} from '../TransactionHistoryCard'
import { TransactionHistoryTagType } from '../TransactionHistoryTag'

/**
 * Card state per ORDER state. `resting` is pending, not successful: an open
 * order has not done anything yet. Non-fill closures read as neutral rather
 * than green — the funds came back, which is not a failure but is not a fill.
 */
const limitOrderCardStatus: Record<
  LimitOrderTrackedStatus,
  TransactionHistoryCardStatus
> = {
  pending: 'pending',
  resting: 'pending',
  filled: 'successful',
  refunded: 'pending',
  expired: 'pending',
  cancelled: 'pending',
  rejected: 'error',
}

const statusToCardStatus: Record<
  TransactionRecordStatus,
  TransactionHistoryCardStatus
> = {
  broadcasted: 'pending',
  pending: 'pending',
  confirmed: 'successful',
  failed: 'error',
}

type TransactionDisplayData = {
  tagType: TransactionHistoryTagType
  amountCrypto: string
  /** The amount the fiat line prices, denominated in `getCoinKey`'s coin. */
  cryptoAmount: number
  symbol: string
  /**
   * The line under the amount, when the row prints one of its own instead of
   * a fiat value. A swap prints the leg it gave up here.
   */
  subAmount?: string
  pill: TransactionHistoryCardPill
  coin: (CoinKey & { logo: string }) | undefined
  /** Cosmos message typeUrl driving the tag label, when present. */
  messageTypeUrl?: string
}

const formatCryptoAmount = (amount: number): string =>
  formatAmount(amount, { precision: 'high' })

const chainValues = Object.values(Chain)

type GetProviderPillInput = {
  provider: string
  fromChain: Chain
}

const getProviderPill = ({
  provider,
  fromChain,
}: GetProviderPillInput): TransactionHistoryCardPill => {
  const logoChain = isOneOf(provider, chainValues) ? provider : fromChain

  return {
    providerName: provider,
    pillIcon: (
      <ChainEntityIcon
        value={getChainLogoSrc(logoChain)}
        style={{ fontSize: 16 }}
      />
    ),
  }
}

const getDisplayData = (record: TransactionRecord): TransactionDisplayData => {
  if (record.type === 'swap') {
    const { data } = record
    const soldAmount = Number(
      fromChainAmount(BigInt(data.fromAmount), data.fromDecimals)
    )
    // Already a decimal string in the buy asset's own units, unlike the sell
    // side, which the payload carries in the sell coin's smallest units.
    const boughtAmount = Number(data.toAmount)

    return {
      tagType: 'swap',
      amountCrypto: `+${formatCryptoAmount(boughtAmount)}`,
      cryptoAmount: soldAmount,
      symbol: data.toToken,
      subAmount: `-${formatCryptoAmount(soldAmount)} ${data.fromToken}`,
      pill: { fromTicker: data.fromToken, toTicker: data.toToken },
      coin: data.toTokenLogo
        ? {
            chain: data.toChain,
            id: data.toTokenId,
            logo: data.toTokenLogo,
          }
        : undefined,
    }
  }

  if (record.type === 'limitSwap') {
    const { data } = record
    const soldAmount = Number(
      fromChainAmount(BigInt(data.fromAmount), data.fromDecimals)
    )
    const sellCoin = data.fromTokenLogo
      ? {
          chain: data.fromChain,
          id: data.fromTokenId,
          logo: data.fromTokenLogo,
        }
      : undefined
    // The pill names both assets whatever the order did — an open order still
    // says which pair it is for.
    const pill: TransactionHistoryCardPill = {
      fromTicker: data.fromToken,
      toTicker: data.buyTicker,
    }

    // Only the queue's own payout accounting counts as received. An order that
    // has not filled keeps printing what it put up, because `minimumReceived`
    // is a floor it may never reach, and printing it as the buy leg would read
    // as a payout that has already happened.
    const filledAmount =
      data.amountOut && data.amountOut !== '0'
        ? fromThorchainFixedPoint(data.amountOut)
        : undefined

    if (filledAmount === undefined) {
      return {
        tagType: 'swap',
        amountCrypto: formatCryptoAmount(soldAmount),
        cryptoAmount: soldAmount,
        symbol: data.fromToken,
        pill,
        coin: sellCoin,
      }
    }

    const buyCoin = getLimitOrderBuyCoin({ targetAsset: data.targetAsset })

    return {
      tagType: 'swap',
      amountCrypto: `+${formatCryptoAmount(filledAmount)}`,
      cryptoAmount: soldAmount,
      symbol: data.buyTicker,
      subAmount: `-${formatCryptoAmount(soldAmount)} ${data.fromToken}`,
      pill,
      coin: buyCoin?.logo
        ? { chain: buyCoin.chain, id: buyCoin.id, logo: buyCoin.logo }
        : sellCoin,
    }
  }

  if (record.type === 'trustLine') {
    // No amount: a TrustSet moves nothing. The limit is a ceiling, and showing
    // it here would read as an outgoing payment of that size.
    return {
      tagType: 'approve',
      amountCrypto: '',
      cryptoAmount: 0,
      symbol: record.data.token,
      pill: { direction: 'to', address: record.data.issuer },
      coin: record.data.tokenLogo
        ? {
            chain: record.chain,
            id: record.data.tokenId,
            logo: record.data.tokenLogo,
          }
        : undefined,
    }
  }

  const isTronClaim = record.data.operation === 'tronWithdrawExpireUnfreeze'
  const rawAmount = Number(
    fromChainAmount(BigInt(record.data.amount), record.data.decimals)
  )

  return {
    tagType: isTronClaim ? 'receive' : 'send',
    amountCrypto: isTronClaim
      ? getTronClaimChainAmountDisplay({
          amount: record.data.amount,
          decimals: record.data.decimals,
        })
      : formatCryptoAmount(rawAmount),
    cryptoAmount: rawAmount,
    symbol: record.data.token,
    pill: isTronClaim
      ? getProviderPill({ provider: Chain.Tron, fromChain: record.chain })
      : { direction: 'to', address: record.data.toAddress },
    coin: record.data.tokenLogo
      ? {
          chain: record.chain,
          id: record.data.tokenId,
          logo: record.data.tokenLogo,
        }
      : undefined,
    messageTypeUrl: record.data.messageTypeUrl,
  }
}

const getCoinKey = (record: TransactionRecord): CoinKey => {
  if (record.type === 'swap' || record.type === 'limitSwap') {
    return { chain: record.data.fromChain, id: record.data.fromTokenId }
  }
  return { chain: record.chain, id: record.data.tokenId }
}

type TransactionRecordCardProps = {
  record: TransactionRecord
}

const useFiatDisplay = (
  record: TransactionRecord,
  cryptoAmount: number
): string | undefined => {
  const formatFiatAmount = useFormatFiatAmount()
  const coinKey = getCoinKey(record)
  const vaultCoins = useCurrentVaultCoins()
  const vaultCoin = vaultCoins.find(c => areEqualCoins(c, coinKey))

  const priceQuery = useCoinPricesQuery({
    coins: [
      {
        ...coinKey,
        priceProviderId: vaultCoin?.priceProviderId,
      },
    ],
    eager: false,
  })

  // A TrustSet moves no value, so there is nothing to price. Formatting its
  // zero amount would print "$0.00" and read as a transfer that was worth
  // nothing rather than one that never happened.
  if (record.type === 'trustLine') {
    return undefined
  }

  if (record.fiatValue) {
    const parsed = Number(record.fiatValue)
    if (!Number.isNaN(parsed)) {
      return formatFiatAmount(parsed)
    }
    return record.fiatValue
  }

  if (priceQuery.data != null) {
    const price = priceQuery.data[coinKeyToString(coinKey)]
    if (price) {
      return formatFiatAmount(price * cryptoAmount)
    }
  }

  return '-'
}

export const TransactionRecordCard = ({
  record,
}: TransactionRecordCardProps) => {
  const { t } = useTranslation()
  const limitStatusLabel = useLimitOrderStatusLabels()
  const navigate = useCoreNavigate()
  const display = getDisplayData(record)
  const isTronClaim =
    record.type === 'send' &&
    record.data.operation === 'tronWithdrawExpireUnfreeze'
  const fiatAmount = useFiatDisplay(record, display.cryptoAmount)
  // `send` and `swap` defer to the Cosmos message label, which turns an
  // otherwise-generic send into "Delegate"/"Vote" when the payload says so.
  const tagLabel = match(record.type, {
    limitSwap: () => t('swap_mode_limit'),
    trustLine: () => t('trust_line'),
    send: () =>
      isTronClaim
        ? t('withdraw_expire_unfreeze')
        : getTransactionTagLabel({ messageTypeUrl: display.messageTypeUrl, t }),
    swap: () =>
      getTransactionTagLabel({ messageTypeUrl: display.messageTypeUrl, t }),
  })

  // A limit order's card state is the ORDER's, not the deposit's: the deposit
  // confirms in seconds while the order rests for hours, so chain status says
  // nothing about what the order did.
  const cardStatus =
    record.type === 'limitSwap'
      ? limitOrderCardStatus[record.data.orderStatus]
      : statusToCardStatus[record.status]

  const statusLabelOverride =
    record.type === 'limitSwap'
      ? limitStatusLabel[record.data.orderStatus]
      : undefined

  const failureReason = getRecordFailureReason(record)

  const handleClick = () =>
    navigate({ id: 'transactionDetail', state: { id: record.id } })

  return (
    <div
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <TransactionHistoryCard
        tagType={display.tagType}
        tagLabel={tagLabel}
        status={cardStatus}
        statusLabel={statusLabelOverride}
        subAmount={display.subAmount ?? fiatAmount}
        amountCrypto={display.amountCrypto}
        symbol={display.symbol}
        pill={display.pill}
        errorMessage={
          failureReason ? t(swapFailureCopy[failureReason].label) : undefined
        }
        coin={display.coin}
      />
    </div>
  )
}
