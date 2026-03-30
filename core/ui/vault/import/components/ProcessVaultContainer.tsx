import { fromBinary } from '@bufbuild/protobuf'
import { DecryptVaultContainerStep } from '@core/ui/vault/import/components/DecryptVaultContainerStep'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ValueProp } from '@lib/ui/props'
import { fromCommVault } from '@vultisig/core-mpc/types/utils/commVault'
import { VaultContainer } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_pb'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { fromBase64 } from '@vultisig/lib-utils/fromBase64'
import { pipe } from '@vultisig/lib-utils/pipe'

import { SaveImportedVaultStep } from './SaveImportedVaultStep'

export const ProcessVaultContainer = ({
  value,
  onFinish,
}: ValueProp<VaultContainer> & { onFinish?: () => void }) => {
  const { vault: vaultAsBase64String, isEncrypted } = value
  if (isEncrypted) {
    return (
      <ValueTransfer<Vault>
        from={({ onFinish: resolve }) => (
          <DecryptVaultContainerStep
            value={vaultAsBase64String}
            onFinish={resolve}
          />
        )}
        to={({ value }) => (
          <SaveImportedVaultStep value={value} onFinish={onFinish} />
        )}
      />
    )
  }

  const vault = pipe(
    vaultAsBase64String,
    fromBase64,
    v => new Uint8Array(v),
    v => fromBinary(VaultSchema, v),
    fromCommVault,
    vault => ({ ...vault, isBackedUp: true })
  )

  return <SaveImportedVaultStep value={vault} onFinish={onFinish} />
}
