import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'

export const FastReshareVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'reshare'}>
      <FastVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
