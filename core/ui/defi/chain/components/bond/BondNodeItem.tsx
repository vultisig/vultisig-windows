import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Coin } from '@core/chain/coin/Coin'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import {
  formatDateShort,
  formatStatusLabel,
} from '@core/ui/defi/shared/formatters'
import { Button } from '@lib/ui/buttons/Button'
import { CalendarIcon } from '@lib/ui/icons/CalendarIcon'
import { LinkIcon } from '@lib/ui/icons/LinkIcon'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
  actionsDisabledReason?: string
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

const ButtonRow = styled(HStack)`
  gap: 12px;
  flex-wrap: wrap;
`

export const BondNodeItem = ({
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
  actionsDisabledReason,
}: Props) => {
  const { t, i18n } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const normalizedStatus = status.toLowerCase()
  const isActive = normalizedStatus === 'active'
  const statusColor = isActive ? 'success' : 'idle'

  const truncatedAddress = formatWalletAddress(nodeAddress)
  const unbondDisabled = !canUnbond || Boolean(isBondingDisabled)
  const bondDisabled = Boolean(isBondingDisabled)

  const renderAction = (
    action: ReactNode,
    wrapperStyle?: CSSProperties
  ): ReactNode =>
    actionsDisabledReason ? (
      <Tooltip
        content={actionsDisabledReason}
        renderOpener={({ ref, ...props }) => (
          <div
            ref={ref as any}
            {...props}
            style={{
              display: 'flex',
              ...(wrapperStyle ?? {}),
            }}
          >
            {action}
          </div>
        )}
      />
    ) : (
      action
    )

  return (
    <VStack gap={12}>
      {/* Node Address Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={4} alignItems="center">
          <Text size={13} color="shy">
            {t('node_address')}:
          </Text>
          <Text size={13} weight="500" color="contrast">
            {truncatedAddress}
          </Text>
        </HStack>
        <Text size={13} weight="600" color={statusColor}>
          {formatStatusLabel(status) ?? t('unknown')}
        </Text>
      </HStack>

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
          {apy === 0
            ? t('percentage_zero')
            : t('percentage_value', { value: (apy * 100).toFixed(2) })}
        </Text>
      </HStack>

      <Divider />

      {/* Next Churn and Next Award Row */}
      <HStack gap={48}>
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
      <ButtonRow>
        {renderAction(
          <Button
            kind="secondary"
            onClick={onUnbond}
            disabled={unbondDisabled}
            icon={<RefreshCwIcon />}
            style={{ flex: 1 }}
          >
            {t('unbond')}
          </Button>,
          { flex: 1 }
        )}
        {renderAction(
          <Button
            kind="primary"
            onClick={onBond}
            icon={<LinkIcon />}
            style={{ flex: 1 }}
            disabled={bondDisabled}
          >
            {t('bond')}
          </Button>,
          { flex: 1 }
        )}
      </ButtonRow>

      {actionsDisabledReason ? (
        <Text size={12} color="warning">
          {actionsDisabledReason}
        </Text>
      ) : null}

      {/* Wait message for active nodes */}
      {!canUnbond && (
        <Text size={12} color="shy">
          {t('wait_until_node_churned')}
        </Text>
      )}
    </VStack>
  )
}
