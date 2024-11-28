import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { VaultContainer } from '../../../gen/vultisig/vault/v1/vault_container_pb';
import { Vault } from '../../../gen/vultisig/vault/v1/vault_pb';
import { ValueTransfer } from '../../../lib/ui/base/ValueTransfer';
import { fromBase64 } from '../../../lib/utils/fromBase64';
import { pipe } from '../../../lib/utils/pipe';
import { SaveVaultStep } from '../../keygen/shared/SaveVaultStep';
import { toStorageVault } from '../../utils/storageVault';
import { ReadBackupFileStep } from './ReadBackupFileStep';

export const ImportVaultFromFilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <ValueTransfer<VaultContainer>
      from={({ onFinish }) => <ReadBackupFileStep onFinish={onFinish} />}
      to={({ value: { vault: vaultAsBase64String, isEncrypted } }) => {
        if (isEncrypted) {
          return <p>Support for opening encrypted vaults is coming soon.</p>;
        }

        const vault = pipe(
          vaultAsBase64String,
          fromBase64,
          v => new Uint8Array(v),
          Vault.fromBinary,
          toStorageVault
        );

        return (
          <SaveVaultStep
            onForward={() => navigate('vault')}
            value={vault}
            title={t('import_vault')}
          />
        );
      }}
    />
  );
};
