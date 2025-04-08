import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'

export const SecureMigrateVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'migrate'}>
      <SecureVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
