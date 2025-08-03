import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'

import { ChainAction } from './ChainAction'
import { DepositEnabledChain } from './DepositEnabledChain'
import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'
import { useFilteredChainActions } from './hooks/useFilteredChainActions'
import { useDepositCoin } from './state/coin'

const depositSteps = ['form', 'verify'] as const

export const DepositPage = () => {
  const coin = useDepositCoin()
  const filteredChainActionOptions = useFilteredChainActions(
    coin.chain as DepositEnabledChain
  )

  const [state, setState] = useState<{
    depositFormData: FieldValues
    selectedChainAction: ChainAction
  }>({
    depositFormData: {},
    selectedChainAction: filteredChainActionOptions[0] as ChainAction,
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
          chainActionOptions={filteredChainActionOptions}
          chain={coin.chain}
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
