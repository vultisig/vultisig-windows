import { ImportVaultFlow } from './ImportVaultFlow'
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
