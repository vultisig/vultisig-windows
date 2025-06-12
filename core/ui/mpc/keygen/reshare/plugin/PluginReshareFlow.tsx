import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { PasswordProvider } from '../../../../state/password'
import { FastKeygenFlow } from '../../fast/FastKeygenFlow'
import { PluginReviewSteps } from './PluginReviewSteps'

const pluginReshareSteps = ['review', 'keygen'] as const

export const PluginReshareFlow = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: pluginReshareSteps,
    onExit: useNavigateBack(),
  })

  return (
    <>
      <Match
        value={step}
        review={() => <PluginReviewSteps onFinish={toNextStep} />}
        keygen={() => (
          <ValueTransfer<{ password: string }>
            key="password"
            from={({ onFinish }) => <ServerPasswordStep onFinish={onFinish} />}
            to={({ value: { password } }) => (
              <PasswordProvider initialValue={password}>
                <FastKeygenFlow onBack={toPreviousStep} />
              </PasswordProvider>
            )}
          />
        )}
      />
    </>
  )
}
