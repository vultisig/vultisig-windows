import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { CurrentVaultCoinsProvider } from '@core/ui/vault/state/currentVaultCoins'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { makeAppPath } from '../../../navigation'
import { useCurrentVaultId } from '../../state/currentVaultId'
export const KeysignVaultGuard = ({ children }: ChildrenProp) => {
  const { vaultId } = useCorePathState<'joinKeysign'>()
  const vaults = useVaults()

  const { t } = useTranslation()

  const [currentVaultId] = useCurrentVaultId()

  const vault = vaults.find(vault => getVaultId(vault) === vaultId)

  if (!vault || vaultId !== currentVaultId) {
    return (
      <FullPageFlowErrorState
        message={t('wrong_vault_try_again')}
        action={
          <Link to={makeAppPath('vaults')}>
            <Button as="div">{t('change_vault')}</Button>
          </Link>
        }
      />
    )
  }

  return (
    <CurrentVaultProvider value={vault}>
      <CurrentVaultCoinsProvider value={vault.coins}>
        <MpcLocalPartyIdProvider value={vault.localPartyId}>
          {children}
        </MpcLocalPartyIdProvider>
      </CurrentVaultCoinsProvider>
    </CurrentVaultProvider>
  )
}
