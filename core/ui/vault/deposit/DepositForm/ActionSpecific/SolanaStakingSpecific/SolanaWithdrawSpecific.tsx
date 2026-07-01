import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { truncatedPubkey } from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { SolanaStakingInfoCard } from './SolanaStakingInfoCard'

/**
 * Solana withdraw form — mirrors iOS `SolanaWithdrawTransactionScreen`. Reached
 * only once the stake account is fully inactive (the DeFi card gates the
 * `Withdraw` action on the cooldown), so this screen is read-only: it shows the
 * account and the withdrawable amount (account lamports − rent reserve),
 * carried as hidden form defaults from the DeFi tab.
 */
export const SolanaWithdrawSpecific = () => {
  const { t } = useTranslation()
  const [{ control }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const stakeAccount = useWatch({ control, name: 'stakeAccount' }) as
    | string
    | undefined
  const amount = useWatch({ control, name: 'amount' }) as
    | string
    | number
    | undefined

  return (
    <SolanaStakingInfoCard
      rows={[
        {
          label: t('solana_staking_stake_account'),
          value: truncatedPubkey(stakeAccount ?? ''),
        },
        {
          label: t('solana_staking_withdrawable_amount'),
          value: `${amount ?? 0} ${coin.ticker}`,
        },
      ]}
      notice={t('solana_staking_withdraw_ready_notice')}
    />
  )
}
