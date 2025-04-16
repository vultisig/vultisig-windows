import { SetCurrentVaultIdProvider as SetCurrentVaultIdProviderBase } from '@core/ui/vault/state/setCurrentVaultId'
import { ChildrenProp } from '@lib/ui/props'

import { useCurrentVaultId } from './currentVaultId'

export const SetCurrentVaultIdProvider = ({ children }: ChildrenProp) => {
  const [, setCurrentVaultId] = useCurrentVaultId()

  return (
    <SetCurrentVaultIdProviderBase value={setCurrentVaultId}>
      {children}
    </SetCurrentVaultIdProviderBase>
  )
}
