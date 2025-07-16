import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import {
  useHasFinishedReferralsOnboardingQuery,
  useSetHasFinishedReferralsOnboardingMutation,
} from '../../../storage/referrals'
import { ReferralLanding } from './components/ReferralLanding'
import { ReferralsSummary } from './components/ReferralSummary'

const steps = ['landing', 'summary'] as const

export const ReferralPage = () => {
  const { t } = useTranslation()
  const { step, toNextStep } = useStepNavigation({ steps })
  const navigate = useCoreNavigate()
  const { mutateAsync: setHasFinishedOnboarding } =
    useSetHasFinishedReferralsOnboardingMutation()
  const { data: isOnboarded, isLoading } =
    useHasFinishedReferralsOnboardingQuery()

  useEffect(() => {
    if (isOnboarded) {
      navigate({
        id: 'manageReferral',
      })
    }
  }, [isOnboarded, navigate])

  if (isLoading) return null

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
                navigate({
                  id: 'manageReferral',
                })
              }}
            />
          )}
        />
      </ContentWrapper>
    </>
  )
}

const TooltipContent = styled.div`
  min-width: 200px;
`

const ContentWrapper = styled(PageContent)`
  overflow-y: hidden;
`
