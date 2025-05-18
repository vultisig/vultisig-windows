import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { ServerEmailStep } from '@core/ui/mpc/keygen/create/fast/server/email/ServerEmailStep'
import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { SetServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/SetServerPasswordStep'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { FastKeygenServerStep } from '../../fast/FastKeygenServerStep'
import { ReshareKeygenFlow } from '../ReshareKeygenFlow'

const reshareVaultSteps = ['email', 'password', 'server', 'keygen'] as const

export const FastVaultReshareFlow = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  const { signers, localPartyId } = useCurrentVault()

  return (
    <>
      <Match
        value={step}
        email={() => <ServerEmailStep onFinish={toNextStep} />}
        password={() =>
          hasServer(signers) && !isServer(localPartyId) ? (
            <ServerPasswordStep onFinish={toNextStep} />
          ) : (
            <SetServerPasswordStep onFinish={toNextStep} />
          )
        }
        server={() => (
          <FastKeygenServerStep onBack={toPreviousStep} onFinish={toNextStep} />
        )}
        keygen={() => <ReshareKeygenFlow onBack={toPreviousStep} />}
      />
    </>
  )
}
