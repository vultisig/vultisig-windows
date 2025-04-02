import { Button } from '@lib/ui/buttons/Button'
import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { makeAppPath } from '../../../navigation'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { useVaults } from '../../queries/useVaultsQuery'
import { useCurrentVaultId } from '../../state/currentVaultId'
import { getStorageVaultId } from '../../utils/storageVault'
import { CurrentKeysignVaultProvider } from './state/currentKeysignVault'

export const KeysignVaultGuard = ({ children }: ChildrenProp) => {
  const { vaultId } = useAppPathState<'joinKeysign'>()
  const vaults = useVaults()

  const { t } = useTranslation()

  const [currentVaultId] = useCurrentVaultId()

  const vault = vaults.find(vault => getStorageVaultId(vault) === vaultId)

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
    <CurrentKeysignVaultProvider value={vault}>
      <MpcLocalPartyIdProvider value={vault.local_party_id}>
        {children}
      </MpcLocalPartyIdProvider>
    </CurrentKeysignVaultProvider>
  )
}
