import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import {
  formatDateShort,
  formatStatusLabel,
} from '@core/ui/defi/shared/formatters'
import { CalendarBlankIcon } from '@lib/ui/icons/CalendarBlankIcon'
import { ChainLinkIcon3 } from '@lib/ui/icons/ChainLinkIcon3'
import { LinkTwoOffIcon } from '@lib/ui/icons/LinkTwoOffIcon'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BondChurn } from '../../queries/bondRewards/churns'
import { BondChain } from '../../queries/bondRewards/config'
import { BondActionButton } from './BondActionButton'
import { BondInfoLabel } from './BondInfoLabel'
import { BondRewardsRow } from './rewards/BondRewardsRow'

type Props = {
  chain: BondChain
  coin: Coin
  nodeAddress: string
  amount: bigint
  apy: number
  nextReward: number
  recentChurns: BondChurn[]
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

const ButtonRow = styled(HStack)`
  gap: 8px;
  flex-wrap: wrap;
`

/**
 * One bonded node on the Bonded tab: the vault's bond, APY and next churn,
 * its Next and Last Reward, and the Bond / Unbond actions.
 */
export const BondNodeItem = ({
  chain,
  coin,
  nodeAddress,
  amount,
  apy,
  nextReward,
  recentChurns,
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
    <VStack gap={14}>
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
        <BondInfoLabel icon={<PercentIcon />}>{t('apy')}</BondInfoLabel>
        <Text size={14} weight="600" color={apy > 0 ? 'success' : 'shy'}>
          {apy === 0
            ? t('percentage_zero')
            : t('percentage_value', { value: (apy * 100).toFixed(2) })}
        </Text>
      </HStack>

      {/* Next Churn Row */}
      <HStack justifyContent="space-between" alignItems="center">
        <BondInfoLabel icon={<CalendarBlankIcon />}>
          {t('next_churn')}
        </BondInfoLabel>
        <Text size={14} weight="600" color="shyExtra">
          {formatDateShort(nextChurn, i18n.language) ?? t('pending')}
        </Text>
      </HStack>

      <Divider />

      <BondRewardsRow
        chain={chain}
        coin={coin}
        nodeAddress={nodeAddress}
        nextReward={nextReward}
        recentChurns={recentChurns}
      />

      {/* Action Buttons */}
      <ButtonRow>
        {renderAction(
          <BondActionButton
            kind="secondary"
            onClick={onUnbond}
            disabled={unbondDisabled}
            style={{ flex: 1 }}
            icon={<LinkTwoOffIcon />}
          >
            {t('unbond')}
          </BondActionButton>,
          { flex: 1 }
        )}
        {renderAction(
          <BondActionButton
            kind="primary"
            onClick={onBond}
            disabled={bondDisabled}
            style={{ flex: 1 }}
            icon={<ChainLinkIcon3 />}
          >
            {t('bond')}
          </BondActionButton>,
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
