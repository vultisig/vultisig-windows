import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { StartFastKeysignFlow } from './fast/StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignPage = () => {
  const securityType = useCurrentVaultSecurityType()

  return (
    <StartKeysignProviders>
      <MpcMediatorManager />
      <Match
        value={securityType}
        secure={() => <StartSecureKeysignFlow />}
        fast={() => <StartFastKeysignFlow />}
      />
    </StartKeysignProviders>
  )
}
