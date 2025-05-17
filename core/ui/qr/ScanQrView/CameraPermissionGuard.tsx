import { Match } from '@lib/ui/base/Match'
import { ErrorFallbackContent } from '@lib/ui/flow/ErrorFallbackContent'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'

import { useCameraPermissionQuery } from './queries/useCameraPermissionQuery'
import { RequestCameraPermission } from './RequestCameraPermission'

export const CameraPermissionGuard = ({ children }: ChildrenProp) => {
  const permissionsQuery = useCameraPermissionQuery()

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={permissionsQuery}
      success={permission => (
        <Match
          value={permission}
          granted={() => <>{children}</>}
          prompt={() => <RequestCameraPermission />}
          denied={() => <RequestCameraPermission />}
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
            message={extractErrorMsg(error)}
          />
        </Center>
      )}
    />
  )
}
