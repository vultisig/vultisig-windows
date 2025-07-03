import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { useTranslation } from 'react-i18next'

import { ReferralLanding } from './components/ReferralLanding'

const steps = ['landing', 'how-it-works', 'create-or-save-referral']

export const ReferralPage = () => {
  const { t } = useTranslation()
  const { step, toNextStep, toFirstStep } = useStepNavigation({ steps })

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<></>}
        title={t('referral')}
        hasBorder
      />
      <PageContent>
        <Match
          value={step}
          landing={() => <ReferralLanding onFinish={toNextStep} />}
        />
      </PageContent>
    </>
  )
}
