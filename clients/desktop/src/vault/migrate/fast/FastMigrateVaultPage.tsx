import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'

export const FastMigrateVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'migrate'}>
      <FastVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
