import { KeygenVaultProvider } from '@core/ui/mpc/keygen/state/keygenVault'
import { CurrentHexChainCodeProvider } from '@core/ui/mpc/state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import {
  useCurrentVault,
  useVaultServerStatus,
} from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { ReshareVerifyStep } from '../../reshare/shared/ReshareVerifyStep'
import { ServerEmailStep } from '../../server/email/ServerEmailStep'
import { ServerPasswordStep } from '../../server/password/ServerPasswordStep'
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep'
import { KeygenServerStep } from './KeygenServerStep'

const reshareVaultSteps = [
  'email',
  'password',
  'joinSession',
  'server',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const

export const FastVaultKeygenFlow = () => {
  const vault = useCurrentVault()
  const { localPartyId, hexChainCode } = vault

  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  const { hasServer, isBackup } = useVaultServerStatus()

  return (
    <CurrentHexChainCodeProvider value={hexChainCode}>
      <MpcServerTypeProvider initialValue="relay">
        <ServerUrlDerivedFromServerTypeProvider>
          <MpcLocalPartyIdProvider value={localPartyId}>
            <KeygenVaultProvider value={{ existingVault: vault }}>
              <MpcMediatorManager />
              <Match
                value={step}
                email={() => <ServerEmailStep onForward={toNextStep} />}
                password={() =>
                  hasServer && !isBackup ? (
                    <ServerPasswordStep onForward={toNextStep} />
                  ) : (
                    <SetServerPasswordStep onForward={toNextStep} />
                  )
                }
                server={() => <KeygenServerStep onFinish={toNextStep} />}
                joinSession={() => (
                  <JoinKeygenSessionStep onForward={toNextStep} />
                )}
                peers={() => <KeygenPeerDiscoveryStep onForward={toNextStep} />}
                verify={() => (
                  <ReshareVerifyStep
                    onBack={toPreviousStep}
                    onForward={toNextStep}
                  />
                )}
                startSession={() => (
                  <KeygenStartSessionStep
                    onBack={toPreviousStep}
                    onForward={toNextStep}
                  />
                )}
                keygen={() => <KeygenFlow onBack={() => setStep('verify')} />}
              />
            </KeygenVaultProvider>
          </MpcLocalPartyIdProvider>
        </ServerUrlDerivedFromServerTypeProvider>
      </MpcServerTypeProvider>
    </CurrentHexChainCodeProvider>
  )
}
