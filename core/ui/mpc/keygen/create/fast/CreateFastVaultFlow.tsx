import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { useCore } from '@core/ui/state/core'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ChildrenProp } from '@lib/ui/props'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { ComponentType } from 'react'

import { KeygenActionWrapper } from '../KeygenActionWrapper'
import { KeygenSessionProviders } from '../KeygenSessionProviders'
import { VaultCreationInputProvider } from '../state/vaultCreationInput'
import { FastVaultCreationInput } from '../VaultCreationInput'
import { FastVaultSetupFlow } from './FastVaultSetupFlow'

type CreateFastVaultFlowProps = Partial<ChildrenProp> & {
  CreateActionProvider?: ComponentType<ChildrenProp>
  onKeygenError?: (error: Error) => void | Promise<void>
  onVaultSaveError?: (error: Error) => void | Promise<void>
  onVaultSaved?: (vault: Vault) => void | Promise<void>
}

export const CreateFastVaultFlow = ({
  children,
  CreateActionProvider,
  onKeygenError,
  onVaultSaveError,
  onVaultSaved,
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
                onKeygenError={onKeygenError}
                onVaultSaveError={onVaultSaveError}
                onVaultSaved={onVaultSaved}
              />
            </KeygenActionWrapper>
          </KeygenSessionProviders>
        </VaultCreationInputProvider>
      )}
    />
  )
}
