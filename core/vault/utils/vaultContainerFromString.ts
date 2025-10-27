import { fromBinary } from '@bufbuild/protobuf'
import { VaultContainerSchema } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { fromBase64 } from '@lib/utils/fromBase64'
import { pipe } from '@lib/utils/pipe'

export const vaultContainerFromString = (value: string) =>
  pipe(value, fromBase64, binary => fromBinary(VaultContainerSchema, binary))
