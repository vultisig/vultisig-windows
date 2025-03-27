import { KeygenType } from '@core/mpc/keygen/KeygenType'

import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'

export const FastMigrateVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={KeygenType.Migrate}>
      <FastVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
