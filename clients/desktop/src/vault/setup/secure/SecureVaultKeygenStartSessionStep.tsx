import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Spinner } from '../../../lib/ui/loaders/Spinner'
import { OnBackProp, OnForwardProp } from '../../../lib/ui/props'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { Text } from '../../../lib/ui/text'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { useCurrentSessionId } from '../../keygen/shared/state/currentSessionId'
import { useCurrentServerUrl } from '../../keygen/state/currentServerUrl'
import { startSession } from '../../keygen/utils/startSession'
import { useVaultKeygenDevices } from '../../setup/hooks/useVaultKegenDevices'

export const SecureVaultKeygenStartSessionStep = ({
  onBack,
  onForward,
}: Partial<OnBackProp> & OnForwardProp) => {
  const { t } = useTranslation()

  const sessionId = useCurrentSessionId()
  const serverUrl = useCurrentServerUrl()
  const devices = useVaultKeygenDevices()

  const { mutate: start, ...status } = useMutation({
    mutationFn: () => {
      return startSession({ serverUrl, sessionId, devices })
    },
    onSuccess: () => onForward(),
  })

  useEffect(() => start(), [start])

  return (
    <>
      <PageHeader primaryControls={<PageHeaderBackButton onClick={onBack} />} />
      <PageContent
        justifyContent="center"
        alignItems="center"
        data-testid="KeygenStartStep-PageContent"
      >
        <MatchQuery
          value={status}
          pending={() => <Spinner size="3em" />}
          success={() => null}
          error={() => <Text>{t('failed_to_start_keygen')}</Text>}
        />
      </PageContent>
    </>
  )
}
