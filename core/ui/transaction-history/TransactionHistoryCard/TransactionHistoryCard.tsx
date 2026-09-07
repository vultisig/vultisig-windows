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
  AmountBlock,
  AmountTextStack,
  Card,
  DetailsRow,
  IconSlot,
  InlinePill,
  ProviderPill,
  StatusLabel,
  StatusStack,
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

/** Content displayed in the pill area of the card. */
export type TransactionHistoryCardPill =
  | {
      /** Prefix label like "to" or "from". */
      direction: TransactionHistoryCardAddressDirection
      /** Full address; displayed truncated via truncateId. */
      address: string
    }
  | {
      /** Provider name displayed in the pill, e.g. "THORChain". */
      providerName: string
      /** Optional icon shown before the label. */
      pillIcon?: ReactNode
    }
  | {
      /** Ticker sold, e.g. "USDC". */
      fromTicker: string
      /** Ticker bought, e.g. "SOL". */
      toTicker: string
    }

export type TransactionHistoryCardProps = {
  /** Transaction type shown in the tag (send, receive, swap, approve). */
  tagType: TransactionHistoryTagType
  /** Optional pre-resolved tag label override (e.g. "Delegate" for staking). */
  tagLabel?: string
  /** Card state: successful (green), pending (neutral), or error (red). */
  status: TransactionHistoryCardStatus
  /**
   * Pre-resolved status text, replacing the default `status`-derived label
   * (the colour still follows `status`). Lets a limit order read its own
   * lifecycle — "Open", "Expired" — instead of the generic tx wording.
   */
  statusLabel?: string
  /**
   * The line under the amount: a transfer prints its fiat value ("$1,000.54"),
   * a swap prints the leg it gave up ("-220.192 USDC"). Omit for records that
   * move no value — the line is dropped entirely rather than rendered blank.
   */
  subAmount?: string
  /** Crypto amount without symbol, e.g. "1,000.12". May carry a leading sign. */
  amountCrypto: string
  /** Symbol, e.g. "RUNE", "SOL", "ETH". */
  symbol: string
  /** Content for the info pill. */
  pill: TransactionHistoryCardPill
  /** Optional failure reason, shown under the status label when status is "error". */
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
  tagLabel,
  status,
  statusLabel,
  subAmount,
  amountCrypto,
  symbol,
  pill,
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
  const resolvedStatusLabel = statusLabel ?? statusLabelKey[status]
  const assetIcon =
    coin != null ? <CoinIcon coin={coin} style={{ fontSize: 24 }} /> : icon

  return (
    <Card>
      <TopRow>
        <TransactionHistoryTag type={tagType} label={tagLabel} />
        <StatusStack>
          <StatusLabel $status={status}>{resolvedStatusLabel}</StatusLabel>
          {status === 'error' && errorMessage ? (
            <Text variant="caption" color="danger">
              {errorMessage}
            </Text>
          ) : null}
        </StatusStack>
      </TopRow>

      <DetailsRow>
        <AmountBlock>
          {assetIcon != null && <IconSlot>{assetIcon}</IconSlot>}
          <AmountTextStack>
            <Text variant="footnote" color="regular">
              {amountCrypto}{' '}
              <Text as="span" variant="footnote" color="shy">
                {symbol}
              </Text>
            </Text>
            {subAmount ? (
              <Text variant="footnote" color="shy">
                {subAmount}
              </Text>
            ) : null}
          </AmountTextStack>
        </AmountBlock>
        {'direction' in pill && (
          <InlinePill>
            <Text variant="caption" color="shy">
              {`${t(pill.direction)} `}
            </Text>
            <Text variant="caption" color="regular">
              {truncateId(pill.address)}
            </Text>
          </InlinePill>
        )}
        {'fromTicker' in pill && (
          <InlinePill>
            <Text variant="caption" color="regular">
              {`${pill.fromTicker} → ${pill.toTicker}`}
            </Text>
          </InlinePill>
        )}
      </DetailsRow>

      {'providerName' in pill && (
        <ProviderPill>
          {pill.pillIcon != null && <IconSlot>{pill.pillIcon}</IconSlot>}
          <Text variant="caption" color="shy">
            {t('via')}
          </Text>
          <Text variant="caption" color="regular" weight={600}>
            {pill.providerName}
          </Text>
        </ProviderPill>
      )}
    </Card>
  )
}
