import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'

export const SecureReshareVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'reshare'}>
      <SecureVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
