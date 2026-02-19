import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { VaultEmailStep } from '../steps/VaultEmailStep'
import { VaultNameStep } from '../steps/VaultNameStep'
import { VaultPasswordStep } from '../steps/VaultPasswordStep'
import { FastVaultCreationInput } from '../VaultCreationInput'

type FastVaultSetupFlowProps = OnFinishProp<FastVaultCreationInput> &
  Partial<OnBackProp>

export const FastVaultSetupFlow = ({
  onFinish,
  onBack,
}: FastVaultSetupFlowProps) => (
  <ValueTransfer<{ name: string; referral?: string }>
    from={({ onFinish }) => (
      <VaultNameStep onFinish={onFinish} onBack={onBack} />
    )}
    to={({ value: nameData, onBack: goBackToName }) => (
      <ValueTransfer<string>
        from={({ onFinish }) => (
          <VaultEmailStep onFinish={onFinish} onBack={goBackToName} />
        )}
        to={({ value: email, onBack: goBackToEmail }) => (
          <VaultPasswordStep
            onBack={goBackToEmail}
            onFinish={({ password, hint }) =>
              onFinish({
                ...nameData,
                email,
                password,
                hint,
              })
            }
          />
        )}
      />
    )}
  />
)
