import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { fromLibType } from '@core/mpc/types/utils/libType'
import { CreateVaultKeygenActionProvider as DKLSCreateKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { ReshareVaultKeygenActionProvider as DKLSReshareKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { JSX } from 'react'

import { MigrateVaultKeygenActionProvider } from '../../migrate/MigrateVaultKeygenActionProvider'
import { CreateVaultLegacyKeygenActionProvider as GG20CreateKeygenActionProvider } from '../create/CreateVaultLegacyKeygenActionProvider'
import { ReshareVaultLegacyKeygenActionProvider as GG20ReshareKeygenActionProvider } from '../reshare/ReshareVaultLegacyKeygenActionProvider'

export const JoinKeygenActionProvider = ({ children }: ChildrenProp) => {
  const [{ keygenOperation, keygenMsg }] = useCoreViewState<'joinKeygen'>()
  const { libType } = keygenMsg
  const mpcLib = fromLibType(libType)

  return matchRecordUnion<KeygenOperation, JSX.Element>(keygenOperation, {
    create: () => (
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
    ),
    reshare: reshareType => (
      <Match
        value={reshareType}
        migrate={() => (
          <MigrateVaultKeygenActionProvider>
            {children}
          </MigrateVaultKeygenActionProvider>
        )}
        plugin={() => (
          <DKLSReshareKeygenActionProvider>
            {children}
          </DKLSReshareKeygenActionProvider>
        )}
        regular={() => (
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
      />
    ),
  })
}
