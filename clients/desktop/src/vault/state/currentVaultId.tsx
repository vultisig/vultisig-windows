import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'
import {
  CurrentVaultId,
  CurrentVaultIdProvider as CoreCurrentVaultIdProvider,
  getInitialVaultId,
  useCurrentVaultIdCorrector,
} from '@core/ui/vault/state/currentVaultId'
import { SetCurrentVaultIdProvider as CoreSetCurrentVaultIdProvider } from '@core/ui/vault/state/setCurrentVaultId'
import { useVaults } from '@core/ui/vault/state/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { useStateCorrector } from '@lib/ui/state/useStateCorrector'
import { Dispatch, SetStateAction } from 'react'
import React from 'react'

import { usePersistentState } from '../../state/persistentState'

const useCurrentVaultId = (): [
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

export const SetCurrentVaultIdProvider = ({ children }: ChildrenProp) => {
  const [, setCurrentVaultId] = useCurrentVaultId()

  return (
    <CoreSetCurrentVaultIdProvider value={setCurrentVaultId}>
      {children}
    </CoreSetCurrentVaultIdProvider>
  )
}
