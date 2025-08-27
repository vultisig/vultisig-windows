import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  useHasFinishedReferralsOnboardingQuery,
  useSetHasFinishedReferralsOnboardingMutation,
} from '../../../storage/referrals'
import { ManageReferrals } from './components/ManageReferrals'
import { ReferralLanding } from './components/ReferralLanding'
import { ReferralsSummary } from './components/ReferralSummary'
import { useUserValidThorchainNameQuery } from './queries/useUserValidThorchainNameQuery'

const steps = ['landing', 'summary', 'manage'] as const

export const ReferralPage = () => {
  const { t } = useTranslation()

  const { mutateAsync: setHasFinishedOnboarding } =
    useSetHasFinishedReferralsOnboardingMutation()

  const { data: isOnboarded, isLoading } =
    useHasFinishedReferralsOnboardingQuery()

  const { step, toNextStep } = useStepNavigation({
    steps,
    initialStep: isOnboarded ? 'manage' : 'landing',
  })

  // Hard refetch in case the user just created/edited a referral and is coming back from Keysign
  const { refetch } = useUserValidThorchainNameQuery()

  useEffect(() => {
    if (isOnboarded) {
      refetch()
    }
  }, [isOnboarded, refetch])

  return (
    <Match
      value={isLoading ? 'loading' : 'success'}
      loading={() => (
        <CenterAbsolutely>
          <Spinner size="3em" />
        </CenterAbsolutely>
      )}
      success={() => {
        if (step === 'landing' || step === 'summary') {
          return (
            <>
              <PageHeader
                primaryControls={<PageHeaderBackButton />}
                title={t('title_1')}
              />
              <ContentWrapper>
                <Match
                  value={step}
                  landing={() => <ReferralLanding onFinish={toNextStep} />}
                  summary={() => (
                    <ReferralsSummary
                      onFinish={() => {
                        setHasFinishedOnboarding(true)
                        toNextStep()
                      }}
                    />
                  )}
                />
              </ContentWrapper>
            </>
          )
        }

        return <ManageReferrals />
      }}
    />
  )
}

const ContentWrapper = styled(PageContent)`
  overflow-y: hidden;
`
