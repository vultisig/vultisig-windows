import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  areEqualCoins,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

import { TransactionRecord, TransactionRecordStatus } from '../core'
import {
  TransactionHistoryCard,
  TransactionHistoryCardPill,
  TransactionHistoryCardStatus,
} from '../TransactionHistoryCard'
import { TransactionHistoryTagType } from '../TransactionHistoryTag'

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
  cryptoAmount: number
  symbol: string
  pill: TransactionHistoryCardPill
  coin: (CoinKey & { logo: string }) | undefined
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
    const rawAmount = Number(
      fromChainAmount(BigInt(record.data.fromAmount), record.data.fromDecimals)
    )

    const pill: TransactionHistoryCardPill = record.data.provider
      ? getProviderPill({
          provider: record.data.provider,
          fromChain: record.data.fromChain,
        })
      : { direction: 'to', address: record.data.toToken }

    return {
      tagType: 'swap',
      amountCrypto: formatCryptoAmount(rawAmount),
      cryptoAmount: rawAmount,
      symbol: record.data.fromToken,
      pill,
      coin: record.data.fromTokenLogo
        ? {
            chain: record.data.fromChain,
            id: record.data.fromTokenId,
            logo: record.data.fromTokenLogo,
          }
        : undefined,
    }
  }

  const rawAmount = Number(
    fromChainAmount(BigInt(record.data.amount), record.data.decimals)
  )

  return {
    tagType: 'send',
    amountCrypto: formatCryptoAmount(rawAmount),
    cryptoAmount: rawAmount,
    symbol: record.data.token,
    pill: { direction: 'to', address: record.data.toAddress },
    coin: record.data.tokenLogo
      ? {
          chain: record.chain,
          id: record.data.tokenId,
          logo: record.data.tokenLogo,
        }
      : undefined,
  }
}

const getCoinKey = (record: TransactionRecord): CoinKey => {
  if (record.type === 'swap') {
    return { chain: record.data.fromChain, id: record.data.fromTokenId }
  }
  return { chain: record.chain, id: record.data.tokenId }
}

type TransactionRecordCardProps = {
  record: TransactionRecord
}

const useFiatDisplay = (record: TransactionRecord, cryptoAmount: number) => {
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
  const navigate = useCoreNavigate()
  const display = getDisplayData(record)
  const amountUsd = useFiatDisplay(record, display.cryptoAmount)

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
        status={statusToCardStatus[record.status]}
        amountUsd={amountUsd}
        amountCrypto={display.amountCrypto}
        symbol={display.symbol}
        pill={display.pill}
        coin={display.coin}
      />
    </div>
  )
}
