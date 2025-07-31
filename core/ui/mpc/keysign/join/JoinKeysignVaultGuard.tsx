import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useVaults } from '@core/ui/storage/vaults'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { ChildrenProp } from '@lib/ui/props'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { useTranslation } from 'react-i18next'

export const JoinKeysignVaultGuard = ({ children }: ChildrenProp) => {
  const [{ vaultId, keysignMsg }] = useCoreViewState<'joinKeysign'>()
  const vaults = useVaults()

  const { t } = useTranslation()

  const navigate = useCoreNavigate()

  const vault = vaults.find(vault => getVaultId(vault) === vaultId)

  if (!vault) {
    return (
      <FullPageFlowErrorState
        title={t('wrong_vault_try_again')}
        action={
          <Button onClick={() => navigate({ id: 'vaults' })}>
            {t('change_vault')}
          </Button>
        }
      />
    )
  }

  const payload = keysignMsg.keysignPayload

  if (
    payload &&
    payload.libType &&
    !areLowerCaseEqual(payload.libType, vault.libType)
  ) {
    return (
      <FullPageFlowErrorState
        title={t('vault_type_does_not_match')}
        action={
          <Button onClick={() => navigate({ id: 'vault' })}>{t('back')}</Button>
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
