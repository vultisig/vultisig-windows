import { CreateVaultKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'

export const JoinKeygenActionProvider = ({ children }: ChildrenProp) => {
  const { keygenType } = useCorePathState<'joinKeygen'>()

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
