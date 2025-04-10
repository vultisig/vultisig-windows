import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { SwapForm } from '../form/SwapForm'
import { FromAmountProvider } from '../state/fromAmount'
import { ToCoinProvider } from '../state/toCoin'
import { SwapVerify } from '../verify/SwapVerify'
import { RefreshSwap } from './RefreshSwap'

const sendSteps = ['form', 'verify'] as const

export const SwapPage = () => {
  const { t } = useTranslation()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: sendSteps,
    onExit: useNavigateBack(),
  })

  const { primaryControls, title } = match(step, {
    form: () => ({
      primaryControls: <PageHeaderBackButton />,
      title: t('swap'),
    }),
    verify: () => ({
      primaryControls: <PageHeaderBackButton onClick={toPreviousStep} />,
      title: t('swap_overview'),
    }),
  })

  return (
    <FromAmountProvider initialValue={null}>
      <ToCoinProvider>
        <PageHeader
          primaryControls={primaryControls}
          secondaryControls={<RefreshSwap />}
          title={<PageHeaderTitle>{title}</PageHeaderTitle>}
        />
        <Match
          value={step}
          form={() => <SwapForm onForward={toNextStep} />}
          verify={() => <SwapVerify />}
        />
      </ToCoinProvider>
    </FromAmountProvider>
  )
}
