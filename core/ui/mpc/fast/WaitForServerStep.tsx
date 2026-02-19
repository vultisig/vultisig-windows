import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { OnboardingPendingAnimation } from '@core/ui/mpc/status/OnboardingPendingAnimation'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const WaitForServerStep: FC<OnFinishProp<string[]>> = ({ onFinish }) => {
  const { t } = useTranslation()
  const peersQuery = useMpcPeerOptionsQuery()

  useEffect(() => {
    if (peersQuery.data) onFinish(peersQuery.data)
  }, [onFinish, peersQuery.data])

  return (
    <>
      <PageHeader title={t('connecting_to_server')} hasBorder />
      <MatchQuery
        value={peersQuery}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_connect_with_server')}
            error={error}
          />
        )}
        pending={() => (
          <PageContent
            flexGrow
            alignItems="center"
            justifyContent="center"
            gap={24}
          >
            <OnboardingPendingAnimation />
            <VStack alignItems="center" gap={12}>
              <Text centerHorizontally color="contrast" size={22}>
                {`${t('connecting_to_server')}...`}
              </Text>
              <Text centerHorizontally color="supporting" size={14}>
                {t('fastVaultSetup.takeMinute')}
              </Text>
            </VStack>
          </PageContent>
        )}
      />
    </>
  )
}
