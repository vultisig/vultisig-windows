import { cameraPermissionQueryKey } from '@core/ui/qr/hooks/useCameraPermissionQuery'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { Center } from '@lib/ui/layout/Center'
import { VStack } from '@lib/ui/layout/Stack'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

export const CameraPermission = () => {
  const { t } = useTranslation()
  const { client, openUrl } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const { state } = await navigator.permissions.query({ name: 'camera' })

      if (state === 'denied') throw Error(t('camera_access_blocked'))

      await navigator.mediaDevices.getUserMedia({ video: true })

      return invalidateQueries(cameraPermissionQueryKey)
    },
  })

  return (
    <Center>
      <VStack alignItems="center" gap={12}>
        <Text centerHorizontally>{t('provide_camera_permission')}</Text>
        {client === 'extension' && innerWidth <= 400 ? (
          <Button onClick={() => openUrl(location.href)}>
            {t('try_in_expanded_mode')}
          </Button>
        ) : (
          <Button loading={isPending} onClick={() => mutate()}>
            {error ? t('try_again') : t('grant_camera_permission')}
          </Button>
        )}
        {error && (
          <Text color="danger" centerHorizontally>
            {extractErrorMsg(error)}
          </Text>
        )}
      </VStack>
    </Center>
  )
}
