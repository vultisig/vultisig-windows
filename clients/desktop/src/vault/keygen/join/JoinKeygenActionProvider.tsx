import { fromLibType } from '@core/mpc/types/utils/libType'
import { CreateVaultKeygenActionProvider as DKLSCreateKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { ReshareVaultKeygenActionProvider as DKLSReshareKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'

import { MigrateVaultKeygenActionProvider } from '../../migrate/MigrateVaultKeygenActionProvider'
import { CreateVaultLegacyKeygenActionProvider as GG20CreateKeygenActionProvider } from '../create/CreateVaultLegacyKeygenActionProvider'
import { ReshareVaultLegacyKeygenActionProvider as GG20ReshareKeygenActionProvider } from '../reshare/ReshareVaultLegacyKeygenActionProvider'

export const JoinKeygenActionProvider = ({ children }: ChildrenProp) => {
  const { keygenType, keygenMsg } = useCorePathState<'joinKeygen'>()
  const { libType } = keygenMsg
  const mpcLib = fromLibType(libType)

  return (
    <Match
      value={keygenType}
      create={() => (
        <Match
          value={mpcLib}
          DKLS={() => (
            <DKLSCreateKeygenActionProvider>
              {children}
            </DKLSCreateKeygenActionProvider>
          )}
          GG20={() => (
            <GG20CreateKeygenActionProvider>
              {children}
            </GG20CreateKeygenActionProvider>
          )}
        />
      )}
      reshare={() => (
        <Match
          value={mpcLib}
          DKLS={() => (
            <DKLSReshareKeygenActionProvider>
              {children}
            </DKLSReshareKeygenActionProvider>
          )}
          GG20={() => (
            <GG20ReshareKeygenActionProvider>
              {children}
            </GG20ReshareKeygenActionProvider>
          )}
        />
      )}
      migrate={() => (
        <MigrateVaultKeygenActionProvider>
          {children}
        </MigrateVaultKeygenActionProvider>
      )}
    />
  )
}
