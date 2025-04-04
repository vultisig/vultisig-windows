import {
  KeygenVault,
  KeygenVaultProvider,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { generateLocalPartyId } from '../../../mpc/localPartyId'
import { MpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useVaults } from '../../queries/useVaultsQuery'

export const JoinKeygenVaultProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const { keygenMsg } = useAppPathState<'joinKeygen'>()

  const vaults = useVaults()

  const existingVault = useMemo(() => {
    if ('publicKeyEcdsa' in keygenMsg) {
      return vaults.find(
        vault => vault.publicKeys.ecdsa === keygenMsg.publicKeyEcdsa
      )
    }
  }, [keygenMsg, vaults])

  const keygenVault: KeygenVault | null = useMemo(() => {
    if (existingVault) {
      return { existingVault }
    }

    if ('oldResharePrefix' in keygenMsg) {
      return {
        newReshareVault: {
          oldResharePrefix: keygenMsg.oldResharePrefix,
          oldParties: keygenMsg.oldParties,
        },
      }
    }

    return null
  }, [existingVault, keygenMsg])

  const localPartyId = useMemo(
    () => (existingVault ? existingVault.localPartyId : generateLocalPartyId()),
    [existingVault]
  )

  return (
    <KeygenVaultProvider value={keygenVault}>
      <MpcLocalPartyIdProvider value={localPartyId}>
        {children}
      </MpcLocalPartyIdProvider>
    </KeygenVaultProvider>
  )
}
