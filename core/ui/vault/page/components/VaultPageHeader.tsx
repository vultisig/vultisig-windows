import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { ReactNode, RefObject } from 'react'
import { useTranslation } from 'react-i18next'

import { VaultPageHeaderControls } from './VaultPageHeaderControls'
import { VaultPageHeaderShell } from './VaultPageHeaderShell'

type VaultPageHeaderProps = {
  vault: Vault
  scrollContainerRef: RefObject<HTMLElement>
  primaryControls?: ReactNode
}

/**
 * Wallet tab header: the shared vault header shell with the portfolio total in
 * its collapsed row.
 */
export const VaultPageHeader = ({
  vault,
  scrollContainerRef,
  primaryControls,
}: VaultPageHeaderProps) => {
  const { t } = useTranslation()

  const { data: totalBalance, error } = useVaultTotalBalanceQuery()
  const formatFiatAmount = useFormatFiatAmount()
  const formattedBalance =
    totalBalance === undefined ? undefined : formatFiatAmount(totalBalance)

  return (
    <VaultPageHeaderShell
      vault={vault}
      scrollContainerRef={scrollContainerRef}
      primaryControls={primaryControls}
      secondaryControls={<VaultPageHeaderControls />}
      balanceLabel={t('portfolio_balance')}
      balance={
        error && totalBalance === undefined
          ? t('failed_to_load')
          : (formattedBalance ?? <Spinner size="0.9em" />)
      }
      testId="vault-page-header"
    />
  )
}
