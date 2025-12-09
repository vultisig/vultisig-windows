import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Coin } from '@core/chain/coin/Coin'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

import {
  BondButtonRow,
  BondCard,
  BondSectionHeader,
  BondStatusPill,
  BondValueRow,
} from './CardPrimitives'

const formatStatus = (status?: string) => {
  if (!status) return 'unknown'
  return status
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const formatDateShort = (date?: Date) => {
  if (!date) return 'Pending'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}

type Props = {
  coin: Coin
  nodeAddress: string
  amount: bigint
  apy: number
  nextReward: number
  nextChurn?: Date
  status: string
  onBond: () => void
  onUnbond: () => void
  canUnbond: boolean
  fiatValue: number
  isBondingDisabled?: boolean
}

export const BondNodeCard = ({
  coin,
  nodeAddress,
  amount,
  apy,
  nextReward,
  nextChurn,
  status,
  onBond,
  onUnbond,
  canUnbond,
  fiatValue,
  isBondingDisabled,
}: Props) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const statusTone: 'success' | 'warning' | 'neutral' =
    status === 'active' ? 'success' : status === 'ready' ? 'warning' : 'neutral'

  return (
    <BondCard>
      <VStack gap={12}>
        <BondSectionHeader>
          <VStack gap={2}>
            <Text size={13} color="shy">
              {t('node_address')}
            </Text>
            <Text size={15} weight="600" color="contrast">
              {nodeAddress}
            </Text>
          </VStack>
          <BondStatusPill tone={statusTone}>
            {formatStatus(status)}
          </BondStatusPill>
        </BondSectionHeader>

        <BondValueRow>
          <Text size={12} color="shy">
            {t('bonded' as any)}
          </Text>
          <Text size={22} weight="700" color="contrast">
            {formatAmount(fromChainAmount(amount, coin.decimals), {
              precision: 'high',
              ticker: coin.ticker,
            })}
          </Text>
          <Text size={13} color="shy">
            {formatFiatAmount(fiatValue)}
          </Text>
        </BondValueRow>

        <HStack gap={16} style={{ flexWrap: 'wrap' }}>
          <BondValueRow>
            <Text size={12} color="shy">
              {t('apy' as any)}
            </Text>
            <Text size={14} weight="600" color="success">
              {(apy * 100).toFixed(2)}%
            </Text>
          </BondValueRow>
          <BondValueRow>
            <Text size={12} color="shy">
              {t('next_churn') ?? 'Next churn'}
            </Text>
            <Text size={14} weight="600" color="contrast">
              {formatDateShort(nextChurn)}
            </Text>
          </BondValueRow>
          <BondValueRow>
            <Text size={12} color="shy">
              {t('next_award') ?? 'Next award'}
            </Text>
            <Text size={14} weight="600" color="contrast">
              {formatAmount(nextReward, { ticker: coin.ticker })}
            </Text>
          </BondValueRow>
        </HStack>

        <BondButtonRow>
          <Button
            kind="secondary"
            onClick={onUnbond}
            disabled={!canUnbond}
            style={{ flex: 1 }}
          >
            {t('unbond')}
          </Button>
          <Button
            kind="primary"
            onClick={onBond}
            style={{ flex: 1 }}
            disabled={isBondingDisabled}
          >
            {t('bond')}
          </Button>
        </BondButtonRow>
        {!canUnbond && (
          <Text size={12} color="shy">
            {t('wait_until_node_churned')}
          </Text>
        )}
      </VStack>
    </BondCard>
  )
}
