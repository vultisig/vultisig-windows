import { CameraPermission } from '@core/ui/qr/components/CameraPermission'
import { QrScanner } from '@core/ui/qr/components/QrScanner'
import { useCameraPermissionQuery } from '@core/ui/qr/hooks/useCameraPermissionQuery'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { ErrorFallbackContent } from '@lib/ui/flow/ErrorFallbackContent'
import { Center } from '@lib/ui/layout/Center'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const GlassContainer = styled(VStack)`
  flex: 1;
  border: 1px solid ${getColor('primaryAccentTwo')};
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.background.toRgba(0.3)};
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`

const UploadButton = styled(Button)`
  width: fit-content;
`

type ScanQrViewProps = OnFinishProp<string> & {
  onUploadQrViewRequest?: () => void
}

export const ScanQrView = ({
  onFinish,
  onUploadQrViewRequest,
}: ScanQrViewProps) => {
  const { t } = useTranslation()
  const permissionsQuery = useCameraPermissionQuery()

  return (
    <>
      <PageContent>
        <GlassContainer>
          <MatchQuery
            value={permissionsQuery}
            success={permission => (
              <Match
                value={permission}
                granted={() => <QrScanner onFinish={onFinish} />}
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
        </GlassContainer>
      </PageContent>
      {onUploadQrViewRequest && (
        <PageFooter alignItems="center">
          <UploadButton onClick={onUploadQrViewRequest}>
            {t('upload_qr_code_image')}
          </UploadButton>
        </PageFooter>
      )}
    </>
  )
}
