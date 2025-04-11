import { ReshareVaultKeygenActionProvider as DKLSKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'

import { useVaultCreationMpcLib } from '../../../mpc/state/vaultCreationMpcLib'
import { ReshareVaultLegacyKeygenActionProvider as GG20KeygenActionProvider } from './ReshareVaultLegacyKeygenActionProvider'

export const ReshareVaultKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
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
