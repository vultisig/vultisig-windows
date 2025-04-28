import { SetCurrentVaultIdProvider as SetCurrentVaultIdProviderBase } from '@core/ui/vault/state/setCurrentVaultId'
import { ChildrenProp } from '@lib/ui/props'

import { setCurrentVaultId } from './currentVaultId'

export const SetCurrentVaultIdProvider = ({ children }: ChildrenProp) => {
  return (
    <SetCurrentVaultIdProviderBase value={setCurrentVaultId}>
      {children}
    </SetCurrentVaultIdProviderBase>
  )
}
