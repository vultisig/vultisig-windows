import { SetCurrentVaultIdProvider as SetCurrentVaultIdProviderBase } from '@core/ui/vault/state/setCurrentVaultId'
import { ChildrenProp } from '@lib/ui/props'

import { useCurrentVaultIdMutation } from './currentVaultId'

export const SetCurrentVaultIdProvider = ({ children }: ChildrenProp) => {
  const { mutateAsync } = useCurrentVaultIdMutation()

  return (
    <SetCurrentVaultIdProviderBase value={mutateAsync}>
      {children}
    </SetCurrentVaultIdProviderBase>
  )
}
