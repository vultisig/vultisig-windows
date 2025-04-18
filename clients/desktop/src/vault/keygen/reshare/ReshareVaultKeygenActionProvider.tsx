import { ReshareVaultKeygenActionProvider as DKLSKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'

import { ReshareVaultLegacyKeygenActionProvider as GG20KeygenActionProvider } from './ReshareVaultLegacyKeygenActionProvider'

export const ReshareVaultKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
  const { libType } = useCurrentVault()

  return (
    <Match
      value={libType}
      DKLS={() => (
        <DKLSKeygenActionProvider>{children}</DKLSKeygenActionProvider>
      )}
      GG20={() => (
        <GG20KeygenActionProvider>{children}</GG20KeygenActionProvider>
      )}
    />
  )
}
