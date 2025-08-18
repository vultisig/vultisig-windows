import { CreateVaultNameStep } from '@core/ui/mpc/keygen/create/CreateVaultNameStep'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { StartMpcSessionFlow } from '../../../session/StartMpcSessionFlow'

const steps = ['name', 'peers', 'keygen'] as const

const lastEditableStep = steps[0]

export const CreateSecureVaultFlow = () => {
  const { goBack } = useCore()
  const { step, setStep, toNextStep } = useStepNavigation({
    steps,
    onExit: goBack,
  })

  return (
    <Match
      value={step}
      name={() => <CreateVaultNameStep onFinish={toNextStep} />}
      peers={() => (
        <KeygenPeerDiscoveryStep
          onBack={() => setStep(steps[0])}
          onFinish={toNextStep}
        />
      )}
      keygen={() => (
        <StartMpcSessionFlow
          value="keygen"
          render={() => <KeygenFlow onBack={() => setStep(lastEditableStep)} />}
        />
      )}
    />
  )
}
