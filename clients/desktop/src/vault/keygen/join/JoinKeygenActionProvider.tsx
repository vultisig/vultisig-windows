import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { fromLibType } from '@core/mpc/types/utils/libType'
import { CreateVaultKeygenActionProvider as DKLSCreateKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { ReshareVaultKeygenActionProvider as DKLSReshareKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { JSX } from 'react'

import { MigrateVaultKeygenActionProvider } from '../../migrate/MigrateVaultKeygenActionProvider'
import { CreateVaultLegacyKeygenActionProvider as GG20CreateKeygenActionProvider } from '../create/CreateVaultLegacyKeygenActionProvider'
import { ReshareVaultLegacyKeygenActionProvider as GG20ReshareKeygenActionProvider } from '../reshare/ReshareVaultLegacyKeygenActionProvider'

export const JoinKeygenActionProvider = ({ children }: ChildrenProp) => {
  const [{ operationType, keygenMsg }] = useCoreViewState<'joinKeygen'>()
  const { libType } = keygenMsg
  const mpcLib = fromLibType(libType)

  return matchDiscriminatedUnion<KeygenOperation, JSX.Element>(
    operationType,
    'operation',
    'type',
    {
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
      migrate: () => (
        <MigrateVaultKeygenActionProvider>
          {children}
        </MigrateVaultKeygenActionProvider>
      ),
      plugin: () => (
        <DKLSReshareKeygenActionProvider>
          {children}
        </DKLSReshareKeygenActionProvider>
      ),
      regular: () => (
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
      ),
      reshare: () => (
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
      ),
    }
  )

  // <Match
  //   value={keygenType}
  //   create={() => (
  //     <Match
  //       value={mpcLib}
  //       DKLS={() => (
  //         <DKLSCreateKeygenActionProvider>
  //           {children}
  //         </DKLSCreateKeygenActionProvider>
  //       )}
  //       GG20={() => (
  //         <GG20CreateKeygenActionProvider>
  //           {children}
  //         </GG20CreateKeygenActionProvider>
  //       )}
  //     />
  //   )}
  //   reshare={() => (
  //     <Match
  //       value={mpcLib}
  //       DKLS={() => (
  //         <DKLSReshareKeygenActionProvider>
  //           {children}
  //         </DKLSReshareKeygenActionProvider>
  //       )}
  //       GG20={() => (
  //         <GG20ReshareKeygenActionProvider>
  //           {children}
  //         </GG20ReshareKeygenActionProvider>
  //       )}
  //     />
  //   )}
  //   migrate={() => (
  //     <MigrateVaultKeygenActionProvider>
  //       {children}
  //     </MigrateVaultKeygenActionProvider>
  //   )}
  // />
}
