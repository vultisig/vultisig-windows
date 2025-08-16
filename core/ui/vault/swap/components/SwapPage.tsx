import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

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
    onExit: goBack,
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
          title={title}
          hasBorder
        />
        <Match
          value={step}
          form={() => <SwapForm onFinish={toNextStep} />}
          verify={() => <SwapVerify />}
        />
      </ToCoinProvider>
    </FromAmountProvider>
  )
}
function goBack(): void {
  throw new Error('Function not implemented.')
}
