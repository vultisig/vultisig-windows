import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { PasswordProvider } from '@core/ui/state/password'
import { WaitForServerToJoinStep } from '@core/ui/vault/server/components/WaitForServerToJoinStep'
import { ServerPasswordStep } from '@core/ui/vault/server/password/ServerPasswordStep'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { useAppPathState } from '../../../../navigation/hooks/useAppPathState'
import { KeysignSigningStep } from '../../shared/KeysignSigningStep'
import { FastKeysignServerStep } from './FastKeysignServerStep'

const keysignSteps = ['password', 'server', 'keysign'] as const

export const StartFastKeysignFlow = () => {
  const { keysignPayload } = useAppPathState<'fastKeysign'>()

  const { step, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  return (
    <PasswordProvider initialValue="">
      <Match
        value={step}
        password={() => <ServerPasswordStep onFinish={toNextStep} />}
        server={() => <FastKeysignServerStep onFinish={toNextStep} />}
        keysign={() => (
          <ValueTransfer<string[]>
            from={({ onFinish }) => (
              <WaitForServerToJoinStep onFinish={onFinish} />
            )}
            to={({ value }) => (
              <MpcPeersProvider value={value}>
                <StartMpcSessionFlow
                  render={() => <KeysignSigningStep payload={keysignPayload} />}
                />
              </MpcPeersProvider>
            )}
          />
        )}
      />
    </PasswordProvider>
  )
}
