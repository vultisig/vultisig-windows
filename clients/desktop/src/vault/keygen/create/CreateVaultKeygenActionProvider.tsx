import { CreateVaultKeygenActionProvider as DKLSKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'

import { useVaultCreationMpcLib } from '../../../mpc/state/vaultCreationMpcLib'
import { CreateVaultLegacyKeygenActionProvider as GG20KeygenActionProvider } from './CreateVaultLegacyKeygenActionProvider'

export const CreateVaultKeygenActionProvider = ({ children }: ChildrenProp) => {
  const [mpcLib] = useVaultCreationMpcLib()

  return (
    <Match
      value={mpcLib}
      DKLS={() => (
        <DKLSKeygenActionProvider>{children}</DKLSKeygenActionProvider>
      )}
      GG20={() => (
        <GG20KeygenActionProvider>{children}</GG20KeygenActionProvider>
      )}
    />
  )
}
