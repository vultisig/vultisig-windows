import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { SolanaValidatorAvatar } from '@core/ui/chain/solana/staking/components/SolanaValidatorAvatar'
import { Button } from '@lib/ui/buttons/Button'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SolanaStakeRow } from './SolanaStakeDefiView'

type SolanaDelegationCardProps = {
  row: SolanaStakeRow
  apy: number | undefined
  ticker: string
  priceUsd: number
  logoUrl?: string
  /** Display name of the destination of a move in flight, if there is one. */
  moveDestinationName?: string
  onUnstake: () => void
  onWithdraw: () => void
  onMove: () => void
  onFinishMove: () => void
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

const shortAddress = (address: string) =>
  address.length > 8 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address

/**
 * One Solana stake-account row on the DeFi tab: validator avatar + vote-account
 * address + activation-state badge, delegated amount (+ fiat), APY, rent
 * reserve, a state notice, and the actions available for the account's
 * lifecycle stage. Mirrors iOS `DefiChainStakedPositionView` for Solana.
 */
export const SolanaDelegationCard = ({
  row,
  apy,
  ticker,
  priceUsd,
  logoUrl,
  moveDestinationName,
  onUnstake,
  onWithdraw,
  onMove,
  onFinishMove,
  onStake,
}: SolanaDelegationCardProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const stateNotice =
    row.state !== 'active' ? t(stateNoticeKey[row.state]) : undefined
  // A move in flight explains the account's state better than the generic
  // cooldown notice does — it names where the stake is headed.
  const notice = moveDestinationName
    ? t('solana_staking_pending_move_notice', {
        validator: moveDestinationName,
      })
    : stateNotice

  return (
    <VStack
      gap={12}
      style={{
        padding: 16,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <HStack justifyContent="space-between" alignItems="center" gap={8}>
        <HStack gap={8} alignItems="center">
          <SolanaValidatorAvatar
            name={row.validatorName}
            logoUrl={logoUrl}
            size={36}
          />
          <VStack gap={2}>
            <Text weight={500}>{row.validatorName}</Text>
            <Text size={12} color="shy">
              {shortAddress(row.stakeAccount.pubkey)}
            </Text>
          </VStack>
        </HStack>
        <Text size={13} color={stateColor[row.state]}>
          {t(stateLabelKey[row.state])}
        </Text>
      </HStack>

      <HStack justifyContent="space-between" alignItems="center">
        <Text weight={500}>
          {formatAmount(row.delegatedAmount, { ticker })}
        </Text>
        {priceUsd > 0 ? (
          <Text size={13} color="shy">
            {formatFiatAmount(row.delegatedAmount * priceUsd)}
          </Text>
        ) : null}
      </HStack>

      {apy !== undefined ? (
        <HStack justifyContent="space-between" alignItems="center">
          <HStack gap={6} alignItems="center">
            <ApyIconBox>
              <PercentIcon />
            </ApyIconBox>
            <Text size={13} color="shy">
              {t('solana_staking_apy')}
            </Text>
          </HStack>
          <Text size={13} color="success">{`${(apy * 100).toFixed(2)}%`}</Text>
        </HStack>
      ) : null}

      <HStack justifyContent="space-between">
        <Text size={13} color="shy">
          {t('solana_staking_rent_reserve')}
        </Text>
        <Text size={13} color="supporting">
          {formatAmount(row.rentReserve, { ticker })}
        </Text>
      </HStack>

      {notice ? (
        <Text size={12} color="shy">
          {notice}
        </Text>
      ) : null}

      <HStack gap={8}>
        {/*
         * A cooled-down account can be re-delegated as well as withdrawn.
         * Finishing an in-flight move is what the user already committed to, so
         * it leads; with no move in flight, withdrawing does.
         */}
        {row.canFinishMove && row.moveDestination ? (
          <>
            <Button kind="secondary" onClick={onWithdraw}>
              {t('solana_withdraw')}
            </Button>
            <Button onClick={onFinishMove}>{t('solana_finish_move')}</Button>
          </>
        ) : row.canFinishMove ? (
          <>
            <Button kind="secondary" onClick={onFinishMove}>
              {t('solana_finish_move')}
            </Button>
            <Button onClick={onWithdraw}>{t('solana_withdraw')}</Button>
          </>
        ) : row.canWithdraw ? (
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

const ApyIconBox = styled.span`
  display: inline-flex;
  align-items: center;
  color: ${getColor('textShy')};
`
