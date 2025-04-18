import { fromBinary } from '@bufbuild/protobuf'
import { fromCommVault } from '@core/mpc/types/utils/commVault'
import { VaultContainer } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { DecryptVaultContainerStep } from '@core/ui/vault/import/components/DecryptVaultContainerStep'
import { Vault } from '@core/ui/vault/Vault'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ValueProp } from '@lib/ui/props'
import { fromBase64 } from '@lib/utils/fromBase64'
import { pipe } from '@lib/utils/pipe'

import { SaveImportedVaultStep } from './SaveImportedVaultStep'

export const ProcessVaultContainer = ({ value }: ValueProp<VaultContainer>) => {
  const { vault: vaultAsBase64String, isEncrypted } = value
  if (isEncrypted) {
    return (
      <ValueTransfer<Vault>
        from={({ onFinish }) => (
          <DecryptVaultContainerStep
            value={vaultAsBase64String}
            onFinish={onFinish}
          />
        )}
        to={({ value }) => <SaveImportedVaultStep value={value} />}
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

  return <SaveImportedVaultStep value={vault} />
}
