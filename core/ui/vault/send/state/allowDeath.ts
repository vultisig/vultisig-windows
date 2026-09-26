import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

/**
 * The user's explicit choice to empty the sending account with a Substrate
 * `transfer_allow_death`. Off until the user turns it on, so a send never
 * reaps the account by default.
 */
export const useSendAllowDeathPreference = () => {
  const [state, setState] = useCoreViewState<'send'>()

  const setPreference = (allowDeath: boolean) => {
    setState(prev => ({ ...prev, allowDeath }))
  }

  return [state.allowDeath ?? false, setPreference] as const
}
