import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { Text } from '@lib/ui/text'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { truncateId } from '@vultisig/lib-utils/string/truncate'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  TransactionHistoryTag,
  type TransactionHistoryTagType,
} from '../TransactionHistoryTag'
import {
  AddressPill,
  AmountBlock,
  AmountTextStack,
  Card,
  DetailsRow,
  ErrorMessageRow,
  IconSlot,
  StatusLabel,
  TopRow,
} from './styles'

export const transactionHistoryCardStatuses = [
  'successful',
  'pending',
  'error',
] as const
export type TransactionHistoryCardStatus =
  (typeof transactionHistoryCardStatuses)[number]

/** Direction for address: "to" (send) or "from" (receive/swap). */
export type TransactionHistoryCardAddressDirection = 'to' | 'from'

export type TransactionHistoryCardProps = {
  /** Transaction type shown in the tag (send, receive, swap, approve). */
  tagType: TransactionHistoryTagType
  /** Card state: successful (green), pending (neutral), or error (red). */
  status: TransactionHistoryCardStatus
  /** USD amount, e.g. "$1,000.54". */
  amountUsd: string
  /** Crypto amount without symbol, e.g. "1,000.12". */
  amountCrypto: string
  /** Symbol, e.g. "RUNE", "SOL", "ETH". */
  symbol: string
  /** Address direction: "to" (send) or "from" (receive/swap). */
  addressDirection: TransactionHistoryCardAddressDirection
  /** Full address; displayed truncated (6 chars + "..." + 4 chars) via truncateId. */
  address: string
  /** Optional error message shown below details when status is "error" (aligned right). */
  errorMessage?: string
  /**
   * Optional coin for the 24px asset icon (same approach as CoinIcon in codebase).
   * When provided, icon is ignored.
   */
  coin?: CoinKey & { logo: string }
  /** Optional 24px icon when coin is not provided (e.g. custom ReactNode). */
  icon?: ReactNode
}

export const TransactionHistoryCard = ({
  tagType,
  status,
  amountUsd,
  amountCrypto,
  symbol,
  addressDirection,
  address,
  errorMessage,
  coin,
  icon,
}: TransactionHistoryCardProps) => {
  const { t } = useTranslation()

  const statusLabelKey: Record<TransactionHistoryCardStatus, string> = {
    successful: t('confirmed'),
    pending: t('pending'),
    error: t('failed'),
  }
  const statusLabel = statusLabelKey[status]
  const prefix = `${t(addressDirection)} `
  const truncatedAddress = truncateId(address)
  const assetIcon =
    coin != null ? <CoinIcon coin={coin} style={{ fontSize: 24 }} /> : icon

  return (
    <Card>
      <TopRow>
        <TransactionHistoryTag type={tagType} />
        <StatusLabel $status={status}>{statusLabel}</StatusLabel>
      </TopRow>

      <DetailsRow>
        <AmountBlock>
          {assetIcon != null && <IconSlot>{assetIcon}</IconSlot>}
          <AmountTextStack>
            <Text variant="footnote" color="regular">
              {amountUsd}
            </Text>
            <Text variant="footnote" color="regular">
              {amountCrypto}{' '}
              <Text as="span" variant="footnote" color="shy">
                {symbol}
              </Text>
            </Text>
          </AmountTextStack>
        </AmountBlock>
        <AddressPill>
          <Text variant="caption" color="shy">
            {prefix}
          </Text>
          <Text variant="caption" color="regular">
            {truncatedAddress}
          </Text>
        </AddressPill>
      </DetailsRow>

      {status === 'error' && errorMessage != null && errorMessage !== '' && (
        <ErrorMessageRow>
          <Text variant="caption" color="danger">
            {errorMessage}
          </Text>
        </ErrorMessageRow>
      )}
    </Card>
  )
}
