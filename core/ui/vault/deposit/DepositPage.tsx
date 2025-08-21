import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'

import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { useCore } from '../../state/core'
import { useCurrentVaultCoin } from '../state/currentVaultCoins'
import { ChainAction } from './ChainAction'
import { DepositEnabledChain } from './DepositEnabledChain'
import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'
import { useFilteredChainActions } from './hooks/useFilteredChainActions'
import { DepositCoinProvider } from './providers/DepositCoinProvider'

const depositSteps = ['form', 'verify'] as const

export const DepositPage = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = useCurrentVaultCoin(coinKey)

  const filteredChainActionOptions = useFilteredChainActions(
    coin.chain as DepositEnabledChain
  )

  const { goBack } = useCore()
  const [state, setState] = useState<{
    depositFormData: FieldValues
    selectedChainAction: ChainAction
  }>({
    depositFormData: {},
    selectedChainAction: filteredChainActionOptions[0],
  })

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
    <DepositCoinProvider
      initialCoin={coin}
      action={filteredChainActionOptions[0]}
    >
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
    </DepositCoinProvider>
  )
}
