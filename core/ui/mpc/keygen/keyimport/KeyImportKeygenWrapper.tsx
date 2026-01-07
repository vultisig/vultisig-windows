import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { ChildrenProp } from '@lib/ui/props'

import { KeyImportKeygenActionProvider } from './KeyImportKeygenActionProvider'
import { KeyImportInput, KeyImportInputProvider } from './state/keyImportInput'

type Props = ChildrenProp & {
  keyImportInput: KeyImportInput
}

export const KeyImportKeygenWrapper = ({ keyImportInput, children }: Props) => (
  <KeyImportInputProvider value={keyImportInput}>
    <KeygenOperationProvider value={{ keyimport: true }}>
      <KeyImportKeygenActionProvider>{children}</KeyImportKeygenActionProvider>
    </KeygenOperationProvider>
  </KeyImportInputProvider>
)
