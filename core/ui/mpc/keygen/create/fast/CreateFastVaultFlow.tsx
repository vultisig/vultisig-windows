import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { ChildrenProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { KeygenActionWrapper } from '../KeygenActionWrapper'
import { KeygenSessionProviders } from '../KeygenSessionProviders'
import { FastVaultSetupForm } from './FastVaultSetupForm'

const steps = ['form', 'keygen'] as const

type CreateFastVaultFlowProps = Partial<ChildrenProp> & {
  CreateActionProvider?: ComponentType<ChildrenProp>
}

export const CreateFastVaultFlow = ({
  children,
  CreateActionProvider,
}: CreateFastVaultFlowProps) => {
  const { goBack } = useCore()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: goBack,
  })

  return (
    <Match
      value={step}
      form={() => (
        <FastVaultSetupForm onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      keygen={() => (
        <KeygenSessionProviders>
          {children}
          <KeygenActionWrapper CreateActionProvider={CreateActionProvider}>
            <FastKeygenFlow onBack={toPreviousStep} />
          </KeygenActionWrapper>
        </KeygenSessionProviders>
      )}
    />
  )
}
