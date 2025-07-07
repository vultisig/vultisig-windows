import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CreateOrSaveReferral } from './components/CreateOrSaveReferral'
import { ReferralLanding } from './components/ReferralLanding'
import { ReferralsSummary } from './components/ReferralSummary'

const steps = ['landing', 'summary', 'create-or-save-referral'] as const

const getHeaderTitle = (step: (typeof steps)[number]) => {
  return match(step, {
    landing: () => 'title_1' as const,
    summary: () => 'title_1' as const,
    'create-or-save-referral': () => 'title_2' as const,
  })
}

export const ReferralPage = () => {
  const { t } = useTranslation()
  const { step, toNextStep } = useStepNavigation({ steps })
  const headerTitle = getHeaderTitle(step)

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
        title={t(headerTitle)}
      />
      <PageContent>
        <Match
          value={step}
          landing={() => <ReferralLanding onFinish={toNextStep} />}
          summary={() => <ReferralsSummary onFinish={toNextStep} />}
          create-or-save-referral={() => <CreateOrSaveReferral />}
        />
      </PageContent>
    </>
  )
}

const TooltipContent = styled.div`
  min-width: 200px;
`
