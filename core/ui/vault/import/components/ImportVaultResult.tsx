import { Vault } from '@core/mpc/vault/Vault'
import { FileBasedVaultBackupResultItem } from '@core/ui/vault/import/VaultBackupResult'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { DecryptVaultStep } from './DecryptVaultStep'
import { ProcessVaultContainer } from './ProcessVaultContainer'
import { SaveImportedVaultStep } from './SaveImportedVaultStep'

type ImportVaultResultProps = {
  item: FileBasedVaultBackupResultItem
  onFinish?: () => void
}

export const ImportVaultResult = ({
  item,
  onFinish,
}: ImportVaultResultProps) => {
  return (
    <MatchRecordUnion
      value={item.result}
      handlers={{
        vaultContainer: vaultContainer => (
          <ProcessVaultContainer value={vaultContainer} onFinish={onFinish} />
        ),
        vault: vault => <SaveImportedVaultStep value={vault} onFinish={onFinish} />,
        encryptedVault: encryptedVault => (
          <ValueTransfer<Vault>
            from={({ onFinish: resolve }) => (
              <DecryptVaultStep value={encryptedVault} onFinish={resolve} />
            )}
            to={({ value }) => (
              <SaveImportedVaultStep value={value} onFinish={onFinish} />
            )}
          />
        ),
      }}
    />
  )
}
