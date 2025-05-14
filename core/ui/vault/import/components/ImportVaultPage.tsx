import { ImportVaultFlow } from './ImportVaultFlow'
import { UploadBackupFileStep } from './UploadBackupFileStep'

export const ImportVaultPage = () => {
  return (
    <ImportVaultFlow
      renderBackupAcquisitionStep={({ onFinish }) => (
        <UploadBackupFileStep onFinish={onFinish} />
      )}
    />
  )
}
