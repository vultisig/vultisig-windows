import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'

import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { FastKeygenFlow } from '../../fast/FastKeygenFlow'

const pluginReshareSteps = [
  'pluginInfo',
  'policyReview',
  'password',
  'keygen',
] as const

export const FastVaultReshareFlow = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: pluginReshareSteps,
    onExit: useNavigateBack(),
  })

  return (
    <>
      <Match
        value={step}
        pluginInfo={() => <>Plugin Info Page</>}
        policyReview={() => <>Review policy</>}
        password={() => <ServerPasswordStep onFinish={toNextStep} />}
        keygen={() => <FastKeygenFlow onBack={toPreviousStep} />}
      />
    </>
  )
}
