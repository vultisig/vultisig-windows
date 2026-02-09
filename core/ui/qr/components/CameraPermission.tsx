import { cameraPermissionQueryKey } from '@core/ui/qr/hooks/useCameraPermissionQuery'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { Center } from '@lib/ui/layout/Center'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigation } from '@lib/ui/navigation/state'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { Text } from '@lib/ui/text'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const initialViewStorageKey = 'initialView'

const isExtensionPopupView = () => {
  if (typeof chrome === 'undefined') {
    return false
  }

  const getViews = chrome.extension?.getViews
  if (typeof getViews !== 'function') {
    return false
  }

  try {
    return getViews({ type: 'popup' }).length > 0
  } catch {
    return false
  }
}

const persistInitialView = async (view: unknown) => {
  if (typeof chrome === 'undefined') {
    return
  }

  const storage = chrome.storage?.local
  if (!storage?.set) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    storage.set({ [initialViewStorageKey]: view }, () => {
      const errorMessage = chrome.runtime?.lastError?.message

      if (errorMessage) {
        reject(new Error(errorMessage))
        return
      }

      resolve()
    })
  })
}

export const CameraPermission = () => {
  const { t } = useTranslation()
  const { client, openUrl } = useCore()
  const refetchQueries = useRefetchQueries()
  const [{ history }] = useNavigation()

  const currentView = useMemo(
    () => shouldBePresent(getLastItem(history)),
    [history]
  )

  const isPopup = useMemo(
    () => client === 'extension' && isExtensionPopupView(),
    [client]
  )

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const { state } = await navigator.permissions.query({ name: 'camera' })

      if (state === 'denied') throw Error(t('camera_access_blocked'))

      await navigator.mediaDevices.getUserMedia({ video: true })

      return refetchQueries(cameraPermissionQueryKey)
    },
  })

  const openExpandedView = useCallback(async () => {
    if (typeof chrome === 'undefined') {
      openUrl(location.href)
      return
    }

    const runtimeId = chrome.runtime?.id

    if (!runtimeId) {
      openUrl(location.href)
      return
    }

    await persistInitialView(currentView).catch(error => {
      console.error('Failed to persist initial view before expanding', error)
    })

    openUrl(`chrome-extension://${runtimeId}/index.html`)
  }, [currentView, openUrl])

  return (
    <Center>
      <VStack alignItems="center" gap={12}>
        <Text centerHorizontally>{t('provide_camera_permission')}</Text>
        <Button
          loading={!isPopup && isPending}
          onClick={() => {
            if (isPopup) {
              void openExpandedView()
              return
            }

            mutate()
          }}
        >
          {error ? t('try_again') : t('grant_camera_permission')}
        </Button>
        {error && (
          <Text color="danger" centerHorizontally>
            {extractErrorMsg(error)}
          </Text>
        )}
      </VStack>
    </Center>
  )
}
