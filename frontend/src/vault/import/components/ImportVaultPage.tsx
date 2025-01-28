import { MatchRecordUnion } from '../../../lib/ui/base/MatchRecordUnion';
import { ValueTransfer } from '../../../lib/ui/base/ValueTransfer';
import { VaultBackupResult } from '../VaultBakupResult';
import { ProcessVaultContainer } from './ProcessVaultContainer';
import { SaveImportedVaultStep } from './SaveImportedVaultStep';
import { UploadBackupFileStep } from './UploadBackupFileStep';

export const ImportVaultPage = () => {
  return (
    <ValueTransfer<VaultBackupResult>
      from={({ onFinish }) => <UploadBackupFileStep onFinish={onFinish} />}
      to={({ value }) => (
        <MatchRecordUnion
          value={value}
          handlers={{
            vaultContainer: vaultContainer => (
              <ProcessVaultContainer value={vaultContainer} />
            ),
            vault: vault => <SaveImportedVaultStep value={vault} />,
          }}
        />
      )}
    />
  );
};
