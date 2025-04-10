import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'
import { MigrateVaultKeygenActionProvider } from '../MigrateVaultKeygenActionProvider'

export const FastMigrateVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'migrate'}>
      <MigrateVaultKeygenActionProvider>
        <FastVaultKeygenFlow />
      </MigrateVaultKeygenActionProvider>
    </CurrentKeygenTypeProvider>
  )
}
