import { Button } from '@lib/ui/buttons/Button'
import { UploadIcon } from '@lib/ui/icons/UploadIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp, UiProps } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { CameraPermissionGuard } from './CameraPermissionGuard'
import { QrScanner } from './QrScanner'
import { Container } from './ScanQrView.styled'

type ScanQrViewProps = UiProps &
  OnFinishProp<string> & {
    onUploadQrViewRequest?: () => void
  }

export const ScanQrView = ({
  onUploadQrViewRequest,
  onFinish,
  ...rest
}: ScanQrViewProps) => {
  const { t } = useTranslation()

  return (
    <Container {...rest}>
      <div />
      <CameraPermissionGuard>
        <QrScanner onFinish={onFinish} />
      </CameraPermissionGuard>
      {onUploadQrViewRequest && (
        <Button onClick={onUploadQrViewRequest}>
          <VStack
            alignItems="center"
            style={{
              fontSize: '20px',
              display: 'inline-flex',
              marginRight: 6,
            }}
          >
            <UploadIcon />
          </VStack>{' '}
          {t('upload_qr_code_image')}
        </Button>
      )}
    </Container>
  )
}
