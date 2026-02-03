import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { ChildrenProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { SecureVaultKeygenFlow } from './SecureVaultKeygenFlow'
import { SecureVaultSetupForm } from './SecureVaultSetupForm'

const steps = ['form', 'keygen'] as const

type CreateSecureVaultFlowProps = Partial<ChildrenProp> & {
  CreateActionProvider?: ComponentType<ChildrenProp>
}

export const CreateSecureVaultFlow = ({
  children,
  CreateActionProvider,
}: CreateSecureVaultFlowProps) => {
  const { goBack } = useCore()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: goBack,
  })

  return (
    <Match
      value={step}
      form={() => (
        <SecureVaultSetupForm onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      keygen={() => (
        <SecureVaultKeygenFlow
          onBack={toPreviousStep}
          CreateActionProvider={CreateActionProvider}
        >
          {children}
        </SecureVaultKeygenFlow>
      )}
    />
  )
}
