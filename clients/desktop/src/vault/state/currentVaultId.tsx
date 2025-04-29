import {
  CurrentVaultId,
  CurrentVaultIdProvider as CoreCurrentVaultIdProvider,
  getInitialVaultId,
  useCurrentVaultIdCorrector,
} from '@core/ui/vault/state/currentVaultId'
import { useVaults } from '@core/ui/vault/state/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { useStateCorrector } from '@lib/ui/state/useStateCorrector'
import { Dispatch, SetStateAction } from 'react'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

export const useCurrentVaultId = (): [
  CurrentVaultId,
  Dispatch<SetStateAction<CurrentVaultId>>,
] => {
  const vaults = useVaults()

  const [currentVaultId, setCurrentVaultId] = useStateCorrector(
    usePersistentState<CurrentVaultId>(
      PersistentStateKey.CurrentVaultId,
      getInitialVaultId(vaults)
    ),
    useCurrentVaultIdCorrector()
  )

  return [currentVaultId, setCurrentVaultId]
}

export const CurrentVaultIdProvider = ({ children }: ChildrenProp) => {
  const [currentVaultId] = useCurrentVaultId()

  return (
    <CoreCurrentVaultIdProvider value={currentVaultId}>
      {children}
    </CoreCurrentVaultIdProvider>
  )
}
