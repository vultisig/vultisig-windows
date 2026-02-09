import { useCore } from '@core/ui/state/core'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ChildrenProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { VaultCreationInputProvider } from '../state/vaultCreationInput'
import { SecureVaultCreationInput } from '../VaultCreationInput'
import { VaultSetupForm } from '../VaultSetupForm'
import { SecureVaultKeygenFlow } from './SecureVaultKeygenFlow'

type CreateSecureVaultFlowProps = Partial<ChildrenProp> & {
  CreateActionProvider?: ComponentType<ChildrenProp>
}

export const CreateSecureVaultFlow = ({
  children,
  CreateActionProvider,
}: CreateSecureVaultFlowProps) => {
  const { goBack } = useCore()

  return (
    <ValueTransfer<SecureVaultCreationInput>
      from={({ onFinish }) => (
        <VaultSetupForm
          vaultSecurityType="secure"
          onBack={goBack}
          onSubmit={onFinish}
        />
      )}
      to={({ value, onBack }) => (
        <VaultCreationInputProvider value={{ secure: value }}>
          <SecureVaultKeygenFlow
            onBack={onBack}
            CreateActionProvider={CreateActionProvider}
          >
            {children}
          </SecureVaultKeygenFlow>
        </VaultCreationInputProvider>
      )}
    />
  )
}
