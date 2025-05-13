import { ImportVaultFlow } from '@core/ui/vault/import/components/ImportVaultFlow'

import { ReadBackupFileStep } from './ReadBackupFileStep'

export const ImportVaultFromFilePage = () => {
  return (
    <ImportVaultFlow
      renderBackupAcquisitionStep={({ onFinish }) => (
        <ReadBackupFileStep onFinish={onFinish} />
      )}
    />
  )
}
