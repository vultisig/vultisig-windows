import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'

import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { useCore } from '../../state/core'
import { useCurrentVaultCoin } from '../state/currentVaultCoins'
import { DepositCoinManager } from './DepositCoinManager'
import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'
import { useAvailableChainActions } from './hooks/useAvailableChainActions'
import { DepositActionProvider } from './providers/DepositActionProvider'

const depositSteps = ['form', 'verify'] as const

export const DepositFlowController = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = useCurrentVaultCoin(coinKey)

  const availableActions = useAvailableChainActions()

  const { goBack } = useCore()
  const [state, setState] = useState<FieldValues>({})

  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: depositSteps,
    onExit: goBack,
  })

  const handleDepositFormSubmit = (data: FieldValues) => {
    setState(prevState => ({
      ...prevState,
      depositFormData: data,
    }))
    toNextStep()
  }

  return (
    <DepositActionProvider initialValue={availableActions[0]}>
      <DepositCoinManager>
        <Match
          value={step}
          form={() => (
            <DepositForm
              onSubmit={handleDepositFormSubmit}
              chainActionOptions={availableActions}
              chain={coin.chain}
            />
          )}
          verify={() => (
            <DepositVerify
              onBack={toPreviousStep}
              depositFormData={state.depositFormData}
            />
          )}
        />
      </DepositCoinManager>
    </DepositActionProvider>
  )
}
