import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ChildrenProp, OnBackProp } from '@lib/ui/props'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { ComponentType } from 'react'

import { KeygenFlow } from '../../flow/KeygenFlow'
import { KeygenActionWrapper } from '../KeygenActionWrapper'
import { KeygenSessionProviders } from '../KeygenSessionProviders'

const SecureVaultKeygenFlowContent = ({
  onBack,
  onKeygenError,
  onVaultSaveError,
  onVaultSaved,
}: OnBackProp & {
  onKeygenError?: (error: Error) => void | Promise<void>
  onVaultSaveError?: (error: Error) => void | Promise<void>
  onVaultSaved?: (vault: Vault) => void | Promise<void>
}) => {
  return (
    <StepTransition
      from={({ onFinish }) => (
        <KeygenPeerDiscoveryStep onBack={onBack} onFinish={onFinish} />
      )}
      to={({ onBack: toFirst }) => (
        <StartMpcSessionFlow
          value="keygen"
          render={() => (
            <KeygenFlow
              onBack={toFirst}
              onKeygenError={onKeygenError}
              onVaultSaveError={onVaultSaveError}
              onVaultSaved={onVaultSaved}
            />
          )}
        />
      )}
    />
  )
}

type SecureVaultKeygenFlowProps = OnBackProp &
  Partial<ChildrenProp> & {
    CreateActionProvider?: ComponentType<ChildrenProp>
    onKeygenError?: (error: Error) => void | Promise<void>
    onVaultSaveError?: (error: Error) => void | Promise<void>
    onVaultSaved?: (vault: Vault) => void | Promise<void>
  }

export const SecureVaultKeygenFlow = ({
  onBack,
  children,
  CreateActionProvider,
  onKeygenError,
  onVaultSaveError,
  onVaultSaved,
}: SecureVaultKeygenFlowProps) => {
  return (
    <KeygenSessionProviders>
      {children}
      <KeygenActionWrapper CreateActionProvider={CreateActionProvider}>
        <SecureVaultKeygenFlowContent
          onBack={onBack}
          onKeygenError={onKeygenError}
          onVaultSaveError={onVaultSaveError}
          onVaultSaved={onVaultSaved}
        />
      </KeygenActionWrapper>
    </KeygenSessionProviders>
  )
}
