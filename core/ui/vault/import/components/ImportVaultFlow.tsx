import { PendingReferralProvider } from '@core/ui/mpc/keygen/create/state/pendingReferral'
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
    <PendingReferralProvider initialValue="">
      <ValueTransfer<FileBasedVaultBackupResult>
        from={renderBackupAcquisitionStep}
        to={({ value }) => <ImportVaultSequence items={value} />}
      />
    </PendingReferralProvider>
  )
}
