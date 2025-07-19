import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  useHasFinishedReferralsOnboardingQuery,
  useSetHasFinishedReferralsOnboardingMutation,
} from '../../../storage/referrals'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
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

  const { address } = shouldBePresent(
    useCurrentVaultCoin({
      chain: chainFeeCoin.THORChain.chain,
      id: 'RUNE',
    })
  )

  // Hard refetch in case the user just created/edited a referral and is coming back from Keysign
  const { refetch } = useUserValidThorchainNameQuery(address)

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
                secondaryControls={
                  <Tooltip
                    renderOpener={({ ref }) => (
                      <div ref={ref}>
                        <IconButton size="sm">
                          <InfoIcon />
                        </IconButton>
                      </div>
                    )}
                    content={
                      <TooltipContent>
                        <Text size={16}>{t('header_tooltip_title')}</Text>
                        <Text color="supporting" size={13}>
                          {t('header_tooltip_content')}
                        </Text>
                      </TooltipContent>
                    }
                  />
                }
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

const TooltipContent = styled.div`
  min-width: 200px;
`

const ContentWrapper = styled(PageContent)`
  overflow-y: hidden;
`
