import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

/**
 * Whether the send moves everything the balance can spend, decided when the
 * form is submitted. UTXO signers need it to sweep the inputs; see
 * `isUtxoMaxSend`.
 */
export const useSendMaxAmount = () => {
  const [state, setState] = useCoreViewState<'send'>()

  const setSendMaxAmount = (sendMaxAmount: boolean) => {
    setState(prev => ({ ...prev, sendMaxAmount }))
  }

  return [state.sendMaxAmount ?? false, setSendMaxAmount] as const
}
