import { CameraPermission } from '@core/ui/qr/components/CameraPermission'
import { QrScanner } from '@core/ui/qr/components/QrScanner'
import { useCameraPermissionQuery } from '@core/ui/qr/hooks/useCameraPermissionQuery'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { ErrorFallbackContent } from '@lib/ui/flow/ErrorFallbackContent'
import { HardDriveUploadIcon } from '@lib/ui/icons/HardDriveUploadIcon'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

type ScanQrViewProps = OnFinishProp<string> & {
  onUploadQrViewRequest?: () => void
}

export const ScanQrView = ({
  onFinish,
  onUploadQrViewRequest,
}: ScanQrViewProps) => {
  const { t } = useTranslation()
  const permissionsQuery = useCameraPermissionQuery()

  const { addToast } = useToast()

  const onScanError = useCallback(
    (error: Error) => {
      addToast({
        message: extractErrorMsg(error) || t('failed_to_read_qr_code'),
      })
    },
    [addToast, t]
  )

  return (
    <>
      <PageContent scrollable>
        <MatchQuery
          value={permissionsQuery}
          success={permission => (
            <Match
              value={permission}
              granted={() => (
                <QrScanner onFinish={onFinish} onError={onScanError} />
              )}
              prompt={() => <CameraPermission />}
              denied={() => <CameraPermission />}
            />
          )}
          pending={() => (
            <Center>
              <Spinner />
            </Center>
          )}
          error={error => (
            <Center>
              <ErrorFallbackContent
                title={t('failed_to_get_camera_permission')}
                error={error}
              />
            </Center>
          )}
        />
      </PageContent>
      {onUploadQrViewRequest && (
        <PageFooter>
          <Button
            icon={<HardDriveUploadIcon fontSize={20} />}
            onClick={onUploadQrViewRequest}
          >
            {t('upload_qr_code_image')}
          </Button>
        </PageFooter>
      )}
    </>
  )
}
