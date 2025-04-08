import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'

export const SecureReshareVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'reshare'}>
      <SecureVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
