import { KeygenVaultProvider } from '@core/ui/mpc/keygen/state/keygenVault'
import { ChildrenProp } from '@lib/ui/props'

import { useVaultName } from '../state/vaultName'

export const CreateKeygenVaultProvider = ({ children }: ChildrenProp) => {
  const [name] = useVaultName()

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
