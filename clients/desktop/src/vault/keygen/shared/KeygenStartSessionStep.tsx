import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Spinner } from '../../../lib/ui/loaders/Spinner'
import { Text } from '../../../lib/ui/text'
import { useMpcServerUrl } from '../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../mpc/session/state/mpcSession'
import { useMpcSigners } from '../../../mpc/signers/state/mpcSigners'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { startSession } from '../utils/startSession'

export const KeygenStartSessionStep = ({
  onBack,
  onForward,
}: Partial<OnBackProp> & OnForwardProp) => {
  const { t } = useTranslation()
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const devices = useMpcSigners()

  const { mutate: start, ...status } = useMutation({
    mutationFn: () => {
      return startSession({ serverUrl, sessionId, devices })
    },
    onSuccess: () => onForward(),
  })

  useEffect(() => start(), [start])

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
      />
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
