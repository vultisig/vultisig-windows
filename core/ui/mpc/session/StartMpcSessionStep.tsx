import { isServer } from '@core/mpc/devices/localPartyId'
import { MpcSession } from '@core/ui/mpc/session/MpcSession'
import { startMpcSession } from '@core/ui/mpc/session/utils/startMpcSession'
import { useMpcDevices } from '@core/ui/mpc/state/mpcDevices'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const StartMpcSessionStep = ({
  onFinish,
  value,
  isPluginReshare,
}: OnFinishProp &
  ValueProp<MpcSession> &
  Partial<{ isPluginReshare: boolean }>) => {
  const { t } = useTranslation()
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const devices = useMpcDevices()
  const { mutate: start, ...status } = useMutation({
    mutationFn: () => {
      return startMpcSession({
        serverUrl,
        sessionId,
        devices: isPluginReshare
          ? devices.filter(device => !isServer(device))
          : devices,
      })
    },
    onSuccess: () => onFinish(),
  })

  useEffect(() => start(), [start])

  return (
    <>
      <PageHeader title={t(value)} hasBorder />
      <PageContent justifyContent="center" alignItems="center">
        <MatchQuery
          value={status}
          pending={() => <Spinner size="3em" />}
          error={error => <Text>{extractErrorMsg(error)}</Text>}
        />
      </PageContent>
    </>
  )
}
