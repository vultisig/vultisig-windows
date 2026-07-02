import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { SolanaStakeRow } from './SolanaStakeDefiView'

type SolanaDelegationCardProps = {
  row: SolanaStakeRow
  apy: number | undefined
  ticker: string
  priceUsd: number
  onUnstake: () => void
  onWithdraw: () => void
  onMove: () => void
  onStake: () => void
}

const stateLabelKey = {
  active: 'solana_staking_state_active',
  activating: 'solana_staking_state_activating',
  deactivating: 'solana_staking_state_deactivating',
  inactive: 'solana_staking_state_inactive',
} as const

const stateNoticeKey = {
  activating: 'solana_staking_activating_notice',
  deactivating: 'solana_staking_deactivating_notice',
  inactive: 'solana_staking_inactive_notice',
} as const

const stateColor = {
  active: 'success',
  activating: 'idle',
  deactivating: 'idle',
  inactive: 'shy',
} as const

/**
 * One Solana stake-account row on the DeFi tab: validator + activation-state
 * badge, delegated amount (+ fiat), APY, rent reserve, a state notice, and the
 * actions available for the account's lifecycle stage. Mirrors iOS
 * `DefiChainStakedPositionView` for Solana.
 */
export const SolanaDelegationCard = ({
  row,
  apy,
  ticker,
  priceUsd,
  onUnstake,
  onWithdraw,
  onMove,
  onStake,
}: SolanaDelegationCardProps) => {
  const { t } = useTranslation()
  const notice = row.state !== 'active' ? stateNoticeKey[row.state] : undefined

  return (
    <VStack
      gap={12}
      style={{
        padding: 16,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <HStack justifyContent="space-between" alignItems="center">
        <Text weight={500}>{row.validatorName}</Text>
        <Text size={13} color={stateColor[row.state]}>
          {t(stateLabelKey[row.state])}
        </Text>
      </HStack>

      <HStack justifyContent="space-between" alignItems="center">
        <Text
          weight={500}
        >{`${row.delegatedAmount.toFixed(6)} ${ticker}`}</Text>
        {priceUsd > 0 ? (
          <Text size={13} color="shy">
            {`$${(row.delegatedAmount * priceUsd).toFixed(2)}`}
          </Text>
        ) : null}
      </HStack>

      {apy !== undefined ? (
        <HStack justifyContent="space-between">
          <Text size={13} color="shy">
            {t('solana_staking_apy')}
          </Text>
          <Text size={13} color="success">{`${(apy * 100).toFixed(2)}%`}</Text>
        </HStack>
      ) : null}

      <HStack justifyContent="space-between">
        <Text size={13} color="shy">
          {t('solana_staking_rent_reserve')}
        </Text>
        <Text size={13} color="supporting">
          {`${row.rentReserve.toFixed(6)} ${ticker}`}
        </Text>
      </HStack>

      {notice ? (
        <Text size={12} color="shy">
          {t(notice)}
        </Text>
      ) : null}

      <HStack gap={8}>
        {row.canWithdraw ? (
          <Button onClick={onWithdraw}>{t('solana_withdraw')}</Button>
        ) : (
          <>
            <Button
              kind="secondary"
              disabled={!row.canUnstake}
              onClick={onUnstake}
            >
              {t('solana_unstake')}
            </Button>
            <Button kind="secondary" disabled={!row.canMove} onClick={onMove}>
              {t('solana_move_stake')}
            </Button>
            <Button onClick={onStake}>{t('solana_delegate')}</Button>
          </>
        )}
      </HStack>
    </VStack>
  )
}
