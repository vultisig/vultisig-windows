import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { generateHexChainCode } from '@core/mpc/utils/generateHexChainCode'
import {
  KeygenVault,
  KeygenVaultProvider,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { CurrentHexChainCodeProvider } from '@core/ui/mpc/state/currentHexChainCode'
import { useMpcDevice } from '@core/ui/mpc/state/mpcDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { useVaults } from '@core/ui/vault/state/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { pick } from '@lib/utils/record/pick'
import { useMemo } from 'react'

export const JoinKeygenVaultProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const { keygenMsg } = useCorePathState<'joinKeygen'>()

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

  const mpcDevice = useMpcDevice()

  const localPartyId = useMemo(
    () =>
      existingVault
        ? existingVault.localPartyId
        : generateLocalPartyId(mpcDevice),
    [existingVault, mpcDevice]
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
