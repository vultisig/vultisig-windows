import { KeygenType } from '@core/mpc/keygen/KeygenType'

import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'

export const SecureMigrateVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={KeygenType.Migrate}>
      <SecureVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
