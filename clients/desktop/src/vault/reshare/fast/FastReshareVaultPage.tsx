import { KeygenType } from '@core/mpc/keygen/KeygenType'

import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'

export const FastReshareVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={KeygenType.Reshare}>
      <FastVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
