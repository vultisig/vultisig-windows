import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ChildrenProp, OnBackProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { KeygenFlow } from '../../flow/KeygenFlow'
import { KeygenActionWrapper } from '../KeygenActionWrapper'
import { KeygenSessionProviders } from '../KeygenSessionProviders'

const SecureVaultKeygenFlowContent = ({ onBack }: OnBackProp) => {
  return (
    <StepTransition
      from={({ onFinish }) => (
        <KeygenPeerDiscoveryStep onBack={onBack} onFinish={onFinish} />
      )}
      to={({ onBack: toFirst }) => (
        <StartMpcSessionFlow
          value="keygen"
          render={() => <KeygenFlow onBack={toFirst} />}
        />
      )}
    />
  )
}

type SecureVaultKeygenFlowProps = OnBackProp &
  Partial<ChildrenProp> & {
    CreateActionProvider?: ComponentType<ChildrenProp>
  }

export const SecureVaultKeygenFlow = ({
  onBack,
  children,
  CreateActionProvider,
}: SecureVaultKeygenFlowProps) => {
  return (
    <KeygenSessionProviders>
      {children}
      <KeygenActionWrapper CreateActionProvider={CreateActionProvider}>
        <SecureVaultKeygenFlowContent onBack={onBack} />
      </KeygenActionWrapper>
    </KeygenSessionProviders>
  )
}
