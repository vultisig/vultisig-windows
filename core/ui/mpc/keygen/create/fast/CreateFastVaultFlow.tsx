import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { FastKeygenFlow } from '../../fast/FastKeygenFlow'
import { CreateVaultNameStep } from '../CreateVaultNameStep'
import { ServerEmailStep } from './server/email/ServerEmailStep'
import { SetServerPasswordStep } from './server/password/SetServerPasswordStep'
import { ServerPasswordHintStep } from './server/password-hint/ServerPasswordHintStep'

const steps = ['name', 'email', 'password', 'hint', 'keygen'] as const

export const CreateFastVaultFlow = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  })

  return (
    <VStack
      style={{
        minHeight: '100%',
      }}
    >
      <Match
        value={step}
        name={() => <CreateVaultNameStep onFinish={toNextStep} />}
        email={() => (
          <ServerEmailStep onBack={toPreviousStep} onFinish={toNextStep} />
        )}
        password={() => (
          <SetServerPasswordStep
            onBack={toPreviousStep}
            onFinish={toNextStep}
          />
        )}
        hint={() => (
          <ServerPasswordHintStep
            onBack={toPreviousStep}
            onFinish={toNextStep}
          />
        )}
        keygen={() => <FastKeygenFlow onBack={toPreviousStep} />}
      />
    </VStack>
  )
}
