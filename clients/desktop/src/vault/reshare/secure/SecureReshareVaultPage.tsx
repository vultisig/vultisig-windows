import { KeygenType } from '@core/mpc/keygen/KeygenType'

import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'

export const SecureReshareVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={KeygenType.Reshare}>
      <SecureVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
