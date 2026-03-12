import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { useCore } from '@core/ui/state/core'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ChildrenProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { KeygenActionWrapper } from '../KeygenActionWrapper'
import { KeygenSessionProviders } from '../KeygenSessionProviders'
import { VaultCreationInputProvider } from '../state/vaultCreationInput'
import { FastVaultCreationInput } from '../VaultCreationInput'
import { FastVaultSetupFlow } from './FastVaultSetupFlow'

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
        <FastVaultSetupFlow onFinish={onFinish} onBack={goBack} />
      )}
      to={({ value, onBack }) => (
        <VaultCreationInputProvider value={{ fast: value }}>
          <KeygenSessionProviders>
            {children}
            <KeygenActionWrapper CreateActionProvider={CreateActionProvider}>
              <FastKeygenFlow
                onBack={onBack}
                password={value.password}
                onChangeEmailAndRestart={onBack}
              />
            </KeygenActionWrapper>
          </KeygenSessionProviders>
        </VaultCreationInputProvider>
      )}
    />
  )
}
