import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { approximateCooldownDays } from '@vultisig/core-chain/chains/solana/staking/cooldownGate'
import { truncatedPubkey } from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { SolanaStakingInfoCard } from './SolanaStakingInfoCard'

/**
 * Solana move-stake (step 1: deactivate) form — mirrors iOS
 * `SolanaMoveStakeTransactionScreen`. Solana has no native redelegate, so
 * moving A → B is a guided, cross-epoch flow: this step deactivates the chosen
 * stake account (starting the ~1-epoch cooldown); once it is fully inactive the
 * DeFi tab surfaces "Finish Move" to re-delegate it to the new validator. The
 * whole account moves (no partial split — wallet-core exposes no Split
 * instruction), so this screen is read-only: source account + the multi-step
 * notice.
 */
export const SolanaMoveStakeSpecific = () => {
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
      notice={t('solana_staking_move_notice', {
        days: approximateCooldownDays(1),
      })}
    />
  )
}
