import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { VaultNameStep } from '../steps/VaultNameStep'
import { SecureVaultCreationInput } from '../VaultCreationInput'

type SecureVaultSetupFlowProps = OnFinishProp<SecureVaultCreationInput> &
  Partial<OnBackProp>

export const SecureVaultSetupFlow = ({
  onFinish,
  onBack,
}: SecureVaultSetupFlowProps) => (
  <VaultNameStep onFinish={onFinish} onBack={onBack} />
)
