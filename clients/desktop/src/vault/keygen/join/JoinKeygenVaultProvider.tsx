import {
  KeygenVault,
  KeygenVaultProvider,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { ChildrenProp } from '@lib/ui/props'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { pick } from '@lib/utils/record/pick'
import { useMemo } from 'react'

import { generateLocalPartyId } from '../../../mpc/localPartyId'
import { MpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useVaults } from '../../queries/useVaultsQuery'
import { CurrentHexChainCodeProvider } from '../../setup/state/currentHexChainCode'
import { generateHexChainCode } from '../utils/generateHexChainCode'

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

  const keygenVault: KeygenVault = useMemo(() => {
    if (existingVault) {
      return { existingVault }
    }

    const vault = {
      name: keygenMsg.vaultName,
    }

    if ('oldResharePrefix' in keygenMsg) {
      return {
        newReshareVault: {
          ...vault,
          ...pick(keygenMsg, [
            'oldResharePrefix',
            'oldParties',
            'publicKeyEcdsa',
            'hexChainCode',
          ]),
        },
      }
    }

    return {
      newVault: vault,
    }
  }, [existingVault, keygenMsg])

  const localPartyId = useMemo(
    () => (existingVault ? existingVault.localPartyId : generateLocalPartyId()),
    [existingVault]
  )

  const hexChainCode = useMemo(
    () =>
      matchRecordUnion<KeygenVault, string>(keygenVault, {
        newVault: () => generateHexChainCode(),
        newReshareVault: vault => vault.hexChainCode,
        existingVault: vault => vault.hexChainCode,
      }),
    [keygenVault]
  )

  return (
    <KeygenVaultProvider value={keygenVault}>
      <MpcLocalPartyIdProvider value={localPartyId}>
        <CurrentHexChainCodeProvider value={hexChainCode}>
          {children}
        </CurrentHexChainCodeProvider>
      </MpcLocalPartyIdProvider>
    </KeygenVaultProvider>
  )
}
