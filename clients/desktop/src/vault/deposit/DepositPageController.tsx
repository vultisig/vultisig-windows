import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { DepositEnabledChain } from '@core/ui/vault/deposit/DepositEnabledChain'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'

import { ChainAction, chainActionsRecord } from './ChainAction'
import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'

const depositSteps = ['form', 'verify'] as const

export const DepositPageController = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const chainActionOptions =
    chainActionsRecord[coinKey.chain as DepositEnabledChain]

  const [state, setState] = useState<{
    depositFormData: FieldValues
    selectedChainAction: ChainAction
  }>({
    depositFormData: {},
    selectedChainAction: chainActionOptions[0] as ChainAction,
  })

  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: depositSteps,
    onExit: useNavigateBack(),
  })

  const handleDepositFormSubmit = (data: FieldValues) => {
    setState(prevState => ({
      ...prevState,
      depositFormData: data,
    }))
    toNextStep()
  }

  return (
    <Match
      value={step}
      form={() => (
        <DepositForm
          selectedChainAction={state.selectedChainAction}
          onSelectChainAction={action =>
            setState(prevState => ({
              ...prevState,
              selectedChainAction: action,
            }))
          }
          onSubmit={handleDepositFormSubmit}
          chainActionOptions={chainActionOptions}
          chain={coinKey.chain}
        />
      )}
      verify={() => (
        <DepositVerify
          selectedChainAction={state.selectedChainAction}
          onBack={toPreviousStep}
          depositFormData={state.depositFormData}
        />
      )}
    />
  )
}
