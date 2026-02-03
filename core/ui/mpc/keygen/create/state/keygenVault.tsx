import { KeygenVaultProvider } from '@core/ui/mpc/keygen/state/keygenVault'
import { ChildrenProp } from '@lib/ui/props'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { useVaultCreationInput } from '../state/vaultCreationInput'

export const CreateFlowKeygenVaultProvider = ({ children }: ChildrenProp) => {
  const input = useVaultCreationInput()

  const name = input ? getRecordUnionValue(input).name : ''

  return (
    <KeygenVaultProvider
      value={{
        newVault: { name },
      }}
    >
      {children}
    </KeygenVaultProvider>
  )
}
