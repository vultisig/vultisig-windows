import {
  KeygenVault,
  KeygenVaultProvider,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { CurrentHexChainCodeProvider } from '@core/ui/mpc/state/currentHexChainCode'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useVaults } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { generateLocalPartyId } from '@vultisig/core-mpc/devices/localPartyId'
import { generateHexChainCode } from '@vultisig/core-mpc/utils/generateHexChainCode'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { pick } from '@vultisig/lib-utils/record/pick'
import { useMemo } from 'react'

import { useCore } from '../../../../state/core'

export const JoinKeygenVaultProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const [{ keygenMsg, keygenOperation }] = useCoreViewState<'joinKeygen'>()

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

    if ('singleKeygen' in keygenOperation) {
      throw new Error(
        'Post-quantum key generation requires the vault to exist on this device. Import the vault first, then scan the QR again.'
      )
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
  }, [existingVault, keygenMsg, keygenOperation])

  const { mpcDevice } = useCore()

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
