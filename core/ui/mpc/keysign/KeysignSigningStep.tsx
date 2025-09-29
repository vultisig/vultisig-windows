import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useKeysignMutation } from '@core/ui/mpc/keysign/action/mutations/useKeysignMutation'
import { KeysignSigningState } from '@core/ui/mpc/keysign/flow/KeysignSigningState'
import { useCore } from '@core/ui/state/core'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { KeysignResultRenderer } from './result/KeysignResultRenderer'
import { useKeysignMessagePayload } from './state/keysignMessagePayload'

type KeysignSigningStepProps = Partial<OnBackProp>

export const KeysignSigningStep = ({ onBack }: KeysignSigningStepProps) => {
  const { t } = useTranslation()
  const { version } = useCore()
  const payload = useKeysignMessagePayload()
  const { mutate: startKeysign, ...mutationStatus } =
    useKeysignMutation(payload)

  useEffect(startKeysign, [startKeysign])

  return (
    <MatchQuery
      value={mutationStatus}
      success={result => (
        <>
          <PageHeader title={t('overview')} hasBorder />
          <KeysignResultRenderer result={result} payload={payload} />
        </>
      )}
      error={error => (
        <FullPageFlowErrorState error={error} title={t('signing_error')} />
      )}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={t('keysign')}
            hasBorder
          />
          <PageContent scrollable>
            <KeysignSigningState />
          </PageContent>
          <PageFooter alignItems="center">
            <Text color="shy" size={12}>
              {t('version')} {version}
            </Text>
          </PageFooter>
        </>
      )}
    />
  )
}
