import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'

export const SecureMigrateVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'migrate'}>
      <SecureVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
