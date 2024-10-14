import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '../../../lib/ui/buttons/Button';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { makeAppPath } from '../../../navigation';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { useVaults } from '../../queries/useVaultsQuery';
import { useCurrentVaultId } from '../../state/useCurrentVaultId';
import { getStorageVaultId } from '../../utils/storageVault';
import { CurrentKeysignVaultProvider } from './state/currentKeysignVault';

export const KeysignVaultGuard = ({ children }: ComponentWithChildrenProps) => {
  const [{ vaultId }] = useAppPathParams<'joinKeysign'>();
  const vaults = useVaults();

  const { t } = useTranslation();

  const [currentVaultId] = useCurrentVaultId();

  const vault = vaults.find(vault => getStorageVaultId(vault) === vaultId);

  if (!vault || vaultId !== currentVaultId) {
    return (
      <FullPageFlowErrorState
        title={t('join_keysign')}
        message={t('wrong_vault_try_again')}
        action={
          <Link to={makeAppPath('vaultList')}>
            <Button as="div">{t('change_vault')}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <CurrentKeysignVaultProvider value={vault}>
      <CurrentLocalPartyIdProvider value={vault.local_party_id}>
        {children}
      </CurrentLocalPartyIdProvider>
    </CurrentKeysignVaultProvider>
  );
};
