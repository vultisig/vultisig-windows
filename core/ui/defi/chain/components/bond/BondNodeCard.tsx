import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Coin } from '@core/chain/coin/Coin'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { Button } from '@lib/ui/buttons/Button'
import { CalendarIcon } from '@lib/ui/icons/CalendarIcon'
import { LinkIcon } from '@lib/ui/icons/LinkIcon'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  BondButtonRow,
  BondCard,
  BondSectionHeader,
  BondStatusPill,
} from './CardPrimitives'

const formatStatus = (status?: string) => {
  if (!status) return null
  return status
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const formatDateShort = (date?: Date, locale?: string) => {
  if (!date) return null
  return date.toLocaleDateString(locale, {
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

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${getColor('foregroundExtra')};
`

const InfoRow = styled(HStack)`
  align-items: center;
  gap: 8px;
`

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('textShy')};
  font-size: 16px;
`

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
  const { t, i18n } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const normalizedStatus = status.toLowerCase()
  const statusTone: 'success' | 'warning' | 'neutral' =
    normalizedStatus === 'active'
      ? 'success'
      : normalizedStatus === 'ready'
      ? 'warning'
      : 'neutral'
  const nodeAllowsUnbond =
    normalizedStatus === 'standby' ||
    normalizedStatus === 'disabled' ||
    normalizedStatus === 'whitelisted'
  const unbondDisabled = !canUnbond || !nodeAllowsUnbond

  const truncatedAddress = `${nodeAddress.slice(0, 7)}....${nodeAddress.slice(-5)}`

  return (
    <BondCard>
      <VStack gap={12}>
        {/* Node Address Header */}
        <BondSectionHeader>
          <HStack gap={4} alignItems="center">
            <Text size={13} color="shy">
              {t('node_address')}:
            </Text>
            <Text size={13} weight="500" color="contrast">
              {truncatedAddress}
            </Text>
          </HStack>
          <BondStatusPill tone={statusTone}>
            {formatStatus(status) ?? t('unknown')}
          </BondStatusPill>
        </BondSectionHeader>

        {/* Bonded Amount Row */}
        <HStack justifyContent="space-between" alignItems="center">
          <Text size={18} weight="700" color="contrast">
            {t('bonded')}:{' '}
            {formatAmount(fromChainAmount(amount, coin.decimals), {
              precision: 'high',
              ticker: coin.ticker,
            })}
          </Text>
          <Text size={14} color="shy">
            {formatFiatAmount(fiatValue)}
          </Text>
        </HStack>

        {/* APY Row */}
        <HStack justifyContent="space-between" alignItems="center">
          <InfoRow>
            <InfoIcon>
              <PercentIcon />
            </InfoIcon>
            <Text size={13} color="shy">
              {t('apy')}
            </Text>
          </InfoRow>
          <Text size={14} weight="600" color={apy > 0 ? 'success' : 'shy'}>
            {(apy * 100).toFixed(2)}%
          </Text>
        </HStack>

        <Divider />

        {/* Next Churn and Next Award Row */}
        <HStack gap={32}>
          <VStack gap={4}>
            <InfoRow>
              <InfoIcon>
                <CalendarIcon />
              </InfoIcon>
              <Text size={13} color="shy">
                {t('next_churn')}
              </Text>
            </InfoRow>
            <Text size={14} weight="600" color="contrast">
              {formatDateShort(nextChurn, i18n.language) ?? t('pending')}
            </Text>
          </VStack>
          <VStack gap={4}>
            <InfoRow>
              <InfoIcon>
                <CalendarIcon />
              </InfoIcon>
              <Text size={13} color="shy">
                {t('next_award')}
              </Text>
            </InfoRow>
            <Text size={14} weight="600" color="contrast">
              {formatAmount(nextReward, { ticker: coin.ticker })}
            </Text>
          </VStack>
        </HStack>

        {/* Action Buttons */}
        <BondButtonRow>
          <Button
            kind="secondary"
            onClick={onUnbond}
            disabled={unbondDisabled}
            icon={<RefreshCwIcon />}
            style={{ flex: 1 }}
          >
            {t('unbond')}
          </Button>
          <Button
            kind="primary"
            onClick={onBond}
            icon={<LinkIcon />}
            style={{ flex: 1 }}
            disabled={isBondingDisabled}
          >
            {t('bond')}
          </Button>
        </BondButtonRow>
        {unbondDisabled && (
          <Text size={12} color="shy">
            {t('wait_until_node_churned')}
          </Text>
        )}
      </VStack>
    </BondCard>
  )
}
