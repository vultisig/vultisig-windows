import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { ChildrenProp } from '@lib/ui/props'

import { KeyImportChainsProvider } from './state/keyImportChains'
import { KeyImportInput, KeyImportInputProvider } from './state/keyImportInput'

type Props = ChildrenProp & {
  keyImportInput: KeyImportInput
}

export const KeyImportConfigProviders = ({
  keyImportInput,
  children,
}: Props) => (
  <KeyImportInputProvider value={keyImportInput}>
    <KeyImportChainsProvider value={keyImportInput.chains}>
      <KeygenOperationProvider value={{ keyimport: true }}>
        {children}
      </KeygenOperationProvider>
    </KeyImportChainsProvider>
  </KeyImportInputProvider>
)
