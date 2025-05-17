import { Button } from '@lib/ui/buttons/Button'
import { Center } from '@lib/ui/layout/Center'
import { VStack } from '@lib/ui/layout/Stack'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { cameraPermissionQueryKey } from './queries/useCameraPermissionQuery'

export const RequestCameraPermission = () => {
  const invalidateQueries = useInvalidateQueries()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      await navigator.mediaDevices.getUserMedia({ video: true })
      return invalidateQueries(cameraPermissionQueryKey)
    },
  })

  const { t } = useTranslation()

  return (
    <Center>
      <VStack alignItems="center" gap={12}>
        <Text centerHorizontally>{t('provide_camera_permission')}</Text>
        <Button onClick={() => mutate()} isLoading={isPending}>
          {error ? t('try_again') : t('grant_camera_permission')}
        </Button>
        {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
      </VStack>
    </Center>
  )
}
