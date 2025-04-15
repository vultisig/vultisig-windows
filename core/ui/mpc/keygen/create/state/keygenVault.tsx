import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { KeygenVaultProvider } from '@core/ui/mpc/keygen/state/keygenVault'
import { ChildrenProp } from '@lib/ui/props'

export const CreateFlowKeygenVaultProvider = ({ children }: ChildrenProp) => {
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
