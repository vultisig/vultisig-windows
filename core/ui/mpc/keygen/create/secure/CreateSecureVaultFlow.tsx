import { useCore } from '@core/ui/state/core'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ChildrenProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { TargetDeviceCountProvider } from '../../state/targetDeviceCount'
import { VaultCreationInputProvider } from '../state/vaultCreationInput'
import { SecureVaultCreationInput } from '../VaultCreationInput'
import { SecureVaultKeygenFlow } from './SecureVaultKeygenFlow'
import { SecureVaultSetupFlow } from './SecureVaultSetupFlow'

type CreateSecureVaultFlowProps = Partial<ChildrenProp> & {
  CreateActionProvider?: ComponentType<ChildrenProp>
  deviceCount?: number
}

export const CreateSecureVaultFlow = ({
  children,
  CreateActionProvider,
  deviceCount,
}: CreateSecureVaultFlowProps) => {
  const { goBack } = useCore()

  return (
    <ValueTransfer<SecureVaultCreationInput>
      from={({ onFinish }) => (
        <SecureVaultSetupFlow onFinish={onFinish} onBack={goBack} />
      )}
      to={({ value, onBack }) => {
        const content = (
          <VaultCreationInputProvider value={{ secure: value }}>
            <SecureVaultKeygenFlow
              onBack={onBack}
              CreateActionProvider={CreateActionProvider}
            >
              {children}
            </SecureVaultKeygenFlow>
          </VaultCreationInputProvider>
        )

        return deviceCount ? (
          <TargetDeviceCountProvider value={deviceCount}>
            {content}
          </TargetDeviceCountProvider>
        ) : (
          content
        )
      }}
    />
  )
}
