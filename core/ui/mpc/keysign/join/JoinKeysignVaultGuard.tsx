import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useVaults } from '@core/ui/storage/vaults'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { ChildrenProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const JoinKeysignVaultGuard = ({ children }: ChildrenProp) => {
  const [{ vaultId, keysignMsg }] = useCoreViewState<'joinKeysign'>()
  const vaults = useVaults()

  const { t } = useTranslation()

  const navigate = useCoreNavigate()

  const vault = vaults.find(vault => getVaultId(vault) === vaultId)

  const payload = keysignMsg.keysignPayload

  const error = useMemo(() => {
    if (!vault) {
      return t('wrong_vault_try_again')
    }

    if (!payload) {
      return
    }

    const { vaultLocalPartyId, libType } = payload

    if (vaultLocalPartyId === vault.localPartyId) {
      return t('same_vault_share')
    }

    if (libType && !areLowerCaseEqual(libType, vault.libType)) {
      return t('vault_type_does_not_match')
    }
  }, [payload, t, vault])

  if (error) {
    return (
      <FullPageFlowErrorState
        title={error}
        action={
          <Button onClick={() => navigate({ id: 'vault' })}>{t('back')}</Button>
        }
      />
    )
  }

  return (
    <CurrentVaultProvider value={vault}>
      <MpcLocalPartyIdProvider value={shouldBePresent(vault).localPartyId}>
        {children}
      </MpcLocalPartyIdProvider>
    </CurrentVaultProvider>
  )
}
