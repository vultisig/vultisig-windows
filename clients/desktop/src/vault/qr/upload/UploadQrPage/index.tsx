import { MatchRecordUnion } from '../../../../lib/ui/base/MatchRecordUnion'
import { ValueTransfer } from '../../../../lib/ui/base/ValueTransfer'
import { CurrentVaultProvider } from '../../../state/currentVault'
import { CheckVaultStep } from './CheckVaultStep'
import { UploadQRPageResult } from './UploadQRPageResult'
import { UploadQrPageWithExistingVault } from './UploadQrPageWithExistingVault'
import { UploadQrPageWithoutVault } from './UploadQrPageWithoutVault'

export const UploadQrPage = () => (
  <ValueTransfer<UploadQRPageResult>
    from={({ onFinish }) => <CheckVaultStep onFinish={onFinish} />}
    to={({ value }) => (
      <MatchRecordUnion
        value={value}
        handlers={{
          vault: vault => (
            <CurrentVaultProvider value={vault}>
              <UploadQrPageWithExistingVault />
            </CurrentVaultProvider>
          ),
          noVault: () => <UploadQrPageWithoutVault />,
        }}
      />
    )}
  />
)
