import { ExpandViewGuard } from '@clients/extension/src/components/expand-view-guard'
import { UploadQrPage } from '@core/ui/qr/upload'

export const UploadQrView = () => (
  <ExpandViewGuard>
    <UploadQrPage />
  </ExpandViewGuard>
)
