import { VaultContainer } from '../../../gen/vultisig/vault/v1/vault_container_pb';
import { fromBase64 } from '@lib/utils/fromBase64';
import { pipe } from '@lib/utils/pipe';

export const vaultContainerFromString = (value: string) =>
  pipe(value, fromBase64, VaultContainer.fromBinary);
