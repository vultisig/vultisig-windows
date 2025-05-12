import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

export const JoinKeysignVaultGuard = ({ children }: ChildrenProp) => {
  const [{ vaultId }] = useCoreViewState<'joinKeysign'>()
  const vaults = useVaults()

  const { t } = useTranslation()

  const currentVaultId = useCurrentVaultId()

  const navigate = useCoreNavigate()

  const vault = vaults.find(vault => getVaultId(vault) === vaultId)

  if (!vault || vaultId !== currentVaultId) {
    return (
      <FullPageFlowErrorState
        message={t('wrong_vault_try_again')}
        action={
          <Button onClick={() => navigate({ id: 'vaults' })}>
            {t('change_vault')}
          </Button>
        }
      />
    )
  }

  return (
    <CurrentVaultProvider value={vault}>
      <MpcLocalPartyIdProvider value={vault.localPartyId}>
        {children}
      </MpcLocalPartyIdProvider>
    </CurrentVaultProvider>
  )
}
