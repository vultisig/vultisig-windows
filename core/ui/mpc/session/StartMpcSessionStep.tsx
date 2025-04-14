import { startMpcSession } from '@core/ui/mpc/session/utils/startMpcSession'
import { useMpcDevices } from '@core/ui/mpc/state/mpcDevices'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const StartMpcSessionStep = ({
  onBack,
  onFinish,
}: Partial<OnBackProp> & OnFinishProp) => {
  const { t } = useTranslation()
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const devices = useMpcDevices()

  const { mutate: start, ...status } = useMutation({
    mutationFn: () => {
      return startMpcSession({ serverUrl, sessionId, devices })
    },
    onSuccess: () => onFinish(),
  })

  useEffect(() => start(), [start])

  return (
    <>
      <FlowPageHeader onBack={onBack} title={t('keygen')} />
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
