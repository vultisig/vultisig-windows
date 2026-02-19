import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { OnboardingPendingAnimation } from '@core/ui/mpc/status/OnboardingPendingAnimation'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Panel } from '@lib/ui/panel/Panel'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcSignersQuery } from '../devices/queries/queries/useMpcSignersQuery'
import { MpcSession } from './MpcSession'

export const WaitMpcSessionStart = ({
  onFinish,
  value,
}: OnFinishProp<string[]> & ValueProp<MpcSession>) => {
  const signersQuery = useMpcSignersQuery()
  const localPartyId = useMpcLocalPartyId()

  useEffect(() => {
    if (signersQuery.data) {
      onFinish(signersQuery.data)
    }
  }, [onFinish, signersQuery.data])

  const { t } = useTranslation()

  const title = t(`join_${value}`)

  return (
    <MatchQuery
      error={error => (
        <FullPageFlowErrorState
          title={t(`failed_to_join_${value}`)}
          error={error}
        />
      )}
      value={signersQuery}
      pending={() => (
        <>
          <FlowPageHeader title={title} />
          <PageContent alignItems="center" justifyContent="center">
            <Panel>
              <VStack alignItems="center" gap={16}>
                <OnboardingPendingAnimation />
                <VStack alignItems="center" gap={20}>
                  <Text size={14} weight="700">
                    {t('this_device')} {localPartyId}
                  </Text>
                  <Text size={14} weight="700">
                    {t(`waiting_for_${value}_start`)}
                  </Text>
                </VStack>
              </VStack>
            </Panel>
          </PageContent>
        </>
      )}
    />
  )
}
