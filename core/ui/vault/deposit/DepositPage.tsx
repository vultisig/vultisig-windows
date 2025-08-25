import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'

import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { useCore } from '../../state/core'
import { useCurrentVaultCoin } from '../state/currentVaultCoins'
import { DepositEnabledChain } from './DepositEnabledChain'
import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'
import { useFilteredChainActions } from './hooks/useFilteredChainActions'
import { DepositActionProvider } from './providers/DepositActionProvider'
import { DepositCoinProvider } from './providers/DepositCoinProvider'

const depositSteps = ['form', 'verify'] as const

export const DepositPage = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = useCurrentVaultCoin(coinKey)

  const filteredChainActionOptions = useFilteredChainActions(
    coin.chain as DepositEnabledChain
  )

  const initialAction = filteredChainActionOptions[0]

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
    <DepositActionProvider initialValue={initialAction}>
      <DepositCoinProvider initialCoin={coin}>
        <Match
          value={step}
          form={() => (
            <DepositForm
              onSubmit={handleDepositFormSubmit}
              chainActionOptions={filteredChainActionOptions}
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
      </DepositCoinProvider>
    </DepositActionProvider>
  )
}
