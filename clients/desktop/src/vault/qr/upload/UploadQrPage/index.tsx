import { ValueTransfer } from '../../../../lib/ui/base/ValueTransfer'
import { CurrentVaultProvider } from '../../../state/currentVault'
import { CheckVaultStep } from './CheckVaultStep'
import { UploadQRPageResult } from './UploadQRPageResult'
import { UploadQrPageWithExistingVault } from './UploadQrPageWithExistingVault'
import { UploadQrPageWithoutVault } from './UploadQrPageWithoutVault'

export const UploadQrPage = () => (
  <ValueTransfer<UploadQRPageResult>
    from={({ onFinish }) => <CheckVaultStep onFinish={onFinish} />}
    to={({ value: { vault } }) => {
      if (!vault) return <UploadQrPageWithoutVault />

      return (
        <CurrentVaultProvider value={vault}>
          <UploadQrPageWithExistingVault />
        </CurrentVaultProvider>
      )
    }}
  />
)
