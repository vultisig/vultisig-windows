import { coinKeyFromString } from '@core/chain/coin/Coin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'

import { useAppPathParams } from '../../navigation/hooks/useAppPathParams'
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack'
import { ChainAction, chainActionsRecord } from './ChainAction'
import { DepositEnabledChain } from './DepositEnabledChain'
import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'
import {
  DepositChainSpecificProvider,
  useDepositChainSpecific,
} from './fee/DepositChainSpecificProvider'

const depositSteps = ['form', 'verify'] as const

export const DepositPageController = () => {
  const [{ coin: coinName }] = useAppPathParams<'deposit'>()
  const { chain: chain } = coinKeyFromString(coinName)
  const chainActionOptions = chainActionsRecord[chain as DepositEnabledChain]

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

  const chainSpecific = useDepositChainSpecific()

  return (
    <DepositChainSpecificProvider>
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
            chain={chain}
          />
        )}
        verify={() => (
          <DepositVerify
            selectedChainAction={state.selectedChainAction}
            onBack={toPreviousStep}
            depositFormData={state.depositFormData}
            fee={getFeeAmount(chainSpecific)}
          />
        )}
      />
    </DepositChainSpecificProvider>
  )
}
