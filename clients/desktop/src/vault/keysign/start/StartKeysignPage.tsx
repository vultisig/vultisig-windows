import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { Match } from '@lib/ui/base/Match'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { KeysignActionProvider } from '../action/KeysignActionProvider'
import { StartFastKeysignFlow } from './fast/StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignPage = () => {
  const { securityType } = useCorePathState<'keysign'>()

  return (
    <StartKeysignProviders>
      <MpcPeersSelectionProvider>
        <KeysignActionProvider>
          <MpcMediatorManager />
          <Match
            value={securityType}
            secure={() => <StartSecureKeysignFlow />}
            fast={() => <StartFastKeysignFlow />}
          />
        </KeysignActionProvider>
      </MpcPeersSelectionProvider>
    </StartKeysignProviders>
  )
}
