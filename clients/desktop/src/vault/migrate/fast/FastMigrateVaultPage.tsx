import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'

export const FastMigrateVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'migrate'}>
      <FastVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
