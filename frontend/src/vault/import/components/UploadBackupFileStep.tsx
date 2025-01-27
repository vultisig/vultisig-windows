import { VaultContainer } from '../../../gen/vultisig/vault/v1/vault_container_pb';
import { ValueFinishProps } from '../../../lib/ui/props';

export const UploadBackupFileStep = ({
  onFinish,
}: ValueFinishProps<VaultContainer>) => {
  console.log('onFinish', onFinish);
  return <p>coming soon!</p>;
};
