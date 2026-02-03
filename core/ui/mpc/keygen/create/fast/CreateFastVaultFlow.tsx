import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { useCore } from '@core/ui/state/core'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ChildrenProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { KeygenActionWrapper } from '../KeygenActionWrapper'
import { KeygenSessionProviders } from '../KeygenSessionProviders'
import { VaultCreationInputProvider } from '../state/vaultCreationInput'
import { FastVaultCreationInput } from '../VaultCreationInput'
import { VaultSetupForm } from '../VaultSetupForm'

type CreateFastVaultFlowProps = Partial<ChildrenProp> & {
  CreateActionProvider?: ComponentType<ChildrenProp>
}

export const CreateFastVaultFlow = ({
  children,
  CreateActionProvider,
}: CreateFastVaultFlowProps) => {
  const { goBack } = useCore()

  return (
    <ValueTransfer<FastVaultCreationInput>
      from={({ onFinish }) => (
        <VaultSetupForm
          vaultSecurityType="fast"
          onBack={goBack}
          onSubmit={onFinish}
        />
      )}
      to={({ value, onBack }) => (
        <VaultCreationInputProvider value={{ fast: value }}>
          <KeygenSessionProviders>
            {children}
            <KeygenActionWrapper CreateActionProvider={CreateActionProvider}>
              <FastKeygenFlow onBack={onBack} password={value.password} />
            </KeygenActionWrapper>
          </KeygenSessionProviders>
        </VaultCreationInputProvider>
      )}
    />
  )
}
