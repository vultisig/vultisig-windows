import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { ImportVaultSequence } from './ImportVaultSequence'

type ImportVaultFlowProps = {
  renderBackupAcquisitionStep: ({
    onFinish,
  }: {
    onFinish: (result: FileBasedVaultBackupResult) => void
  }) => React.ReactNode
}

export const ImportVaultFlow = ({
  renderBackupAcquisitionStep,
}: ImportVaultFlowProps) => {
  return (
    <ValueTransfer<FileBasedVaultBackupResult>
      from={renderBackupAcquisitionStep}
      to={({ value }) => <ImportVaultSequence items={value} />}
    />
  )
}
