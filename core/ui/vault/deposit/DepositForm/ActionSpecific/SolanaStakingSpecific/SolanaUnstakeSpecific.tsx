import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { approximateCooldownDays } from '@vultisig/core-chain/chains/solana/staking/cooldownGate'
import { truncatedPubkey } from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { SolanaStakingInfoCard } from './SolanaStakingInfoCard'

/**
 * Solana deactivate (unstake) form — mirrors iOS `SolanaUnstakeTransactionScreen`.
 * The stake account is pre-selected from the DeFi tab (carried as a hidden form
 * default), so this screen is read-only: it shows which account is being
 * deactivated and the cooldown notice. The whole account deactivates; there is
 * no amount.
 */
export const SolanaUnstakeSpecific = () => {
  const { t } = useTranslation()
  const [{ control }] = useDepositFormHandlers()
  const stakeAccount = useWatch({ control, name: 'stakeAccount' }) as
    | string
    | undefined

  return (
    <SolanaStakingInfoCard
      rows={[
        {
          label: t('solana_staking_stake_account'),
          value: truncatedPubkey(stakeAccount ?? ''),
        },
      ]}
      notice={t('solana_staking_unstake_notice', {
        days: approximateCooldownDays(1),
      })}
    />
  )
}
