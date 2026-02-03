import { CreateVaultKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { KeyImportKeygenActionProvider } from '@core/ui/mpc/keygen/keyimport/KeyImportKeygenActionProvider'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { ChildrenProp } from '@lib/ui/props'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { ComponentType, ReactNode } from 'react'

import { ReshareVaultKeygenActionProvider } from '../reshare/ReshareVaultKeygenActionProvider'

type KeygenActionWrapperProps = ChildrenProp & {
  CreateActionProvider?: ComponentType<ChildrenProp>
}

export const KeygenActionWrapper = ({
  children,
  CreateActionProvider = CreateVaultKeygenActionProvider,
}: KeygenActionWrapperProps): ReactNode => {
  const keygenOperation = useKeygenOperation()

  return matchRecordUnion(keygenOperation, {
    create: () => <CreateActionProvider>{children}</CreateActionProvider>,
    keyimport: () => (
      <KeyImportKeygenActionProvider>{children}</KeyImportKeygenActionProvider>
    ),
    reshare: () => (
      <ReshareVaultKeygenActionProvider>
        {children}
      </ReshareVaultKeygenActionProvider>
    ),
  })
}
