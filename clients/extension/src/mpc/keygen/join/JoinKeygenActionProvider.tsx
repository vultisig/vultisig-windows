import { CreateVaultKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'

export const JoinKeygenActionProvider = ({ children }: ChildrenProp) => {
  const [{ operationType }] = useCoreViewState<'joinKeygen'>()

  return (
    <Match
      value={operationType.operation}
      create={() => (
        <CreateVaultKeygenActionProvider>
          {children}
        </CreateVaultKeygenActionProvider>
      )}
      reshare={() => (
        <ReshareVaultKeygenActionProvider>
          {children}
        </ReshareVaultKeygenActionProvider>
      )}
    />
  )
}
