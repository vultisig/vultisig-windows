import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'
import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'

export const FastReshareVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value="reshare">
      <ReshareVaultKeygenActionProvider>
        <FastVaultKeygenFlow />
      </ReshareVaultKeygenActionProvider>
    </CurrentKeygenTypeProvider>
  )
}
