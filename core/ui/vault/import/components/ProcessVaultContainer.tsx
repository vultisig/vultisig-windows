import { fromBinary } from '@bufbuild/protobuf'
import { DecryptVaultContainerStep } from '@core/ui/vault/import/components/DecryptVaultContainerStep'
import { ensureMasterKeyShares } from '@core/ui/vault/import/utils/ensureMasterKeyShares'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ValueProp } from '@lib/ui/props'
import { fromCommVault } from '@vultisig/core-mpc/types/utils/commVault'
import { VaultContainer } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_pb'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { fromBase64 } from '@vultisig/lib-utils/fromBase64'

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

  const commVault = ensureMasterKeyShares(
    fromBinary(VaultSchema, new Uint8Array(fromBase64(vaultAsBase64String)))
  )
  const vault = { ...fromCommVault(commVault), isBackedUp: true }

  return <SaveImportedVaultStep value={vault} onFinish={onFinish} />
}
