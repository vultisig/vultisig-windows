import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'
import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'

export const SecureReshareVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value="reshare">
      <ReshareVaultKeygenActionProvider>
        <SecureVaultKeygenFlow />
      </ReshareVaultKeygenActionProvider>
    </CurrentKeygenTypeProvider>
  )
}
