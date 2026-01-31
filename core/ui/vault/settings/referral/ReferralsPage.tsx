import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import {
  useHasFinishedReferralsOnboardingQuery,
  useSetHasFinishedReferralsOnboardingMutation,
} from '@core/ui/storage/referrals'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

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
  const validThorchainNameQuery = useUserValidThorchainNameQuery()
  const { refetch } = validThorchainNameQuery

  useEffect(() => {
    if (isOnboarded) refetch()
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
                title={t('referrals_default_title')}
              />
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
            </>
          )
        }

        return (
          <MatchQuery
            value={validThorchainNameQuery}
            pending={() => (
              <CenterAbsolutely>
                <Spinner size="3em" />
              </CenterAbsolutely>
            )}
            success={data => <ManageReferrals value={data} />}
            error={() => <ManageReferrals />}
          />
        )
      }}
    />
  )
}
