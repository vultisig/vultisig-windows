import { VaultContainer } from '../../../gen/vultisig/vault/v1/vault_container_pb';
import { ValueTransfer } from '../../../lib/ui/base/ValueTransfer';
import { ProcessVaultContainer } from './ProcessVaultContainer';
import { ReadBackupFileStep } from './ReadBackupFileStep';

export const ImportVaultPage = () => {
  return (
    <ValueTransfer<VaultContainer>
      from={({ onFinish }) => <ReadBackupFileStep onFinish={onFinish} />}
      to={({ value }) => <ProcessVaultContainer value={value} />}
    />
  );
};
