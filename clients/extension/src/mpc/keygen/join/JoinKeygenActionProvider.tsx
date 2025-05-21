import { CreateVaultKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'

export const JoinKeygenActionProvider = ({ children }: ChildrenProp) => {
  const [{ keygenType }] = useCoreViewState<'joinKeygen'>()

  if (keygenType === 'migrate') {
    throw new Error('Migrate keygen is not supported in extension')
  }

  return (
    <Match
      value={keygenType}
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
