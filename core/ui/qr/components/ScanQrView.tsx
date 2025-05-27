import { QrScanner } from '@core/ui/qr/components/QrScanner'
import { useCameraPermissionQuery } from '@core/ui/qr/hooks/useCameraPermissionQuery'
import { cameraPermissionQueryKey } from '@core/ui/qr/hooks/useCameraPermissionQuery'
import { Button } from '@lib/ui/buttons/Button'
import { ErrorFallbackContent } from '@lib/ui/flow/ErrorFallbackContent'
import { UploadIcon } from '@lib/ui/icons/UploadIcon'
import { Center } from '@lib/ui/layout/Center'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
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
  const invalidateQueries = useInvalidateQueries()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      await navigator.mediaDevices.getUserMedia({ video: true })
      return invalidateQueries(cameraPermissionQueryKey)
    },
  })

  return (
    <>
      <PageContent scrollable>
        <MatchQuery
          value={permissionsQuery}
          success={permission =>
            permission === 'granted' ? (
              <QrScanner onFinish={onFinish} />
            ) : (
              <Center>
                <VStack alignItems="center" gap={12}>
                  <Text centerHorizontally>
                    {t('provide_camera_permission')}
                  </Text>
                  <Button onClick={() => mutate()} isLoading={isPending}>
                    {error ? t('try_again') : t('grant_camera_permission')}
                  </Button>
                  {error && (
                    <Text color="danger">{extractErrorMsg(error)}</Text>
                  )}
                </VStack>
              </Center>
            )
          }
          pending={() => (
            <Center>
              <Spinner />
            </Center>
          )}
          error={error => (
            <Center>
              <ErrorFallbackContent
                title={t('failed_to_get_camera_permission')}
                message={extractErrorMsg(error)}
              />
            </Center>
          )}
        />
      </PageContent>
      {onUploadQrViewRequest && (
        <PageFooter>
          <Button onClick={onUploadQrViewRequest}>
            <HStack gap={8}>
              <UploadIcon />
              {t('upload_qr_code_image')}
            </HStack>
          </Button>
        </PageFooter>
      )}
    </>
  )
}
