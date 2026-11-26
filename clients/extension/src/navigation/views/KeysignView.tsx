import { ExpandViewGuard } from '@clients/extension/src/components/expand-view-guard'
import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'

/**
 * Starts a keysign. A Secure Vault keysign moves to an expanded tab first so
 * the session outlives the toolbar popup; a Fast Vault keysign finishes
 * quickly on its own and stays where it is.
 */
export const KeysignView = () => {
  const [{ securityType }] = useCoreViewState<'keysign'>()

  if (securityType === 'secure') {
    return (
      <ExpandViewGuard>
        <StartKeysignView />
      </ExpandViewGuard>
    )
  }

  return <StartKeysignView />
}
