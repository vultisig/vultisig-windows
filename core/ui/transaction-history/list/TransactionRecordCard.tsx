import { CoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'

import { TransactionRecord, TransactionRecordStatus } from '../core'
import {
  TransactionHistoryCard,
  TransactionHistoryCardAddressDirection,
  TransactionHistoryCardStatus,
} from '../TransactionHistoryCard'
import { TransactionHistoryTagType } from '../TransactionHistoryTag'

const statusToCardStatus: Record<
  TransactionRecordStatus,
  TransactionHistoryCardStatus
> = {
  broadcasted: 'successful',
  pending: 'successful',
  confirmed: 'successful',
  failed: 'error',
}

type TransactionDisplayData = {
  tagType: TransactionHistoryTagType
  amountCrypto: string
  symbol: string
  addressDirection: TransactionHistoryCardAddressDirection
  address: string
  coin: (CoinKey & { logo: string }) | undefined
}

const getDisplayData = (record: TransactionRecord): TransactionDisplayData => {
  if (record.type === 'swap') {
    return {
      tagType: 'swap',
      amountCrypto: record.data.fromAmount,
      symbol: record.data.fromToken,
      addressDirection: 'to',
      address: record.data.toToken,
      coin: record.data.fromTokenLogo
        ? {
            chain: record.data.fromChain,
            id: record.data.fromTokenId,
            logo: record.data.fromTokenLogo,
          }
        : undefined,
    }
  }

  return {
    tagType: 'send',
    amountCrypto: record.data.amount,
    symbol: record.data.token,
    addressDirection: 'to',
    address: record.data.toAddress,
    coin: record.data.tokenLogo
      ? {
          chain: record.chain,
          id: record.data.tokenId,
          logo: record.data.tokenLogo,
        }
      : undefined,
  }
}

type TransactionRecordCardProps = {
  record: TransactionRecord
}

export const TransactionRecordCard = ({
  record,
}: TransactionRecordCardProps) => {
  const navigate = useCoreNavigate()
  const display = getDisplayData(record)

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
        amountUsd={record.fiatValue || '-'}
        amountCrypto={display.amountCrypto}
        symbol={display.symbol}
        addressDirection={display.addressDirection}
        address={display.address}
        coin={display.coin}
      />
    </div>
  )
}
